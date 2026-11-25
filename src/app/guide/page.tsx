import Link from "next/link";
import { Building2, GraduationCap, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Hướng dẫn sử dụng" };

export default function GuidePage() {
  return (
    <div className="container py-14 max-w-5xl space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Hướng dẫn sử dụng nền tảng STUWORK
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Quy trình 3 vai trò khép kín giúp sinh viên ứng tuyển nhanh chóng và nhà tuyển dụng tiếp cận đúng nhân sự.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">1. Dành cho Sinh viên</h2>
          <ol className="text-sm text-slate-600 space-y-2 list-decimal pl-4">
            <li>Đăng ký tài khoản với vai trò <strong>Sinh viên</strong>.</li>
            <li>Cập nhật trường học, kỹ năng, lịch rảnh và tải CV PDF lên.</li>
            <li>Tìm kiếm, lọc công việc theo ca học và nhãn <strong>Đã xác minh</strong>.</li>
            <li>Gửi lời giới thiệu ứng tuyển và theo dõi phản hồi trực tuyến.</li>
          </ol>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
            <Building2 className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">2. Dành cho Nhà tuyển dụng</h2>
          <ol className="text-sm text-slate-600 space-y-2 list-decimal pl-4">
            <li>Đăng ký tài khoản <strong>Nhà tuyển dụng</strong> và hoàn thiện thông tin đơn vị.</li>
            <li>Gửi yêu cầu xác minh tại mục <strong>Xác minh tài khoản</strong>.</li>
            <li>Trong khi chờ duyệt có thể lưu bản nháp; sau khi xác minh được xuất bản tin.</li>
            <li>Xem CV ứng viên, ghi chú nội bộ và cập nhật trạng thái duyệt hồ sơ.</li>
          </ol>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">3. Cơ chế Kiểm duyệt</h2>
          <ol className="text-sm text-slate-600 space-y-2 list-decimal pl-4">
            <li>Không cho phép tự gắn nhãn xác minh hoặc tự chọn quyền quản trị.</li>
            <li>Mọi báo cáo tin đáng ngờ đều được ghi nhận để Admin đối chiếu.</li>
            <li>Không thu phí và không giữ tiền của bất kỳ người dùng nào.</li>
          </ol>
        </Card>
      </div>

      <div className="text-center">
        <Link href="/jobs">
          <Button variant="primary" size="lg">Bắt đầu khám phá công việc</Button>
        </Link>
      </div>
    </div>
  );
}
