import Link from "next/link";
import { PlusCircle } from "lucide-react";
import {
  getCurrentAuthContext,
  getEmployerPortalData,
} from "@/services/data-service";
import { EmployerJobsClient } from "@/components/dashboard/employer-jobs-client";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Quản lý tin tuyển dụng" };

export default async function EmployerJobsPage() {
  const auth = await getCurrentAuthContext();
  const data = await getEmployerPortalData(auth.user!.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Các Công việc Đã đăng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi lượt xem, số lượng ứng viên và chủ động đóng/mở lại đợt tuyển dụng.
          </p>
        </div>
        <Link href="/employer/jobs/create">
          <Button variant="primary">
            <PlusCircle className="h-4 w-4" />
            Đăng tin mới
          </Button>
        </Link>
      </div>

      <EmployerJobsClient jobs={data?.jobs || []} />
    </div>
  );
}
