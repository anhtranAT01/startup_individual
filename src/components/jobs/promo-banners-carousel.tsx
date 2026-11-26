"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  GraduationCap,
  Kanban,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

interface HeroSlide {
  id: string;
  badge: string;
  titleLine1: string;
  titleHighlight: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  gradientClass: string;
  cardRole: string;
  cardTitle: string;
  cardCompany: string;
  cardSalary: string;
  cardShift: string;
}

const HERO_PROMO_SLIDES: HeroSlide[] = [
  {
    id: "campaign-1",
    badge: "CHIẾN DỊCH TUYỂN DỤNG SINH VIÊN 2026",
    titleLine1: "Tiếp lợi thế,",
    titleHighlight: "nối thành công",
    subtitle:
      "Hệ sinh thái việc làm thêm & thực tập tiên phong chuẩn hóa mức lương, bảo vệ sinh viên Việt Nam trước rủi ro lừa đảo.",
    ctaLabel: "Khám phá việc ngay",
    ctaHref: "/jobs",
    gradientClass:
      "from-[#052e1a] via-[#074728] to-[#0a5c36] border-emerald-400/25",
    cardRole: "Verified Fast-Track",
    cardTitle: "Trợ giảng IELTS & Tiếng Anh",
    cardCompany: "Trung tâm Học Tốt • Cầu Giấy",
    cardSalary: "45.000 – 65.000đ/giờ",
    cardShift: "Ca tối 18h-21h",
  },
  {
    id: "campaign-2",
    badge: "CƠ HỘI REMOTE & FREELANCE LINH HOẠT",
    titleLine1: "Làm việc từ xa,",
    titleHighlight: "không lo trùng lịch học",
    subtitle:
      "Hơn 120+ dự án Content, Thiết kế Canva, Quản trị Fanpage & Gia sư Online làm việc ngay tại nhà hoặc ký túc xá.",
    ctaLabel: "Xem việc Remote",
    ctaHref: "/jobs?location=L%C3%A0m+vi%E1%BB%87c+t%E1%BB%AB+xa",
    gradientClass:
      "from-[#063324] via-[#0b4f35] to-[#0e6645] border-teal-400/25",
    cardRole: "100% Online",
    cardTitle: "CTV Sáng tạo Nội dung TikTok",
    cardCompany: "Media Lab Digital • Toàn quốc",
    cardSalary: "3.5 – 5.5 triệu/tháng",
    cardShift: "Linh hoạt giờ rảnh",
  },
  {
    id: "campaign-3",
    badge: "THỰC TẬP SINH TÀI NĂNG & F&B CHUỖI LỚN",
    titleLine1: "Tích lũy kinh nghiệm,",
    titleHighlight: "nhận trợ cấp xứng đáng",
    subtitle:
      "Kết nối trực tiếp với các chuỗi Cafe, Bán lẻ và Startup Công nghệ đã xác minh giấy phép kinh doanh 100%.",
    ctaLabel: "Ứng tuyển 1 chạm",
    ctaHref: "/jobs?verified_only=1",
    gradientClass:
      "from-[#0a3618] via-[#115024] to-[#15682e] border-lime-400/25",
    cardRole: "Hot Internship",
    cardTitle: "Thực tập sinh Frontend / UI-UX",
    cardCompany: "TechStart Vietnam • Quận 1",
    cardSalary: "4.0 – 7.0 triệu/tháng",
    cardShift: "4-5 buổi/tuần",
  },
];

