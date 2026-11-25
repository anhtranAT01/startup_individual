"use server";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { isJobExpired, slugifyVN } from "@/lib/utils";
import type {
  AppNotification,
  ApplicationStatus,
  JobStatus,
  ReportStatus,
} from "@/types/database";
import { getCurrentAuthContext } from "./data-service";
import {
  DEMO_ADMIN_ID,
  DEMO_EMPLOYER_USER_IDS,
  DEMO_STUDENT_IDS,
} from "./demo-seed-data";
import {
  hashPasswordScrypt,
  readSandboxDb,
  SANDBOX_ROLE_COOKIE,
  SANDBOX_SESSION_COOKIE,
  verifyPasswordScrypt,
  writeSandboxDb,
} from "./local-sandbox-store";

export interface ActionResult<T = unknown> {
  ok: boolean;
  message: string;
  redirectTo?: string;
  data?: T;
}

// ------------------------------------------------------------------------------
// HELPER GỬI THÔNG BÁO TRONG ỨNG DỤNG (PHẦN XII PRD)
// ------------------------------------------------------------------------------
async function pushNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: AppNotification["type"];
  link?: string | null;
}) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return;
    await supabase.from("notifications").insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link ?? null,
      is_read: false,
    });
    return;
  }

  const db = readSandboxDb();
  db.notifications.unshift({
    id: crypto.randomUUID(),
    user_id: params.userId,
    title: params.title,
    message: params.message,
    type: params.type,
    is_read: false,
    link: params.link ?? null,
    created_at: new Date().toISOString(),
  });
  writeSandboxDb(db);
}

// ==============================================================================
// 1. AUTHENTICATION ACTIONS (ĐĂNG KÝ, ĐĂNG NHẬP, ĐĂNG XUẤT, QUÊN MẬT KHẨU)
// ==============================================================================

const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Vui lòng nhập họ và tên tối thiểu 2 ký tự."),
    email: z.string().trim().email("Địa chỉ email không hợp lệ."),
    password: z.string().min(8, "Mật khẩu phải có tối thiểu 8 ký tự."),
    confirm_password: z.string(),
    // Chỉ cho phép student hoặc employer, TUYỆT ĐỐI chặn role admin từ phía người dùng!
    role: z.enum(["student", "employer"], {
      errorMap: () => ({ message: "Vai trò đăng ký không hợp lệ." }),
    }),
    company_name: z.string().optional(),
    agree_terms: z.literal(true, {
      errorMap: () => ({
        message: "Bạn cần đồng ý với Điều khoản sử dụng & Nguyên tắc an toàn.",
      }),
    }),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirm_password"],
  });

