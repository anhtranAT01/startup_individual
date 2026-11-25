import { Card } from "@/components/ui/card";

export const metadata = { title: "Điều khoản sử dụng" };

export default function TermsPage() {
  return (
    <div className="container py-14 max-w-3xl">
      <Card className="p-8 space-y-5">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Điều khoản Sử dụng Nền tảng STUWORK
        </h1>
        <ul className="space-y-3 text-sm text-slate-700 list-disc pl-5 leading-relaxed">
          <li>
            <strong>Miễn phí ứng tuyển:</strong> Nghiêm cấm mọi hành vi yêu cầu sinh viên nộp phí giữ chỗ, phí hồ sơ, phí đồng phục hoặc chuyển tiền đặt cọc dưới mọi hình thức.
          </li>
          <li>
            <strong>Không giữ tiền trung gian:</strong> STUWORK là nền tảng kết nối thông tin minh bạch, không cung cấp ví điện tử và không thu hộ hay giữ tiền lương của người dùng.
          </li>
          <li>
            <strong>Trách nhiệm thông tin:</strong> Nhà tuyển dụng cam kết cung cấp đúng mức lương, địa điểm và mô tả công việc thực tế. Tài khoản vi phạm sẽ bị ẩn tin và khóa vĩnh viễn.
          </li>
          <li>
            <strong>Ghi chú dữ liệu Demo:</strong> Các tin tuyển dụng gắn nhãn <em>&ldquo;Dữ liệu minh họa&rdquo;</em> phục vụ trình diễn học thuật/khởi nghiệp của dự án MVP, không đại diện cho giao dịch thương mại thực tế.
          </li>
        </ul>
      </Card>
    </div>
  );
}