export function HeroPromoCarousel({ postJobHref }: { postJobHref: string }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_PROMO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_PROMO_SLIDES[index];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-gradient-to-r ${slide.gradientClass} p-5 sm:p-6 shadow-elevated transition-all duration-500`}
    >
      {/* Decorative glowing orb */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-400/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 left-1/3 h-36 w-36 rounded-full bg-lime-400/10 blur-2xl" />

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        {/* Left Banner Copy */}
        <div className="sm:col-span-7 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00b14f]/30 border border-emerald-400/40 px-3 py-0.5 text-[11px] font-extrabold tracking-wide text-emerald-200">
              <Flame className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              {slide.badge}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            {slide.titleLine1}
            <br />
            <span className="text-[#4ade80]">{slide.titleHighlight}</span>
          </h2>

          <p className="text-xs sm:text-[13px] text-emerald-100/85 leading-relaxed line-clamp-2">
            {slide.subtitle}
          </p>

          <div className="pt-1.5 flex flex-wrap items-center gap-2.5">
            <Link
              href={slide.ctaHref}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-[#00b14f] px-4 text-xs font-extrabold text-white shadow-md hover:bg-[#00c859] transition-all"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <Play className="h-3 w-3 fill-white text-white ml-0.5" />
              </span>
              {slide.ctaLabel}
            </Link>
            <Link
              href={postJobHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
            >
              Đăng tin tuyển dụng
            </Link>
          </div>
        </div>

        {/* Right Floating Spotlight Job Card */}
        <div className="sm:col-span-5">
          <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-xl border border-emerald-100 transform sm:rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
              <span className="inline-flex items-center gap-1 text-[#009b45] font-extrabold">
                <Kanban className="h-3.5 w-3.5" />
                {slide.cardRole}
              </span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                ✓ Đã xác minh
              </span>
            </div>

            <p className="text-sm font-extrabold text-slate-900 line-clamp-1">
              {slide.cardTitle}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {slide.cardCompany}
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-[#009b45]">
                {slide.cardSalary}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                <Clock className="h-3 w-3 text-emerald-600" />
                {slide.cardShift}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Slider Controls & Dots */}
      <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {HERO_PROMO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(idx)}
              aria-label={`Chuyển sang banner ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === index
                  ? "w-7 bg-[#4ade80]"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              setIndex(
                (prev) =>
                  (prev - 1 + HERO_PROMO_SLIDES.length) %
                  HERO_PROMO_SLIDES.length
              )
            }
            aria-label="Banner trước"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              setIndex((prev) => (prev + 1) % HERO_PROMO_SLIDES.length)
            }
            aria-label="Banner tiếp"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 3-Column Promotional Ad Banners Section (Inspired by TopCV / Glints Campaign Banners)
 */