export async function registerAction(input: {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: "student" | "employer";
  company_name?: string;
  agree_terms: boolean;
}): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Thông tin đăng ký chưa hợp lệ.",
    };
  }

  const { full_name, email, password, role, company_name } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const redirectTarget =
    role === "employer" ? "/employer/profile" : "/student/profile";

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return { ok: false, message: "Không thể kết nối máy chủ xác thực Supabase." };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(
          redirectTarget
        )}`,
        data: {
          full_name,
          role, // Trigger phía PostgreSQL kiểm tra lại chỉ chấp nhận student/employer
          company_name: company_name?.trim() || full_name,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        return {
          ok: false,
          message: "Email này đã được đăng ký trên hệ thống. Vui lòng đăng nhập.",
        };
      }
      return {
        ok: false,
        message: "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.",
      };
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return {
        ok: false,
        message: "Email này đã được sử dụng cho một tài khoản khác.",
      };
    }

    // Nếu project Supabase bật yêu cầu xác nhận email trước khi tạo session:
    if (!data.session) {
      return {
        ok: true,
        message:
          "Đăng ký thành công! Vui lòng kiểm tra hộp thư email để xác nhận tài khoản trước khi đăng nhập.",
        redirectTo: "/login",
      };
    }

    revalidatePath("/", "layout");
    return {
      ok: true,
      message: "Tạo tài khoản thành công! Hãy hoàn thiện hồ sơ của bạn.",
      redirectTo: redirectTarget,
    };
  }

  // Local Sandbox Mode
  const db = readSandboxDb();
  if (db.profiles.some((p) => p.email.toLowerCase() === normalizedEmail)) {
    return {
      ok: false,
      message: "Email này đã tồn tại trên hệ thống. Vui lòng chọn email khác.",
    };
  }

  const newUserId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.profiles.unshift({
    id: newUserId,
    full_name,
    email: normalizedEmail,
    phone: null,
    avatar_url: null,
    role,
    is_active: true,
    is_demo: false,
    created_at: now,
    updated_at: now,
  });

  if (role === "student") {
    db.student_profiles.push({
      id: crypto.randomUUID(),
      user_id: newUserId,
      university: null,
      major: null,
      year_of_study: null,
      location: "Hà Nội",
      bio: null,
      skills: [],
      experience: null,
      desired_job_title: null,
      desired_salary: null,
      availability: { shifts: ["Linh hoạt"], days: [] },
      cv_url: null,
    });
  } else {
    db.employer_profiles.push({
      id: crypto.randomUUID(),
      user_id: newUserId,
      company_name: company_name?.trim() || full_name,
      description: null,
      industry: null,
      address: null,
      website: null,
      contact_email: normalizedEmail,
      contact_phone: null,
      founded_info: null,
      logo_url: null,
      verification_status: "not_submitted",
      is_demo: false,
      created_at: now,
    });
  }

  // Băm mật khẩu bằng scrypt có muối (TUYỆT ĐỐI không lưu mật khẩu dạng văn bản thuần)
  db.auth_secrets.push({
    user_id: newUserId,
    email: normalizedEmail,
    password_hash: hashPasswordScrypt(password),
  });

  writeSandboxDb(db);

  const cookieStore = await cookies();
  cookieStore.set(SANDBOX_SESSION_COOKIE, newUserId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  cookieStore.set(SANDBOX_ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: "Đăng ký tài khoản thành công! Mời bạn hoàn thiện hồ sơ.",
    redirectTo: redirectTarget,
  };
}

export async function loginAction(input: {
  email: string;
  password: string;
  remember?: boolean;
  nextUrl?: string;
}): Promise<ActionResult> {
  const email = input.email?.trim().toLowerCase() || "";
  const password = input.password || "";

  if (!email || !password) {
    return { ok: false, message: "Vui lòng nhập đầy đủ email và mật khẩu." };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return { ok: false, message: "Không thể kết nối máy chủ xác thực." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        ok: false,
        message: "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      return {
        ok: false,
        message: "Tài khoản của bạn đang bị tạm khóa. Vui lòng liên hệ quản trị viên.",
      };
    }

    const role = profile?.role || "student";
    const destination =
      input.nextUrl && input.nextUrl.startsWith("/")
        ? input.nextUrl
        : role === "admin"
        ? "/admin"
        : role === "employer"
        ? "/employer/dashboard"
        : "/student/dashboard";

    revalidatePath("/", "layout");
    return {
      ok: true,
      message: "Đăng nhập thành công!",
      redirectTo: destination,
    };
  }

  // Local Sandbox Mode
  const db = readSandboxDb();
  const secret = db.auth_secrets.find((s) => s.email === email);
  if (!secret || !verifyPasswordScrypt(password, secret.password_hash)) {
    return {
      ok: false,
      message:
        "Email hoặc mật khẩu không chính xác. (Nếu trải nghiệm dữ liệu mẫu cục bộ, bạn có thể dùng nút Chuyển nhanh vai trò Demo bên dưới hoặc Đăng ký tài khoản mới).",
    };
  }

  const profile = db.profiles.find((p) => p.id === secret.user_id);
  if (!profile || !profile.is_active) {
    return {
      ok: false,
      message: "Tài khoản đang bị tạm khóa bởi quản trị viên.",
    };
  }

  const cookieStore = await cookies();
  const maxAge = input.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 2;
  cookieStore.set(SANDBOX_SESSION_COOKIE, profile.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  cookieStore.set(SANDBOX_ROLE_COOKIE, profile.role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  const destination =
    input.nextUrl && input.nextUrl.startsWith("/")
      ? input.nextUrl
      : profile.role === "admin"
      ? "/admin"
      : profile.role === "employer"
      ? "/employer/dashboard"
      : "/student/dashboard";

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: `Chào mừng ${profile.full_name} quay trở lại!`,
    redirectTo: destination,
  };
}

/**
 * Trải nghiệm nhanh vai trò mẫu CHỈ trong môi trường Local Sandbox (khi chưa cấu hình Supabase Production)
 */
export async function sandboxSwitchDemoRoleAction(
  persona: "student" | "employer_verified" | "employer_pending" | "admin"
): Promise<ActionResult> {
  if (isSupabaseConfigured()) {
    return {
      ok: false,
      message:
        "Tính năng chuyển nhanh phiên chỉ dùng khi chạy thử cục bộ. Trên môi trường Supabase, vui lòng đăng nhập bằng tài khoản thực tế.",
    };
  }

  let targetUserId = DEMO_STUDENT_IDS[0];
  let redirectTo = "/student/dashboard";

  if (persona === "employer_verified") {
    targetUserId = DEMO_EMPLOYER_USER_IDS[0]; // Cafe Mộc Demo (Verified)
    redirectTo = "/employer/dashboard";
  } else if (persona === "employer_pending") {
    targetUserId = DEMO_EMPLOYER_USER_IDS[6]; // Fresh Food Demo (Pending verification)
    redirectTo = "/employer/verification";
  } else if (persona === "admin") {
    targetUserId = DEMO_ADMIN_ID;
    redirectTo = "/admin";
  }

  const sandboxRole =
    persona === "admin"
      ? "admin"
      : persona === "student"
      ? "student"
      : "employer";

  const cookieStore = await cookies();
  cookieStore.set(SANDBOX_SESSION_COOKIE, targetUserId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  cookieStore.set(SANDBOX_ROLE_COOKIE, sandboxRole, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: "Đã mở phiên trải nghiệm Demo cục bộ!",
    redirectTo,
  };
}

export async function logoutAction(): Promise<ActionResult> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  } else {
    const cookieStore = await cookies();
    cookieStore.delete(SANDBOX_SESSION_COOKIE);
    cookieStore.delete(SANDBOX_ROLE_COOKIE);
  }

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: "Đã đăng xuất khỏi hệ thống.",
    redirectTo: "/",
  };
}

export async function forgotPasswordAction(email: string): Promise<ActionResult> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) {
    return { ok: false, message: "Vui lòng nhập địa chỉ email hợp lệ." };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return { ok: false, message: "Không thể kết nối dịch vụ xác thực." };
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await supabase.auth.resetPasswordForEmail(normalized, {
      redirectTo: `${siteUrl}/auth/callback?next=/student/profile`,
    });
  }

  return {
    ok: true,
    message:
      "Nếu email tồn tại trên hệ thống, đường dẫn đặt lại mật khẩu đã được gửi vào hộp thư của bạn.",
  };
}

// ==============================================================================
// 2. FILE UPLOAD & SIGNED URL ACTIONS (SUPABASE STORAGE 4 BUCKETS)
// ==============================================================================

const BUCKET_RULES: Record<
  "avatars" | "company-logos" | "student-cvs" | "verification-documents",
  { maxBytes: number; mimes: string[]; isPublic: boolean }
> = {
  avatars: {
    maxBytes: 3 * 1024 * 1024,
    mimes: ["image/png", "image/jpeg", "image/webp"],
    isPublic: true,
  },
  "company-logos": {
    maxBytes: 3 * 1024 * 1024,
    mimes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
    isPublic: true,
  },
  "student-cvs": {
    maxBytes: 5 * 1024 * 1024,
    mimes: ["application/pdf"],
    isPublic: false,
  },
  "verification-documents": {
    maxBytes: 10 * 1024 * 1024,
    mimes: ["application/pdf", "image/png", "image/jpeg"],
    isPublic: false,
  },
};

export async function uploadStorageFileAction(
  formData: FormData
): Promise<ActionResult<{ url: string; path: string }>> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user) {
    return { ok: false, message: "Bạn cần đăng nhập để tải tệp tin lên." };
  }

  const bucket = formData.get("bucket") as keyof typeof BUCKET_RULES;
  const file = formData.get("file") as File | null;
  const rule = BUCKET_RULES[bucket];

  if (!rule || !file) {
    return { ok: false, message: "Yêu cầu tải tệp không hợp lệ." };
  }

  if (file.size > rule.maxBytes) {
    return {
      ok: false,
      message: `Dung lượng tệp vượt quá giới hạn cho phép (${Math.round(
        rule.maxBytes / 1024 / 1024
      )}MB).`,
    };
  }

  if (!rule.mimes.includes(file.type)) {
    return {
      ok: false,
      message: `Định dạng tệp không được hỗ trợ. Chỉ chấp nhận: ${rule.mimes.join(
        ", "
      )}.`,
    };
  }

  const safeExt = (file.name.split(".").pop() || "bin")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const objectPath = `${ctx.user.id}/${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")}.${safeExt}`;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return { ok: false, message: "Không thể kết nối Supabase Storage." };
    }

    const { error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      return {
        ok: false,
        message: "Không thể tải tệp lên kho lưu trữ. Vui lòng kiểm tra cấu hình bucket.",
      };
    }

    let finalUrl = objectPath;
    if (rule.isPublic) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
      finalUrl = data.publicUrl;
    } else {
      // Đối với bucket riêng tư (CV, giấy tờ xác minh), lưu đường dẫn chuẩn storage://bucket/path
      finalUrl = `storage://${bucket}/${objectPath}`;
    }

    return {
      ok: true,
      message: "Tải tệp lên thành công!",
      data: { url: finalUrl, path: objectPath },
    };
  }

  // Local Sandbox: lưu vào .local-db/uploads và phục vụ qua route handler được kiểm tra quyền
  const buffer = Buffer.from(await file.arrayBuffer());
  const localDir = path.join(process.cwd(), ".local-db", "uploads", bucket, ctx.user.id);
  try {
    fs.mkdirSync(localDir, { recursive: true });
    const fileName = `${Date.now()}.${safeExt}`;
    fs.writeFileSync(path.join(localDir, fileName), buffer);
    const virtualUrl = `/api/files/${bucket}/${ctx.user.id}/${fileName}`;
    return {
      ok: true,
      message: "Đã lưu tệp tin thành công!",
      data: { url: virtualUrl, path: `${ctx.user.id}/${fileName}` },
    };
  } catch {
    return { ok: false, message: "Không thể ghi tệp tin trên máy cục bộ." };
  }
}

export async function getAuthorizedFileUrlAction(
  storedUrl: string
): Promise<ActionResult<{ signedUrl: string }>> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user) {
    return { ok: false, message: "Vui lòng đăng nhập để xem tài liệu." };
  }

  if (!storedUrl.startsWith("storage://")) {
    return { ok: true, message: "OK", data: { signedUrl: storedUrl } };
  }

  const withoutScheme = storedUrl.replace("storage://", "");
  const firstSlash = withoutScheme.indexOf("/");
  const bucket = withoutScheme.slice(0, firstSlash);
  const objectPath = withoutScheme.slice(firstSlash + 1);

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return { ok: false, message: "Không thể khởi tạo phiên đọc tệp." };
    }
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(objectPath, 60 * 15); // Signed URL có thời hạn 15 phút (Phần VIII.3 PRD)

    if (error || !data?.signedUrl) {
      return {
        ok: false,
        message: "Bạn không có quyền truy cập tệp riêng tư này hoặc tệp không tồn tại.",
      };
    }

    return { ok: true, message: "OK", data: { signedUrl: data.signedUrl } };
  }

  return { ok: true, message: "OK", data: { signedUrl: storedUrl } };
}

