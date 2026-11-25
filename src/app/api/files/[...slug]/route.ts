import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentAuthContext } from "@/services/data-service";
import { readSandboxDb } from "@/services/local-sandbox-store";

/**
 * Route phục vụ tệp tin tải lên trong chế độ Local Sandbox có kiểm tra phân quyền chặt chẽ
 * (Mô phỏng đúng cơ chế Private Bucket của Supabase Storage cho CV & Tài liệu xác minh)
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  if (!slug || slug.length < 3) {
    return new NextResponse("Not found", { status: 404 });
  }

  const [bucket, ownerId, fileName] = slug;
  const safeBucket = bucket.replace(/[^a-z-]/g, "");
  const safeOwner = ownerId.replace(/[^a-zA-Z0-9-]/g, "");
  const safeFile = path.basename(fileName);

  // Kiểm tra quyền truy cập đối với bucket riêng tư (CV sinh viên & Tài liệu xác minh)
  if (safeBucket === "student-cvs" || safeBucket === "verification-documents") {
    const ctx = await getCurrentAuthContext();
    if (!ctx.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isOwner = ctx.user.id === safeOwner;
    const isAdmin = ctx.user.role === "admin";
    let isAuthorizedEmployer = false;

    if (
      safeBucket === "student-cvs" &&
      ctx.user.role === "employer" &&
      ctx.employerProfile
    ) {
      const db = readSandboxDb();
      const empJobIds = new Set(
        db.jobs
          .filter((j) => j.employer_id === ctx.employerProfile!.id)
          .map((j) => j.id)
      );
      isAuthorizedEmployer = db.applications.some(
        (a) => a.student_id === safeOwner && empJobIds.has(a.job_id)
      );
    }

    if (!isOwner && !isAdmin && !isAuthorizedEmployer) {
      return new NextResponse("Forbidden: Private file protected", { status: 403 });
    }
  }

  const fullPath = path.join(
    process.cwd(),
    ".local-db",
    "uploads",
    safeBucket,
    safeOwner,
    safeFile
  );

  if (!fs.existsSync(fullPath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const ext = path.extname(safeFile).toLowerCase();
  const contentType =
    ext === ".pdf"
      ? "application/pdf"
      : ext === ".png"
      ? "image/png"
      : ext === ".webp"
      ? "image/webp"
      : ext === ".svg"
      ? "image/svg+xml"
      : "image/jpeg";

  const fileBuffer = fs.readFileSync(fullPath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
    },
  });
}
