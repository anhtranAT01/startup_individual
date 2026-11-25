import { getCurrentAuthContext } from "@/services/data-service";
import { EmployerProfileForm } from "@/components/forms/employer-profile-form";

export const metadata = { title: "Hồ sơ doanh nghiệp" };

export default async function EmployerProfilePage() {
  const auth = await getCurrentAuthContext();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Hồ sơ Doanh nghiệp / Cửa hàng
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Thông tin minh bạch giúp sinh viên tin tưởng và tăng tỷ lệ ứng tuyển chất lượng.
        </p>
      </div>

      {auth.employerProfile ? (
        <EmployerProfileForm
          user={auth.user!}
          employer={auth.employerProfile}
        />
      ) : null}
    </div>
  );
}