// ==============================================================================
// 3. STUDENT ACTIONS (HỒ SƠ, LƯU VIỆC, ỨNG TUYỂN, RÚT ĐƠN, BÁO CÁO, ĐÁNH GIÁ)
// ==============================================================================

const studentProfileSchema = z.object({
  full_name: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự."),
  phone: z.string().trim().optional(),
  avatar_url: z.string().nullable().optional(),
  university: z.string().trim().optional(),
  major: z.string().trim().optional(),
  year_of_study: z.number().int().min(1).max(8).nullable().optional(),
  location: z.string().trim().optional(),
  bio: z.string().trim().max(1500).optional(),
  skills: z.array(z.string().trim()).max(20),
  experience: z.string().trim().max(2000).optional(),
  desired_job_title: z.string().trim().optional(),
  desired_salary: z.number().min(0).nullable().optional(),
  shifts: z.array(z.string()),
  days: z.array(z.string()),
  cv_url: z.string().nullable().optional(),
});

export async function updateStudentProfileAction(
  input: z.infer<typeof studentProfileSchema>
): Promise<ActionResult> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user || ctx.user.role !== "student") {
    return { ok: false, message: "Chỉ tài khoản sinh viên mới có thể cập nhật hồ sơ này." };
  }

  const parsed = studentProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Dữ liệu hồ sơ không hợp lệ.",
    };
  }
  const d = parsed.data;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    const { error: profErr } = await supabase
      .from("profiles")
      .update({
        full_name: d.full_name,
        phone: d.phone || null,
        avatar_url: d.avatar_url ?? ctx.user.avatar_url,
      })
      .eq("id", ctx.user.id);

    if (profErr) {
      return { ok: false, message: "Không thể cập nhật thông tin tài khoản." };
    }

    const { error: stuErr } = await supabase.from("student_profiles").upsert(
      {
        user_id: ctx.user.id,
        university: d.university || null,
        major: d.major || null,
        year_of_study: d.year_of_study ?? null,
        location: d.location || null,
        bio: d.bio || null,
        skills: d.skills,
        experience: d.experience || null,
        desired_job_title: d.desired_job_title || null,
        desired_salary: d.desired_salary ?? null,
        availability: { shifts: d.shifts, days: d.days },
        cv_url: d.cv_url === undefined ? ctx.studentProfile?.cv_url ?? null : d.cv_url,
      },
      { onConflict: "user_id" }
    );

    if (stuErr) {
      return { ok: false, message: "Không thể lưu hồ sơ học tập & kỹ năng." };
    }
  } else {
    const db = readSandboxDb();
    const prof = db.profiles.find((p) => p.id === ctx.user!.id);
    if (prof) {
      prof.full_name = d.full_name;
      prof.phone = d.phone || null;
      if (d.avatar_url !== undefined) prof.avatar_url = d.avatar_url;
      prof.updated_at = new Date().toISOString();
    }

    const spIdx = db.student_profiles.findIndex((s) => s.user_id === ctx.user!.id);
    const updatedSp = {
      id: spIdx >= 0 ? db.student_profiles[spIdx].id : crypto.randomUUID(),
      user_id: ctx.user.id,
      university: d.university || null,
      major: d.major || null,
      year_of_study: d.year_of_study ?? null,
      location: d.location || null,
      bio: d.bio || null,
      skills: d.skills,
      experience: d.experience || null,
      desired_job_title: d.desired_job_title || null,
      desired_salary: d.desired_salary ?? null,
      availability: { shifts: d.shifts, days: d.days },
      cv_url:
        d.cv_url === undefined
          ? spIdx >= 0
            ? db.student_profiles[spIdx].cv_url
            : null
          : d.cv_url,
    };

    if (spIdx >= 0) db.student_profiles[spIdx] = updatedSp;
    else db.student_profiles.push(updatedSp);

    writeSandboxDb(db);
  }

  revalidatePath("/student/profile");
  revalidatePath("/student/dashboard");
  revalidatePath("/jobs");
  return { ok: true, message: "Đã lưu hồ sơ sinh viên thành công!" };
}

export async function toggleSaveJobAction(
  jobId: string
): Promise<ActionResult<{ saved: boolean }>> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user) {
    return {
      ok: false,
      message: "Vui lòng đăng nhập tài khoản sinh viên để lưu công việc.",
      redirectTo: `/login?next=/jobs/${jobId}`,
    };
  }
  if (ctx.user.role !== "student") {
    return {
      ok: false,
      message: "Chức năng lưu việc làm dành riêng cho tài khoản sinh viên.",
    };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    const { data: existing } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("student_id", ctx.user.id)
      .eq("job_id", jobId)
      .maybeSingle();

    if (existing) {
      await supabase.from("saved_jobs").delete().eq("id", existing.id);
      revalidatePath(`/jobs/${jobId}`);
      revalidatePath("/student/saved-jobs");
      revalidatePath("/student/dashboard");
      return {
        ok: true,
        message: "Đã bỏ lưu công việc khỏi danh sách yêu thích.",
        data: { saved: false },
      };
    }

    await supabase.from("saved_jobs").insert({
      student_id: ctx.user.id,
      job_id: jobId,
    });
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/student/saved-jobs");
    revalidatePath("/student/dashboard");
    return {
      ok: true,
      message: "Đã lưu công việc vào mục Việc đã lưu!",
      data: { saved: true },
    };
  }

  const db = readSandboxDb();
  const idx = db.saved_jobs.findIndex(
    (s) => s.student_id === ctx.user!.id && s.job_id === jobId
  );
  if (idx >= 0) {
    db.saved_jobs.splice(idx, 1);
    writeSandboxDb(db);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/student/saved-jobs");
    revalidatePath("/student/dashboard");
    return {
      ok: true,
      message: "Đã xóa khỏi danh sách việc làm đã lưu.",
      data: { saved: false },
    };
  }

  db.saved_jobs.unshift({
    id: crypto.randomUUID(),
    student_id: ctx.user.id,
    job_id: jobId,
    created_at: new Date().toISOString(),
  });
  writeSandboxDb(db);
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/student/saved-jobs");
  revalidatePath("/student/dashboard");
  return {
    ok: true,
    message: "Đã lưu công việc thành công!",
    data: { saved: true },
  };
}

