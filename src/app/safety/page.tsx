import Link from "next/link";
import {
  AlertOctagon,
  BadgeCheck,
  Ban,
  FileWarning,
  Flag,
  KeyRound,
  MessageSquare,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { SAFETY_PRINCIPLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Hướng dẫn an toàn khi tìm việc",
};

const PRINCIPLE_ICONS = [
  Ban,
  AlertOctagon,
  KeyRound,
  SearchCheck,
  FileWarning,
  MessageSquare,
  Flag,
];

export default function SafetyGuidePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-mesh text-white py-16">
        <div className="container max-w-4xl text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-cyan-200">
            <ShieldCheck className="h-4 w-4" />
            Trung tâm An toàn Sinh viên STUWORK
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            7 Nguyên tắc Vàng giúp Sinh viên Tìm việc An toàn
          </h1>
          <p className="text-slate-200/90 text-base max-w-2xl mx-auto leading-relaxed">
            Trang bị kỹ năng nhận diện sớm các chiêu trò việc nhẹ lương cao, đặt đơn
            ảo và thu phí trái phép trước khi ứng tuyển bất kỳ công việc nào.
          </p>
        </div>
      </section>

      {/* 7 Cards */}
      <section className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAFETY_PRINCIPLES.map((item, index) => {
            const Icon = PRINCIPLE_ICONS[index % PRINCIPLE_ICONS.length];
            return (
              <Card key={item.title} className="p-6 card-hover flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    NGUYÊN TẮC 0{index + 1}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed flex-1">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Comparison Box */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-7 border-emerald-200 bg-emerald-50/40">
            <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-lg mb-4">
              <BadgeCheck className="h-6 w-6 text-emerald-600" />
              Dấu hiệu Nhà tuyển dụng Minh bạch
            </div>
            <ul className="space-y-2.5 text-sm text-slate-700">
              <li>• Có nhãn <strong>Đã xác minh</strong> trên hệ thống STUWORK.</li>
              <li>• Địa chỉ cửa hàng/văn phòng cụ thể, kiểm chứng được công khai.</li>
              <li>• Mô tả rõ nhiệm vụ cụ thể, khung giờ ca làm và mức lương thực tế.</li>
              <li>• Hoàn toàn không yêu cầu đóng bất kỳ khoản tiền nào khi nhận việc.</li>
            </ul>
          </Card>

          <Card className="p-7 border-rose-200 bg-rose-50/40">
            <div className="flex items-center gap-2.5 text-rose-800 font-bold text-lg mb-4">
              <ShieldAlert className="h-6 w-6 text-rose-600" />
              Dấu hiệu Cảnh báo Đỏ (Cần dừng ngay & Báo cáo)
            </div>
            <ul className="space-y-2.5 text-sm text-slate-700">
              <li>• Yêu cầu nạp tiền kích hoạt tài khoản cộng tác viên / chốt đơn ảo.</li>
              <li>• Chuyển hướng sang các nhóm chat kín yêu cầu cung cấp mã OTP / CCCD gốc.</li>
              <li>• Hứa hẹn thù lao bất thường (vài trăm nghìn chỉ cho 15 phút bấm like).</li>
              <li>• Địa điểm hẹn phỏng vấn mập mờ, thay đổi liên tục vào buổi tối muộn.</li>
            </ul>
          </Card>
        </div>

        <div className="mt-10 rounded-3xl bg-slate-900 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">
              Phát hiện tin tuyển dụng có dấu hiệu bất thường?
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              Nhấn nút &ldquo;Báo cáo tin tuyển dụng&rdquo; ngay trong trang chi tiết công việc để Quản trị viên xử lý kịp thời.
            </p>
          </div>
          <Link href="/jobs">
            <Button variant="accent" size="lg">
              Tìm việc làm đã xác minh
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
