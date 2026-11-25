import { redirect } from "next/navigation";
import { getCurrentAuthContext } from "@/services/data-service";
import { StudentProfileForm } from "@/components/forms/student-profile-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hồ sơ cá nhân Sinh viên" };

export default async function StudentProfilePage() {
  const auth = await getCurrentAuthContext();
  if (!auth.user) {
    redirect("/login?next=/student/profile");
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Hồ sơ Cá nhân Sinh viên
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Hoàn thiện hồ sơ kỹ năng, lịch học và đính kèm CV để ứng tuyển chỉ với 1 cú nhấp chuột.
        </p>
      </div>

      <StudentProfileForm
        user={auth.user!}
        studentProfile={auth.studentProfile}
      />
    </div>
  );
}