export async function submitApplicationAction(input: {
  job_id: string;
  cover_letter: string;
  relevant_experience?: string;
  available_time?: string;
  cv_url?: string | null;
}): Promise<ActionResult> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user || ctx.user.role !== "student") {
    return {
      ok: false,
      message: "Chỉ tài khoản sinh viên mới có thể gửi hồ sơ ứng tuyển.",
      redirectTo: `/login?next=/jobs/${input.job_id}/apply`,
    };
  }

  const cover = input.cover_letter?.trim() || "";
  if (cover.length < 15) {
    return {
      ok: false,
      message: "Vui lòng viết lời giới thiệu bản thân ngắn gọn (tối thiểu 15 ký tự).",
    };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, status, deadline, employer:employer_profiles(user_id)")
      .eq("id", input.job_id)
      .maybeSingle();

    if (!job) {
      return { ok: false, message: "Tin tuyển dụng không tồn tại." };
    }
    if (job.status !== "active") {
      return { ok: false, message: "Công việc này đã đóng nhận hồ sơ." };
    }
    if (isJobExpired(job.deadline)) {
      return { ok: false, message: "Công việc này đã quá thời hạn ứng tuyển." };
    }

    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", input.job_id)
      .eq("student_id", ctx.user.id)
      .maybeSingle();

    if (existing) {
      return {
        ok: false,
        message: "Bạn đã nộp đơn ứng tuyển cho công việc này trước đó rồi.",
      };
    }

    const { error } = await supabase.from("applications").insert({
      job_id: input.job_id,
      student_id: ctx.user.id,
      cover_letter: cover,
      relevant_experience: input.relevant_experience?.trim() || null,
      available_time: input.available_time?.trim() || null,
      cv_url: input.cv_url ?? ctx.studentProfile?.cv_url ?? null,
      status: "pending",
    });

    if (error) {
      return {
        ok: false,
        message: "Không thể gửi đơn ứng tuyển (có thể bạn đã ứng tuyển công việc này).",
      };
    }

    const empObj = Array.isArray(job.employer) ? job.employer[0] : job.employer;
    await pushNotification({
      userId: ctx.user.id,
      title: "Gửi hồ sơ ứng tuyển thành công",
      message: `Hồ sơ ứng tuyển vị trí "${job.title}" đã được chuyển tới nhà tuyển dụng.`,
      type: "application_submitted",
      link: "/student/applications",
    });

    if (empObj?.user_id) {
      await pushNotification({
        userId: empObj.user_id,
        title: "Bạn có ứng viên mới!",
        message: `${ctx.user.full_name} vừa ứng tuyển vào vị trí "${job.title}".`,
        type: "new_applicant",
        link: "/employer/applications",
      });
    }
  } else {
    const db = readSandboxDb();
    const job = db.jobs.find((j) => j.id === input.job_id);
    if (!job) return { ok: false, message: "Không tìm thấy công việc." };
    if (job.status !== "active") {
      return { ok: false, message: "Công việc này đã đóng nhận hồ sơ." };
    }
    if (isJobExpired(job.deadline)) {
      return { ok: false, message: "Công việc này đã hết hạn ứng tuyển." };
    }

    const duplicate = db.applications.some(
      (a) => a.job_id === input.job_id && a.student_id === ctx.user!.id
    );
    if (duplicate) {
      return {
        ok: false,
        message: "Bạn đã có đơn ứng tuyển cho công việc này rồi.",
      };
    }

    const now = new Date().toISOString();
    db.applications.unshift({
      id: crypto.randomUUID(),
      job_id: input.job_id,
      student_id: ctx.user.id,
      cover_letter: cover,
      relevant_experience: input.relevant_experience?.trim() || null,
      available_time: input.available_time?.trim() || null,
      cv_url: input.cv_url ?? ctx.studentProfile?.cv_url ?? null,
      status: "pending",
      employer_note: null,
      created_at: now,
      updated_at: now,
    });
    writeSandboxDb(db);

    const emp = db.employer_profiles.find((e) => e.id === job.employer_id);
    await pushNotification({
      userId: ctx.user.id,
      title: "Gửi hồ sơ ứng tuyển thành công",
      message: `Đơn ứng tuyển vị trí "${job.title}" đã được ghi nhận.`,
      type: "application_submitted",
      link: "/student/applications",
    });
    if (emp) {
      await pushNotification({
        userId: emp.user_id,
        title: "Có ứng viên mới ứng tuyển",
        message: `${ctx.user.full_name} vừa nộp hồ sơ cho vị trí "${job.title}".`,
        type: "new_applicant",
        link: "/employer/applications",
      });
    }
  }

  revalidatePath(`/jobs/${input.job_id}`);
  revalidatePath("/student/applications");
  revalidatePath("/student/dashboard");
  revalidatePath("/employer/applications");
  return {
    ok: true,
    message: "Gửi hồ sơ ứng tuyển thành công!",
    redirectTo: "/student/applications",
  };
}

export async function withdrawApplicationAction(
  applicationId: string
): Promise<ActionResult> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user || ctx.user.role !== "student") {
    return { ok: false, message: "Không có quyền thực hiện thao tác này." };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    const { error } = await supabase
      .from("applications")
      .update({ status: "withdrawn" })
      .eq("id", applicationId)
      .eq("student_id", ctx.user.id)
      .in("status", ["pending", "reviewed"]);

    if (error) {
      return {
        ok: false,
        message: "Chỉ có thể hủy đơn khi hồ sơ đang chờ xem hoặc mới xem.",
      };
    }
  } else {
    const db = readSandboxDb();
    const app = db.applications.find(
      (a) => a.id === applicationId && a.student_id === ctx.user!.id
    );
    if (!app || !["pending", "reviewed"].includes(app.status)) {
      return {
        ok: false,
        message: "Không thể rút hồ sơ ở trạng thái hiện tại.",
      };
    }
    app.status = "withdrawn";
    app.updated_at = new Date().toISOString();
    writeSandboxDb(db);
  }

  revalidatePath("/student/applications");
  revalidatePath("/student/dashboard");
  return { ok: true, message: "Đã rút đơn ứng tuyển thành công." };
}

export async function submitJobReportAction(input: {
  job_id: string;
  reason: string;
  description: string;
}): Promise<ActionResult> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user) {
    return {
      ok: false,
      message: "Vui lòng đăng nhập để gửi báo cáo tin tuyển dụng.",
      redirectTo: `/login?next=/jobs/${input.job_id}/report`,
    };
  }

  if (!input.reason || input.description.trim().length < 10) {
    return {
      ok: false,
      message: "Vui lòng chọn lý do và mô tả chi tiết dấu hiệu đáng ngờ (tối thiểu 10 ký tự).",
    };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    const { error } = await supabase.from("job_reports").insert({
      job_id: input.job_id,
      reporter_id: ctx.user.id,
      reason: input.reason,
      description: input.description.trim(),
      status: "pending",
    });

    if (error) {
      return { ok: false, message: "Không thể gửi báo cáo lúc này." };
    }
  } else {
    const db = readSandboxDb();
    db.job_reports.unshift({
      id: crypto.randomUUID(),
      job_id: input.job_id,
      reporter_id: ctx.user.id,
      reason: input.reason,
      description: input.description.trim(),
      status: "pending",
      admin_note: null,
      created_at: new Date().toISOString(),
    });
    writeSandboxDb(db);
  }

  await pushNotification({
    userId: ctx.user.id,
    title: "Đã tiếp nhận báo cáo tin tuyển dụng",
    message:
      "Cảm ơn bạn đã góp phần bảo vệ cộng đồng STUWORK. Ban quản trị sẽ kiểm tra tin đăng này sớm nhất.",
    type: "report_update",
    link: `/jobs/${input.job_id}`,
  });

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  return {
    ok: true,
    message:
      "Đã gửi báo cáo tới Ban quản trị STUWORK! Cảm ơn bạn đã chung tay giữ môi trường tìm việc an toàn.",
    redirectTo: `/jobs/${input.job_id}`,
  };
}

