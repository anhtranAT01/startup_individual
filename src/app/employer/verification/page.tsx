import {
  getCurrentAuthContext,
  getEmployerPortalData,
} from "@/services/data-service";
import { EmployerVerificationForm } from "@/components/forms/employer-verification-form";

export const metadata = { title: "Xác minh nhà tuyển dụng" };

export default async function EmployerVerificationPage() {
  const auth = await getCurrentAuthContext();
  const data = await getEmployerPortalData(auth.user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Xác minh Tài khoản Nhà tuyển dụng
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Hoàn tất xác minh để nhận huy hiệu uy tín và mở quyền xuất bản tin tuyển dụng trên STUWORK.
        </p>
      </div>

      {auth.employerProfile ? (
        <EmployerVerificationForm
          user={auth.user!}
          employer={auth.employerProfile}
          history={data?.verifications || []}
        />
      ) : null}
    </div>
  );
}
