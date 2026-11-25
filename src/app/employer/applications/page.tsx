import {
  getCurrentAuthContext,
  getEmployerPortalData,
} from "@/services/data-service";
import { EmployerApplicationsClient } from "@/components/dashboard/employer-applications-client";

export const metadata = { title: "Quản lý hồ sơ ứng viên" };

export default async function EmployerApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const auth = await getCurrentAuthContext();
  const data = await getEmployerPortalData(auth.user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Quản lý Ứng viên
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Xem hồ sơ sinh viên ứng tuyển vào các công việc của đơn vị bạn và cập nhật kết quả trực tuyến.
        </p>
      </div>

      <EmployerApplicationsClient
        applications={data?.applications || []}
        jobs={data?.jobs || []}
        initialJobId={sp.job}
      />
    </div>
  );
}