export async function submitReviewAction(input: {
  job_id: string;
  employer_id: string;
  rating: number;
  comment: string;
}): Promise<ActionResult> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user || ctx.user.role !== "student") {
    return { ok: false, message: "Chỉ sinh viên đủ điều kiện mới có thể đánh giá." };
  }

  const rating = Math.round(Number(input.rating));
  if (rating < 1 || rating > 5 || input.comment.trim().length < 8) {
    return {
      ok: false,
      message: "Vui lòng chọn từ 1–5 sao và nhập nhận xét tối thiểu 8 ký tự.",
    };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    const { error } = await supabase.from("reviews").insert({
      job_id: input.job_id,
      student_id: ctx.user.id,
      employer_id: input.employer_id,
      rating,
      comment: input.comment.trim(),
    });
    if (error) {
      return {
        ok: false,
        message: "Chỉ sinh viên đã được chấp nhận công việc và chưa đánh giá mới được gửi nhận xét.",
      };
    }
  } else {
    const db = readSandboxDb();
    const eligible = db.applications.some(
      (a) =>
        a.job_id === input.job_id &&
        a.student_id === ctx.user!.id &&
        a.status === "accepted"
    );
    if (!eligible) {
      return {
        ok: false,
        message: "Bạn cần có đơn ứng tuyển đã được chấp nhận cho công việc này để đánh giá.",
      };
    }
    db.reviews.unshift({
      id: crypto.randomUUID(),
      job_id: input.job_id,
      student_id: ctx.user.id,
      employer_id: input.employer_id,
      rating,
      comment: input.comment.trim(),
      created_at: new Date().toISOString(),
    });
    writeSandboxDb(db);
  }

  revalidatePath(`/jobs/${input.job_id}`);
  return { ok: true, message: "Cảm ơn bạn đã gửi đánh giá minh bạch sau công việc!" };
}

// ==============================================================================
// 4. EMPLOYER ACTIONS (HỒ SƠ ĐƠN VỊ, XÁC MINH, ĐĂNG/SỬA/ĐÓNG TIN, DUYỆT ỨNG VIÊN)
// ==============================================================================

export async function updateEmployerProfileAction(input: {
  full_name: string;
  company_name: string;
  industry: string;
  address: string;
  website?: string;
  contact_email: string;
  contact_phone: string;
  founded_info?: string;
  description: string;
  logo_url?: string | null;
}): Promise<ActionResult> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user || ctx.user.role !== "employer" || !ctx.employerProfile) {
    return { ok: false, message: "Chỉ tài khoản nhà tuyển dụng mới có quyền này." };
  }

  if (input.company_name.trim().length < 2) {
    return { ok: false, message: "Vui lòng nhập tên doanh nghiệp hoặc cửa hàng." };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    await supabase
      .from("profiles")
      .update({
        full_name: input.full_name.trim() || ctx.user.full_name,
        phone: input.contact_phone.trim() || null,
      })
      .eq("id", ctx.user.id);

    const { error } = await supabase
      .from("employer_profiles")
      .update({
        company_name: input.company_name.trim(),
        industry: input.industry.trim() || null,
        address: input.address.trim() || null,
        website: input.website?.trim() || null,
        contact_email: input.contact_email.trim() || ctx.user.email,
        contact_phone: input.contact_phone.trim() || null,
        founded_info: input.founded_info?.trim() || null,
        description: input.description.trim() || null,
        logo_url:
          input.logo_url === undefined
            ? ctx.employerProfile.logo_url
            : input.logo_url,
      })
      .eq("id", ctx.employerProfile.id);

    if (error) {
      return { ok: false, message: "Không thể lưu hồ sơ đơn vị tuyển dụng." };
    }
  } else {
    const db = readSandboxDb();
    const prof = db.profiles.find((p) => p.id === ctx.user!.id);
    if (prof) {
      prof.full_name = input.full_name.trim() || prof.full_name;
      prof.phone = input.contact_phone.trim() || null;
    }
    const emp = db.employer_profiles.find((e) => e.id === ctx.employerProfile!.id);
    if (emp) {
      emp.company_name = input.company_name.trim();
      emp.industry = input.industry.trim() || null;
      emp.address = input.address.trim() || null;
      emp.website = input.website?.trim() || null;
      emp.contact_email = input.contact_email.trim() || ctx.user.email;
      emp.contact_phone = input.contact_phone.trim() || null;
      emp.founded_info = input.founded_info?.trim() || null;
      emp.description = input.description.trim() || null;
      if (input.logo_url !== undefined) emp.logo_url = input.logo_url;
    }
    writeSandboxDb(db);
  }

  revalidatePath("/employer/profile");
  revalidatePath("/employer/dashboard");
  revalidatePath("/jobs");
  return { ok: true, message: "Đã cập nhật hồ sơ doanh nghiệp / cửa hàng!" };
}

export async function submitVerificationRequestAction(input: {
  business_name: string;
  representative_name: string;
  address: string;
  tax_code?: string;
  website?: string;
  contact_email: string;
  contact_phone: string;
  document_url?: string | null;
}): Promise<ActionResult> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user || ctx.user.role !== "employer" || !ctx.employerProfile) {
    return { ok: false, message: "Không có quyền gửi yêu cầu xác minh." };
  }

  if (
    !input.business_name.trim() ||
    !input.representative_name.trim() ||
    !input.address.trim() ||
    !input.contact_phone.trim()
  ) {
    return {
      ok: false,
      message: "Vui lòng điền đầy đủ tên đơn vị, người đại diện, địa chỉ và số điện thoại.",
    };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    const { error } = await supabase.from("verification_requests").insert({
      employer_id: ctx.employerProfile.id,
      business_name: input.business_name.trim(),
      representative_name: input.representative_name.trim(),
      address: input.address.trim(),
      tax_code: input.tax_code?.trim() || null,
      website: input.website?.trim() || null,
      contact_email: input.contact_email.trim(),
      contact_phone: input.contact_phone.trim(),
      document_url: input.document_url || null,
      status: "pending",
    });

    if (error) {
      return { ok: false, message: "Không thể gửi hồ sơ xác minh lúc này." };
    }

    // Sử dụng service client ở phía server để chuyển trạng thái employer sang 'pending'
    const svc = createSupabaseServiceClient();
    if (svc && ctx.employerProfile.verification_status !== "verified") {
      await svc
        .from("employer_profiles")
        .update({ verification_status: "pending" })
        .eq("id", ctx.employerProfile.id);
    }
  } else {
    const db = readSandboxDb();
    db.verification_requests.unshift({
      id: crypto.randomUUID(),
      employer_id: ctx.employerProfile.id,
      business_name: input.business_name.trim(),
      representative_name: input.representative_name.trim(),
      address: input.address.trim(),
      tax_code: input.tax_code?.trim() || null,
      website: input.website?.trim() || null,
      contact_email: input.contact_email.trim(),
      contact_phone: input.contact_phone.trim(),
      document_url: input.document_url || null,
      status: "pending",
      admin_note: null,
      reviewed_by: null,
      created_at: new Date().toISOString(),
    });
    const emp = db.employer_profiles.find((e) => e.id === ctx.employerProfile!.id);
    if (emp && emp.verification_status !== "verified") {
      emp.verification_status = "pending";
    }
    writeSandboxDb(db);
  }

  revalidatePath("/employer/verification");
  revalidatePath("/employer/dashboard");
  revalidatePath("/admin/verifications");
  return {
    ok: true,
    message:
      "Đã gửi hồ sơ yêu cầu xác minh! Quản trị viên sẽ kiểm tra và phản hồi sớm nhất.",
  };
}

const jobInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(5, "Tên công việc cần tối thiểu 5 ký tự."),
  category: z.string().trim().min(2, "Vui lòng chọn danh mục công việc."),
  job_type: z.enum(["Part-time", "Full-time", "Freelance", "Remote", "Internship"]),
  work_mode: z.enum(["Onsite", "Remote", "Hybrid"]),
  salary_min: z.number().min(0).nullable(),
  salary_max: z.number().min(0).nullable(),
  salary_unit: z.enum(["hour", "day", "month", "project"]),
  location: z.string().trim().min(2, "Vui lòng nhập địa điểm làm việc."),
  working_time: z.string().trim().min(2, "Vui lòng nhập khung thời gian làm việc."),
  vacancies: z.number().int().min(1, "Số lượng tuyển tối thiểu là 1."),
  deadline: z.string().nullable(),
  contact_info: z.string().trim().optional(),
  description: z.string().trim().min(20, "Mô tả công việc cần tối thiểu 20 ký tự."),
  requirements: z.string().trim().min(10, "Yêu cầu ứng viên cần tối thiểu 10 ký tự."),
  benefits: z.string().trim().min(10, "Quyền lợi cần tối thiểu 10 ký tự."),
  intent: z.enum(["draft", "publish"]),
});

