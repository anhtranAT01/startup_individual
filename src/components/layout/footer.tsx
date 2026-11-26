import Link from "next/link";
import {
  Facebook,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-emerald-900/40 bg-[#041f12] text-slate-300 mt-12">
      <div className="container py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00b14f] to-teal-500 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                STU<span className="text-[#4ade80]">WORK</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-emerald-100/75">
              Nền tảng kết nối sinh viên Việt Nam với các cơ hội việc làm thêm,
              bán thời gian và freelance minh bạch, đã qua kiểm duyệt an toàn.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook STUWORK"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-emerald-200 hover:border-[#4ade80] hover:text-[#4ade80] transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn STUWORK"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-emerald-200 hover:border-[#4ade80] hover:text-[#4ade80] transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <Link
                href="/safety"
                aria-label="Cổng an toàn STUWORK"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-emerald-200 hover:border-[#4ade80] hover:text-[#4ade80] transition-colors"
              >
                <Globe className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Col 2: Dành cho Sinh viên */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Dành cho sinh viên
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/75">
              <li>
                <Link href="/jobs" className="hover:text-[#4ade80] transition-colors">
                  Tìm kiếm việc làm thêm
                </Link>
              </li>
              <li>
                <Link
                  href="/student/applications"
                  className="hover:text-[#4ade80] transition-colors"
                >
                  Kanban Pipeline ứng tuyển
                </Link>
              </li>
              <li>
                <Link
                  href="/student/saved-jobs"
                  className="hover:text-[#4ade80] transition-colors"
                >
                  Việc làm đã lưu
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="hover:text-[#4ade80] transition-colors"
                >
                  Cẩm nang phòng tránh lừa đảo
                </Link>
              </li>
              <li>
                <Link
                  href="/guide"
                  className="hover:text-[#4ade80] transition-colors"
                >
                  Hướng dẫn sử dụng nền tảng
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Dành cho Nhà tuyển dụng & Pháp lý */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Chính sách & Hỗ trợ
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/75">
              <li>
                <Link
                  href="/register?role=employer"
                  className="hover:text-[#4ade80] transition-colors"
                >
                  Đăng ký Nhà tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/verification"
                  className="hover:text-[#4ade80] transition-colors"
                >
                  Quy trình xác minh đơn vị
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[#4ade80] transition-colors"
                >
                  Chính sách quyền riêng tư
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[#4ade80] transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Liên hệ */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Liên hệ dự án
            </h4>
            <ul className="space-y-3 text-sm text-emerald-100/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#4ade80] shrink-0 mt-0.5" />
                <span>Không gian Khởi nghiệp Sinh viên, Cầu Giấy, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#4ade80] shrink-0" />
                <span>hotro@stuwork.vn</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#4ade80] shrink-0" />
                <span>1900 6868 (Hỗ trợ Sinh viên & Doanh nghiệp)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/60">
          <p>
            © {new Date().getFullYear()} STUWORK. Nền tảng kết nối việc làm thêm sinh viên minh bạch & an toàn.
          </p>
          <p>
            Cam kết 3 Không: Không thu phí ứng viên • Không giữ tiền trung gian • Không tiết lộ SĐT công khai.
          </p>
        </div>
      </div>
    </footer>
  );
}