export function MidPageAdBanners() {
  const banners = [
    {
      tag: "TÀI TRỢ • FAST-TRACK 2026",
      title: "Học bổng & Thực tập Sinh Tài năng",
      desc: "Nhận trợ cấp tới 7.000.000đ/tháng + Chứng nhận thực tập từ 8 doanh nghiệp đối tác công nghệ & giáo dục.",
      cta: "Ứng tuyển ngay",
      href: "/jobs?job_type=Internship",
      bg: "from-[#00873c] via-[#00a64a] to-emerald-600",
      badgeBg: "bg-white/20 text-white",
      icon: GraduationCap,
    },
    {
      tag: "CÔNG CỤ AI • STUWORK CV",
      title: "Hồ sơ Lịch rảnh & Gợi ý Việc làm 1 Chạm",
      desc: "Tự động lọc ca sáng, chiều, tối hoặc cuối tuần khớp 100% thời khóa biểu tín chỉ tại trường đại học.",
      cta: "Cập nhật hồ sơ",
      href: "/student/profile",
      bg: "from-teal-800 via-emerald-800 to-[#064e3b]",
      badgeBg: "bg-amber-400/20 text-amber-200 border border-amber-300/30",
      icon: Zap,
    },
    {
      tag: "BẢO VỆ SINH VIÊN 24/7",
      title: "Cam kết 3 Không – Tuyển dụng Xác minh",
      desc: "Không thu phí đặt cọc • Không giữ tiền trung gian • 100% đơn vị được kiểm duyệt giấy phép trước khi đăng tin.",
      cta: "Xem nguyên tắc an toàn",
      href: "/safety",
      bg: "from-slate-900 via-[#0b3b24] to-emerald-950",
      badgeBg: "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {banners.map((b) => {
        const Icon = b.icon;
        return (
          <Link
            key={b.title}
            href={b.href}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${b.bg} p-5 text-white shadow-soft hover:shadow-elevated transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between min-h-[168px]`}
          >
            <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10 blur-xl group-hover:scale-125 transition-transform" />
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${b.badgeBg}`}
                >
                  {b.tag}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold leading-snug group-hover:text-emerald-200 transition-colors">
                {b.title}
              </h3>
              <p className="mt-1.5 text-xs text-white/85 leading-relaxed">
                {b.desc}
              </p>
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-200 group-hover:translate-x-1 transition-transform">
              <span>{b.cta}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Interactive Part-Time Salary & Shift Calculator Widget + Career Tools (Inspired by TopCV & Glints Tools)
 */
export function StudentCareerToolsSection() {
  const [hoursPerWeek, setHoursPerWeek] = React.useState(20);
  const [hourlyRate, setHourlyRate] = React.useState(35000);

  const weeklyIncome = hoursPerWeek * hourlyRate;
  const monthlyIncome = weeklyIncome * 4;

  return (
    <div className="rounded-3xl border border-emerald-200/80 bg-white p-6 md:p-8 shadow-soft">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-[#00873c] mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Công cụ phát triển sự nghiệp sinh viên (Tham khảo chuẩn TopCV & Glints)
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Tính nhanh Thu nhập Làm thêm & Quản lý Lịch học
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Ước tính thu nhập hàng tháng theo số giờ rảnh của bạn để chọn công việc cân bằng giữa việc học và đi làm.
          </p>
        </div>
        <Link
          href="/guide"
          className="text-sm font-bold text-[#009b45] hover:underline inline-flex items-center gap-1"
        >
          Xem cẩm nang hướng dẫn <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Interactive Part-Time Income Calculator (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-5 sm:p-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00b14f] text-white shadow-xs">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Công cụ Ước tính Thu nhập Part-time
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kéo thanh trượt để tính mức thu nhập dự kiến mỗi tháng
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">
                Khuyến nghị: ≤ 24h/tuần
              </span>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Số giờ làm thêm mỗi tuần:</span>
                  <span className="text-[#009b45] font-extrabold">
                    {hoursPerWeek} giờ / tuần (~{Math.round(hoursPerWeek / 4)} ca)
                  </span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={36}
                  step={2}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  aria-label="Số giờ làm thêm mỗi tuần"
                  className="w-full accent-[#00b14f] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>8h/tuần (Cuối tuần)</span>
                  <span>20h/tuần (Chuẩn sinh viên)</span>
                  <span>36h/tuần (Bán thời gian cao)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Mức lương theo giờ trung bình:</span>
                  <span className="text-[#009b45] font-extrabold">
                    {hourlyRate.toLocaleString("vi-VN")}đ / giờ
                  </span>
                </div>
                <input
                  type="range"
                  min={22000}
                  max={80000}
                  step={3000}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  aria-label="Mức lương theo giờ"
                  className="w-full accent-[#00b14f] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>22.000đ (F&B/Phục vụ)</span>
                  <span>35.000đ (Bán hàng/CSKH)</span>
                  <span>80.000đ (Gia sư/IT/IELTS)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calculated Result Box */}
          <div className="mt-5 rounded-2xl bg-[#073b22] p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                Thu nhập dự kiến / tháng (4 tuần)
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#4ade80] mt-0.5">
                {monthlyIncome.toLocaleString("vi-VN")} VNĐ
              </p>
              <p className="text-[11px] text-emerald-100/80">
                ≈ {weeklyIncome.toLocaleString("vi-VN")}đ / tuần • Phù hợp để tự trang trải sinh hoạt phí
              </p>
            </div>
            <Link
              href={`/jobs?salary_range=${
                hourlyRate >= 50000
                  ? "over_50k"
                  : hourlyRate >= 35000
                  ? "35k_50k"
                  : "25k_35k"
              }`}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#00b14f] px-4 text-xs font-extrabold text-white hover:bg-[#00c859] transition-colors"
            >
              Tìm việc mức lương này
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: 2 Feature Highlight Cards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Kanban Application Pipeline
                </span>
                <span className="text-xs font-bold text-slate-400">Real-time</span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                Theo dõi trạng thái hồ sơ minh bạch
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Biết chính xác khi nào Nhà tuyển dụng đã mở xem CV, đưa vào danh sách phỏng vấn hay chấp nhận nhận việc.
              </p>
            </div>
            <Link
              href="/student/applications"
              className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#009b45] hover:underline"
            >
              Mở bảng Pipeline của bạn <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                  <Award className="h-3.5 w-3.5" />
                  Đánh giá 2 chiều sau công việc
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  4.9/5
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                Cộng đồng Sinh viên Kiểm chứng
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Chỉ sinh viên đã ứng tuyển và làm việc thực tế mới được phép đánh giá môi trường làm việc và độ uy tín trả lương.
              </p>
            </div>
            <Link
              href="/jobs?verified_only=1"
              className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#009b45] hover:underline"
            >
              Xem các đơn vị uy tín 5 sao <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Top Verified Employers Showcase (Inspired by TopCV "Thương hiệu lớn tiêu biểu")
 */
export function TopVerifiedEmployersSection() {
  const employers = [
    {
      name: "Cafe Mộc Roastery",
      category: "F&B • Chuỗi Cà phê",
      location: "Hà Nội",
      rating: "4.9",
      openRoles: 5,
      badge: "Top F&B Sinh viên",
      initials: "CM",
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      name: "Trung tâm Anh ngữ Học Tốt",
      category: "Giáo dục • Trợ giảng IELTS",
      location: "Hà Nội & TP.HCM",
      rating: "5.0",
      openRoles: 6,
      badge: "Trả lương đúng hạn",
      initials: "HT",
      tone: "bg-teal-50 text-teal-700 border-teal-200",
    },
    {
      name: "Media Lab Digital Agency",
      category: "Marketing • Content Creator",
      location: "TP. Hồ Chí Minh & Remote",
      rating: "4.8",
      openRoles: 4,
      badge: "Hỗ trợ dấu thực tập",
      initials: "ML",
      tone: "bg-green-50 text-green-700 border-green-200",
    },
    {
      name: "TechStart Software VN",
      category: "Công nghệ • IT & UI/UX",
      location: "TP.HCM & Từ xa",
      rating: "4.9",
      openRoles: 4,
      badge: "Mentor 1-1 thực chiến",
      initials: "TS",
      tone: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    {
      name: "Hệ thống EduPlus Việt Nam",
      category: "EdTech • Gia sư & Cố vấn",
      location: "Đà Nẵng & Online",
      rating: "4.9",
      openRoles: 4,
      badge: "Ca làm linh hoạt",
      initials: "EP",
      tone: "bg-lime-50 text-lime-700 border-lime-200",
    },
    {
      name: "Creative Studio & Media",
      category: "Thiết kế • Freelance Design",
      location: "Làm việc từ xa",
      rating: "4.8",
      openRoles: 3,
      badge: "100% Remote",
      initials: "CS",
      tone: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      name: "Chuỗi Cửa hàng Local Store",
      category: "Bán lẻ • Thu ngân & CSKH",
      location: "Hà Nội & TP.HCM",
      rating: "4.7",
      openRoles: 4,
      badge: "Xoay ca theo lịch thi",
      initials: "LS",
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      name: "Fresh Food Organic Market",
      category: "Siêu thị • Bán hàng ca gãy",
      location: "TP. Hồ Chí Minh",
      rating: "4.8",
      openRoles: 3,
      badge: "Phụ cấp ăn ca",
      initials: "FF",
      tone: "bg-teal-50 text-teal-700 border-teal-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-extrabold text-[#00873c] mb-2">
            <BadgeCheck className="h-3.5 w-3.5" />
            100% Đã qua kiểm duyệt pháp lý & địa điểm làm việc
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Nhà Tuyển dụng Uy tín Hàng đầu cho Sinh viên
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Các đơn vị có môi trường làm việc an toàn, hỗ trợ xoay ca theo lịch thi và được sinh viên đánh giá cao nhất.
          </p>
        </div>
        <Link
          href="/jobs?verified_only=1"
          className="text-sm font-bold text-[#009b45] hover:underline inline-flex items-center gap-1 shrink-0"
        >
          Xem tất cả đơn vị đã xác minh <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {employers.map((emp) => (
          <Link
            key={emp.name}
            href={`/jobs?q=${encodeURIComponent(emp.name.split(" ")[0])}`}
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs card-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`relative flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-extrabold ${emp.tone}`}
                >
                  {emp.initials}
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00b14f] text-white ring-2 ring-white">
                    <BadgeCheck className="h-3 w-3" />
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {emp.rating}
                </span>
              </div>

              <h3 className="mt-3.5 text-sm font-extrabold text-slate-900 group-hover:text-[#009b45] transition-colors line-clamp-1">
                {emp.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{emp.category}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-[#00873c]">
                {emp.badge}
              </span>
              <span className="text-xs font-extrabold text-slate-700 group-hover:text-[#009b45]">
                {emp.openRoles} việc →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