export async function saveJobAction(
  rawInput: z.infer<typeof jobInputSchema>
): Promise<ActionResult<{ jobId: string }>> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user || ctx.user.role !== "employer" || !ctx.employerProfile) {
    return { ok: false, message: "Chỉ nhà tuyển dụng mới có thể đăng hoặc sửa tin." };
  }

  const parsed = jobInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Thông tin tin tuyển dụng chưa đầy đủ.",
    };
  }

  const d = parsed.data;
  if (
    d.salary_min != null &&
    d.salary_max != null &&
    d.salary_max < d.salary_min
  ) {
    return {
      ok: false,
      message: "Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu.",
    };
  }

  // Quy tắc nghiệp vụ cốt lõi (Phần II.2 & IV.10 PRD):
  // Nhà tuyển dụng CHƯA XÁC MINH không được tự xuất bản tin active!
  const isVerified = ctx.employerProfile.verification_status === "verified";
  let targetStatus: JobStatus = "draft";

  if (d.intent === "publish") {
    if (!isVerified) {
      return {
        ok: false,
        message:
          "Tài khoản của bạn chưa hoàn tất xác minh nên chưa thể xuất bản công khai. Vui lòng chọn 'Lưu bản nháp' và gửi hồ sơ tại mục Xác minh tài khoản.",
      };
    }
    targetStatus = "active";
  }

  const baseSlug = `${slugifyVN(d.title)}-${crypto.randomBytes(3).toString("hex")}`;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    if (d.id) {
      const { error } = await supabase
        .from("jobs")
        .update({
          title: d.title,
          category: d.category,
          job_type: d.job_type,
          work_mode: d.work_mode,
          salary_min: d.salary_min,
          salary_max: d.salary_max,
          salary_unit: d.salary_unit,
          location: d.location,
          working_time: d.working_time,
          vacancies: d.vacancies,
          deadline: d.deadline || null,
          contact_info: d.contact_info || null,
          description: d.description,
          requirements: d.requirements,
          benefits: d.benefits,
          status: targetStatus,
        })
        .eq("id", d.id)
        .eq("employer_id", ctx.employerProfile.id);

      if (error) {
        return { ok: false, message: "Không thể cập nhật tin tuyển dụng." };
      }

      revalidatePath("/employer/jobs");
      revalidatePath("/employer/dashboard");
      revalidatePath("/jobs");
      revalidatePath(`/jobs/${d.id}`);
      return {
        ok: true,
        message:
          targetStatus === "active"
            ? "Đã cập nhật và xuất bản tin tuyển dụng!"
            : "Đã lưu bản nháp tin tuyển dụng.",
        redirectTo: "/employer/jobs",
        data: { jobId: d.id },
      };
    }

    const { data: inserted, error } = await supabase
      .from("jobs")
      .insert({
        employer_id: ctx.employerProfile.id,
        title: d.title,
        slug: baseSlug,
        category: d.category,
        job_type: d.job_type,
        work_mode: d.work_mode,
        salary_min: d.salary_min,
        salary_max: d.salary_max,
        salary_unit: d.salary_unit,
        location: d.location,
        working_time: d.working_time,
        vacancies: d.vacancies,
        deadline: d.deadline || null,
        contact_info: d.contact_info || null,
        description: d.description,
        requirements: d.requirements,
        benefits: d.benefits,
        status: targetStatus,
        is_demo: Boolean(ctx.employerProfile.is_demo),
      })
      .select("id")
      .single();

    if (error || !inserted) {
      return { ok: false, message: "Không thể tạo tin tuyển dụng mới." };
    }

    revalidatePath("/employer/jobs");
    revalidatePath("/employer/dashboard");
    revalidatePath("/jobs");
    return {
      ok: true,
      message:
        targetStatus === "active"
          ? "Đăng tin tuyển dụng thành công!"
          : "Đã lưu tin tuyển dụng ở chế độ bản nháp.",
      redirectTo: "/employer/jobs",
      data: { jobId: inserted.id },
    };
  }

  // Local Sandbox
  const db = readSandboxDb();
  const now = new Date().toISOString();

  if (d.id) {
    const existing = db.jobs.find(
      (j) => j.id === d.id && j.employer_id === ctx.employerProfile!.id
    );
    if (!existing) {
      return { ok: false, message: "Bạn không có quyền chỉnh sửa tin tuyển dụng này." };
    }
    Object.assign(existing, {
      title: d.title,
      category: d.category,
      job_type: d.job_type,
      work_mode: d.work_mode,
      salary_min: d.salary_min,
      salary_max: d.salary_max,
      salary_unit: d.salary_unit,
      location: d.location,
      working_time: d.working_time,
      vacancies: d.vacancies,
      deadline: d.deadline || null,
      contact_info: d.contact_info || null,
      description: d.description,
      requirements: d.requirements,
      benefits: d.benefits,
      status: targetStatus,
      updated_at: now,
    });
    writeSandboxDb(db);
    revalidatePath("/employer/jobs");
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${d.id}`);
    return {
      ok: true,
      message:
        targetStatus === "active"
          ? "Đã cập nhật & hiển thị tin tuyển dụng!"
          : "Đã lưu bản nháp thành công.",
      redirectTo: "/employer/jobs",
      data: { jobId: d.id },
    };
  }

  const newId = crypto.randomUUID();
  db.jobs.unshift({
    id: newId,
    employer_id: ctx.employerProfile.id,
    title: d.title,
    slug: baseSlug,
    category: d.category,
    job_type: d.job_type,
    work_mode: d.work_mode,
    salary_min: d.salary_min,
    salary_max: d.salary_max,
    salary_unit: d.salary_unit,
    location: d.location,
    working_time: d.working_time,
    vacancies: d.vacancies,
    deadline: d.deadline || null,
    contact_info: d.contact_info || null,
    views_count: 0,
    description: d.description,
    requirements: d.requirements,
    benefits: d.benefits,
    status: targetStatus,
    is_demo: Boolean(ctx.employerProfile.is_demo),
    created_at: now,
    updated_at: now,
  });
  writeSandboxDb(db);

  revalidatePath("/employer/jobs");
  revalidatePath("/employer/dashboard");
  revalidatePath("/jobs");
  return {
    ok: true,
    message:
      targetStatus === "active"
        ? "Xuất bản tin tuyển dụng thành công!"
        : "Đã lưu bản nháp tin tuyển dụng!",
    redirectTo: "/employer/jobs",
    data: { jobId: newId },
  };
}

export async function toggleEmployerJobStatusAction(
  jobId: string,
  nextStatus: "active" | "closed"
): Promise<ActionResult> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user || ctx.user.role !== "employer" || !ctx.employerProfile) {
    return { ok: false, message: "Không có quyền thực hiện thao tác này." };
  }

  if (
    nextStatus === "active" &&
    ctx.employerProfile.verification_status !== "verified"
  ) {
    return {
      ok: false,
      message: "Cần hoàn tất xác minh nhà tuyển dụng trước khi mở lại tin tuyển dụng.",
    };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    const { error } = await supabase
      .from("jobs")
      .update({ status: nextStatus })
      .eq("id", jobId)
      .eq("employer_id", ctx.employerProfile.id);

    if (error) {
      return { ok: false, message: "Không thể đổi trạng thái tin tuyển dụng." };
    }
  } else {
    const db = readSandboxDb();
    const job = db.jobs.find(
      (j) => j.id === jobId && j.employer_id === ctx.employerProfile!.id
    );
    if (!job) {
      return { ok: false, message: "Không tìm thấy tin tuyển dụng thuộc đơn vị của bạn." };
    }
    job.status = nextStatus;
    job.updated_at = new Date().toISOString();
    writeSandboxDb(db);
  }

  revalidatePath("/employer/jobs");
  revalidatePath("/employer/dashboard");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  return {
    ok: true,
    message:
      nextStatus === "closed"
        ? "Đã đóng nhận hồ sơ cho tin tuyển dụng."
        : "Đã mở lại tin tuyển dụng!",
  };
}

export async function updateApplicationStatusAction(input: {
  applicationId: string;
  status: ApplicationStatus;
  employer_note?: string;
}): Promise<ActionResult> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user || ctx.user.role !== "employer" || !ctx.employerProfile) {
    return { ok: false, message: "Chỉ nhà tuyển dụng mới có quyền duyệt ứng viên." };
  }

  const statusLabels: Record<ApplicationStatus, string> = {
    pending: "Chờ xem",
    reviewed: "Đã xem hồ sơ",
    shortlisted: "Danh sách tiềm năng",
    accepted: "Được chấp nhận",
    rejected: "Chưa phù hợp",
    withdrawn: "Đã rút hồ sơ",
  };

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    const { data: appRow } = await supabase
      .from("applications")
      .select("id, student_id, job:jobs(id, title, employer_id)")
      .eq("id", input.applicationId)
      .maybeSingle();

    const jobObj = appRow
      ? Array.isArray(appRow.job)
        ? appRow.job[0]
        : appRow.job
      : null;

    if (!appRow || !jobObj || jobObj.employer_id !== ctx.employerProfile.id) {
      return {
        ok: false,
        message: "Bạn chỉ được cập nhật ứng viên thuộc các công việc do đơn vị mình đăng.",
      };
    }

    const { error } = await supabase
      .from("applications")
      .update({
        status: input.status,
        employer_note: input.employer_note?.trim() ?? null,
      })
      .eq("id", input.applicationId);

    if (error) {
      return { ok: false, message: "Không thể cập nhật trạng thái ứng tuyển." };
    }

    await pushNotification({
      userId: appRow.student_id,
      title: `Cập nhật hồ sơ: ${statusLabels[input.status]}`,
      message: `${ctx.employerProfile.company_name} đã chuyển trạng thái ứng tuyển vị trí "${jobObj.title}" sang "${statusLabels[input.status]}".`,
      type: "application_status",
      link: "/student/applications",
    });
  } else {
    const db = readSandboxDb();
    const app = db.applications.find((a) => a.id === input.applicationId);
    const job = app ? db.jobs.find((j) => j.id === app.job_id) : null;
    if (!app || !job || job.employer_id !== ctx.employerProfile.id) {
      return {
        ok: false,
        message: "Không được phép truy cập đơn ứng tuyển của nhà tuyển dụng khác.",
      };
    }

    app.status = input.status;
    if (input.employer_note !== undefined) {
      app.employer_note = input.employer_note.trim() || null;
    }
    app.updated_at = new Date().toISOString();
    writeSandboxDb(db);

    await pushNotification({
      userId: app.student_id,
      title: `Cập nhật hồ sơ: ${statusLabels[input.status]}`,
      message: `${ctx.employerProfile.company_name} đã cập nhật đơn ứng tuyển vị trí "${job.title}" sang "${statusLabels[input.status]}".`,
      type: "application_status",
      link: "/student/applications",
    });
  }

  revalidatePath("/employer/applications");
  revalidatePath("/employer/dashboard");
  revalidatePath("/student/applications");
  return { ok: true, message: "Đã cập nhật trạng thái ứng viên và gửi thông báo!" };
}

// ==============================================================================
// 5. ADMIN ACTIONS (XÁC MINH, QUẢN LÝ TÀI KHOẢN, ẨN TIN, XỬ LÝ BÁO CÁO + ADMIN LOGS)
// ==============================================================================

async function requireAdminContext() {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user || ctx.user.role !== "admin") {
    return null;
  }
  return ctx.user;
}

export async function adminReviewVerificationAction(input: {
  requestId: string;
  employerId: string;
  decision: "verified" | "rejected";
  admin_note?: string;
}): Promise<ActionResult> {
  const admin = await requireAdminContext();
  if (!admin) {
    return { ok: false, message: "Từ chối truy cập: Chỉ Quản trị viên mới có quyền này." };
  }

  let employerUserId: string | null = null;
  let companyName = "Đơn vị tuyển dụng";

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    const { data: empRow } = await supabase
      .from("employer_profiles")
      .select("user_id, company_name")
      .eq("id", input.employerId)
      .maybeSingle();

    employerUserId = empRow?.user_id ?? null;
    companyName = empRow?.company_name || companyName;

    await Promise.all([
      supabase
        .from("verification_requests")
        .update({
          status: input.decision,
          admin_note: input.admin_note?.trim() || null,
          reviewed_by: admin.id,
        })
        .eq("id", input.requestId),
      supabase
        .from("employer_profiles")
        .update({ verification_status: input.decision })
        .eq("id", input.employerId),
      supabase.from("admin_logs").insert({
        admin_id: admin.id,
        action:
          input.decision === "verified"
            ? "approve_verification"
            : "reject_verification",
        target_type: "verification",
        target_id: input.requestId,
        note: input.admin_note?.trim() || `Xử lý xác minh cho ${companyName}`,
      }),
    ]);
  } else {
    const db = readSandboxDb();
    const req = db.verification_requests.find((v) => v.id === input.requestId);
    const emp = db.employer_profiles.find((e) => e.id === input.employerId);
    if (req) {
      req.status = input.decision;
      req.admin_note = input.admin_note?.trim() || null;
      req.reviewed_by = admin.id;
    }
    if (emp) {
      emp.verification_status = input.decision;
      employerUserId = emp.user_id;
      companyName = emp.company_name;
    }
    db.admin_logs.unshift({
      id: crypto.randomUUID(),
      admin_id: admin.id,
      action:
        input.decision === "verified"
          ? "approve_verification"
          : "reject_verification",
      target_type: "verification",
      target_id: input.requestId,
      note: input.admin_note?.trim() || `Cập nhật xác minh ${companyName}`,
      created_at: new Date().toISOString(),
    });
    writeSandboxDb(db);
  }

  if (employerUserId) {
    await pushNotification({
      userId: employerUserId,
      title:
        input.decision === "verified"
          ? "Tài khoản nhà tuyển dụng đã được xác minh!"
          : "Yêu cầu xác minh chưa được duyệt",
      message:
        input.decision === "verified"
          ? `Chúc mừng ${companyName}! Bạn đã có nhãn Đã xác minh và có thể xuất bản tin tuyển dụng ngay.`
          : `Hồ sơ xác minh của ${companyName} cần bổ sung thêm thông tin: ${
              input.admin_note || "Vui lòng kiểm tra lại giấy tờ."
            }`,
      type:
        input.decision === "verified"
          ? "verification_approved"
          : "verification_rejected",
      link: "/employer/verification",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/verifications");
  revalidatePath("/admin/employers");
  revalidatePath("/employer/verification");
  revalidatePath("/jobs");
  return {
    ok: true,
    message:
      input.decision === "verified"
        ? `Đã duyệt xác minh cho ${companyName}!`
        : `Đã từ chối yêu cầu xác minh của ${companyName}.`,
  };
}

export async function adminToggleUserActiveAction(input: {
  userId: string;
  isActive: boolean;
  note?: string;
}): Promise<ActionResult> {
  const admin = await requireAdminContext();
  if (!admin) {
    return { ok: false, message: "Chỉ Quản trị viên mới có quyền khóa/mở khóa tài khoản." };
  }
  if (input.userId === admin.id) {
    return { ok: false, message: "Không thể tự khóa tài khoản quản trị đang đăng nhập." };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    await Promise.all([
      supabase
        .from("profiles")
        .update({ is_active: input.isActive })
        .eq("id", input.userId),
      supabase.from("admin_logs").insert({
        admin_id: admin.id,
        action: input.isActive ? "unlock_user" : "lock_user",
        target_type: "user",
        target_id: input.userId,
        note: input.note?.trim() || null,
      }),
    ]);
  } else {
    const db = readSandboxDb();
    const user = db.profiles.find((u) => u.id === input.userId);
    if (!user) return { ok: false, message: "Không tìm thấy người dùng." };
    user.is_active = input.isActive;
    db.admin_logs.unshift({
      id: crypto.randomUUID(),
      admin_id: admin.id,
      action: input.isActive ? "unlock_user" : "lock_user",
      target_type: "user",
      target_id: input.userId,
      note: input.note?.trim() || `${input.isActive ? "Mở khóa" : "Khóa"} ${user.email}`,
      created_at: new Date().toISOString(),
    });
    writeSandboxDb(db);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return {
    ok: true,
    message: input.isActive
      ? "Đã mở khóa tài khoản người dùng."
      : "Đã khóa tài khoản vi phạm.",
  };
}

export async function adminModerateJobAction(input: {
  jobId: string;
  status: JobStatus;
  note?: string;
}): Promise<ActionResult> {
  const admin = await requireAdminContext();
  if (!admin) {
    return { ok: false, message: "Chỉ Quản trị viên mới có quyền kiểm duyệt tin đăng." };
  }

  let employerUserId: string | null = null;
  let jobTitle = "Tin tuyển dụng";

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    const { data: jobRow } = await supabase
      .from("jobs")
      .select("title, employer:employer_profiles(user_id)")
      .eq("id", input.jobId)
      .maybeSingle();

    jobTitle = jobRow?.title || jobTitle;
    const empObj = jobRow
      ? Array.isArray(jobRow.employer)
        ? jobRow.employer[0]
        : jobRow.employer
      : null;
    employerUserId = empObj?.user_id ?? null;

    await Promise.all([
      supabase.from("jobs").update({ status: input.status }).eq("id", input.jobId),
      supabase.from("admin_logs").insert({
        admin_id: admin.id,
        action: `moderate_job_${input.status}`,
        target_type: "job",
        target_id: input.jobId,
        note: input.note?.trim() || `Chuyển trạng thái "${jobTitle}" -> ${input.status}`,
      }),
    ]);
  } else {
    const db = readSandboxDb();
    const job = db.jobs.find((j) => j.id === input.jobId);
    if (!job) return { ok: false, message: "Không tìm thấy tin tuyển dụng." };
    job.status = input.status;
    jobTitle = job.title;
    const emp = db.employer_profiles.find((e) => e.id === job.employer_id);
    employerUserId = emp?.user_id ?? null;

    db.admin_logs.unshift({
      id: crypto.randomUUID(),
      admin_id: admin.id,
      action: `moderate_job_${input.status}`,
      target_type: "job",
      target_id: input.jobId,
      note: input.note?.trim() || `Cập nhật trạng thái "${job.title}" -> ${input.status}`,
      created_at: new Date().toISOString(),
    });
    writeSandboxDb(db);
  }

  if (employerUserId) {
    await pushNotification({
      userId: employerUserId,
      title:
        input.status === "active"
          ? "Tin tuyển dụng đã được duyệt hiển thị"
          : "Tin tuyển dụng đã bị ẩn / từ chối",
      message: `Tin "${jobTitle}" đã được quản trị viên chuyển sang trạng thái "${input.status}". ${
        input.note ? `Ghi chú: ${input.note}` : ""
      }`,
      type: input.status === "active" ? "job_approved" : "job_rejected",
      link: "/employer/jobs",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${input.jobId}`);
  return { ok: true, message: `Đã cập nhật trạng thái tin tuyển dụng thành "${input.status}".` };
}

