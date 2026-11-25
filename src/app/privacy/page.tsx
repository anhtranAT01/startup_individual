import { Card } from "@/components/ui/card";

export const metadata = { title: "Chính sách quyền riêng tư" };

export default function PrivacyPage() {
  return (
    <div className="container py-14 max-w-3xl">
      <Card className="p-8 space-y-5">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Chính sách Quyền riêng tư & Bảo vệ Dữ liệu Cá nhân
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          STUWORK đặt an toàn thông tin của sinh viên lên hàng đầu thông qua cơ chế phân quyền Row Level Security (RLS) và lưu trữ tệp riêng tư:
        </p>
        <ul className="space-y-3 text-sm text-slate-700 list-disc pl-5 leading-relaxed">
          <li>
            <strong>Bảo mật thông tin liên hệ:</strong> Số điện thoại và email của sinh viên không hiển thị công khai trên nền tảng; chỉ nhà tuyển dụng nhận được đơn ứng tuyển hợp lệ của bạn mới có quyền xem để liên hệ phỏng vấn.
          </li>
          <li>
            <strong>Lưu trữ CV riêng tư:</strong> Tệp CV PDF được lưu trong kho lưu trữ riêng tư (Private Bucket) và truy cập qua đường dẫn ký số có thời hạn (Signed URL).
          </li>
          <li>
            <strong>Không chia sẻ cho bên thứ ba:</strong> Dữ liệu hồ sơ chỉ phục vụ kết nối việc làm trên STUWORK, tuyệt đối không bán hoặc chia sẻ dữ liệu cho mục đích quảng cáo ngoài nền tảng.
          </li>
        </ul>
      </Card>
    </div>
  );
}
