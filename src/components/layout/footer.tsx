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
    <footer className="border-t border-slate-200/90 bg-slate-950 text-slate-300 mt-16">
      <div className="container py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                STU<span className="text-cyan-400">WORK</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Nền tảng kết nối sinh viên Việt Nam với các cơ hội việc làm thêm,
              bán thời gian và freelance minh bạch, đã qua kiểm duyệt an toàn.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook STUWORK"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn STUWORK"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <Link
                href="/safety"
                aria-label="Cổng an toàn STUWORK"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
              >
                <Globe className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Col 2: Dành cho Sinh viên */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Dành cho sinh viên
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/jobs" className="hover:text-cyan-400 transition-colors">
                  Tìm kiếm việc làm thêm
                </Link>
              </li>
              <li>
                <Link
                  href="/student/saved-jobs"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Việc làm đã lưu
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Cẩm nang phòng tránh lừa đảo
                </Link>
              </li>
              <li>
                <Link
                  href="/guide"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Hướng dẫn sử dụng nền tảng
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Dành cho Nhà tuyển dụng & Pháp lý */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Chính sách & Hỗ trợ
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link
                  href="/register?role=employer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Đăng ký Nhà tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/employer/verification"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Quy trình xác minh đơn vị
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Chính sách quyền riêng tư
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Liên hệ */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Liên hệ dự án
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Không gian Khởi nghiệp Sinh viên, Cầu Giấy, Hà Nội (Mô hình MVP)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>hotro@demo.stuwork.vn</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>1900 0000 (Tổng đài minh họa)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800/90 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} STUWORK MVP. Nền tảng kết nối việc làm thêm sinh viên minh bạch & an toàn.
          </p>
          <p>
            Cam kết 3 Không: Không thu phí ứng viên • Không giữ tiền trung gian • Không tiết lộ SĐT công khai.
          </p>
        </div>
      </div>
    </footer>
  );
}