export async function adminResolveReportAction(input: {
  reportId: string;
  status: ReportStatus;
  admin_note: string;
  hideJob?: boolean;
}): Promise<ActionResult> {
  const admin = await requireAdminContext();
  if (!admin) {
    return { ok: false, message: "Chỉ Quản trị viên mới có quyền xử lý báo cáo." };
  }

  let reporterId: string | null = null;
  let jobId: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { ok: false, message: "Mất kết nối cơ sở dữ liệu." };

    const { data: rep } = await supabase
      .from("job_reports")
      .select("reporter_id, job_id")
      .eq("id", input.reportId)
      .maybeSingle();

    reporterId = rep?.reporter_id ?? null;
    jobId = rep?.job_id ?? null;

    await supabase
      .from("job_reports")
      .update({
        status: input.status,
        admin_note: input.admin_note.trim() || null,
      })
      .eq("id", input.reportId);

    if (input.hideJob && jobId) {
      await supabase.from("jobs").update({ status: "rejected" }).eq("id", jobId);
    }

    await supabase.from("admin_logs").insert({
      admin_id: admin.id,
      action: `handle_report_${input.status}${input.hideJob ? "_and_hide_job" : ""}`,
      target_type: "report",
      target_id: input.reportId,
      note: input.admin_note.trim() || null,
    });
  } else {
    const db = readSandboxDb();
    const rep = db.job_reports.find((r) => r.id === input.reportId);
    if (!rep) return { ok: false, message: "Không tìm thấy báo cáo." };
    rep.status = input.status;
    rep.admin_note = input.admin_note.trim() || null;
    reporterId = rep.reporter_id;
    jobId = rep.job_id;

    if (input.hideJob) {
      const job = db.jobs.find((j) => j.id === rep.job_id);
      if (job) job.status = "rejected";
    }

    db.admin_logs.unshift({
      id: crypto.randomUUID(),
      admin_id: admin.id,
      action: `handle_report_${input.status}${input.hideJob ? "_and_hide_job" : ""}`,
      target_type: "report",
      target_id: input.reportId,
      note: input.admin_note.trim() || "Đã xử lý báo cáo của người dùng",
      created_at: new Date().toISOString(),
    });
    writeSandboxDb(db);
  }

  if (reporterId) {
    await pushNotification({
      userId: reporterId,
      title: "Báo cáo vi phạm của bạn đã được xử lý",
      message: `Ban quản trị đã xem xét báo cáo của bạn (${input.status}). Phản hồi: ${
        input.admin_note || "Cảm ơn đóng góp của bạn!"
      }`,
      type: "report_update",
      link: jobId ? `/jobs/${jobId}` : "/jobs",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  return {
    ok: true,
    message: input.hideJob
      ? "Đã xử lý báo cáo và ẩn tin tuyển dụng vi phạm!"
      : "Đã cập nhật kết quả xử lý báo cáo!",
  };
}

// ==============================================================================
// 6. NOTIFICATION ACTIONS
// ==============================================================================

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user) return { ok: false, message: "Chưa đăng nhập." };

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", ctx.user.id);
    }
  } else {
    const db = readSandboxDb();
    const item = db.notifications.find(
      (n) => n.id === id && n.user_id === ctx.user!.id
    );
    if (item) item.is_read = true;
    writeSandboxDb(db);
  }

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return { ok: true, message: "Đã đánh dấu đã đọc." };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const ctx = await getCurrentAuthContext();
  if (!ctx.user) return { ok: false, message: "Chưa đăng nhập." };

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", ctx.user.id)
        .eq("is_read", false);
    }
  } else {
    const db = readSandboxDb();
    db.notifications.forEach((n) => {
      if (n.user_id === ctx.user!.id) n.is_read = true;
    });
    writeSandboxDb(db);
  }

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return { ok: true, message: "Đã đánh dấu toàn bộ thông báo là đã đọc." };
}
