import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  GraduationCap,
  Kanban,
  MapPin,
  Quote,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { JOB_CATEGORIES, LOCATIONS, SAFETY_PRINCIPLES } from "@/lib/constants";
import {
  getCurrentAuthContext,
  getHomePageData,
  queryJobs,
} from "@/services/data-service";
import { FeaturedJobsTabs } from "@/components/jobs/featured-jobs-tabs";
import { HeroMarketWidget } from "@/components/jobs/hero-market-widget";
import { JobCard } from "@/components/jobs/job-card";
import {
  HeroPromoCarousel,
  MidPageAdBanners,
  StudentCareerToolsSection,
  TopVerifiedEmployersSection,
} from "@/components/jobs/promo-banners-carousel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TRENDING_TAGS = [
  { label: "Gia sư Tiếng Anh", href: "/jobs?category=Gia+s%C6%B0" },
  { label: "Barista Ca tối", href: "/jobs?working_time=Ca+t%E1%BB%91i" },
  { label: "Content Remote", href: "/jobs?category=Marketing" },
  { label: "Thực tập IT / UI-UX", href: "/jobs?category=C%C3%B4ng+ngh%E1%BB%87" },
  { label: "Thu ngân cuối tuần", href: "/jobs?working_time=Cu%E1%BB%91i+tu%E1%BA%A7n" },
];

const STUDENT_TESTIMONIALS = [
  {
    name: "Nguyễn Minh Anh",
    school: "ĐH Kinh tế Quốc dân (NEU) • Năm 3",
    role: "CTV Content Marketing tại Media Lab",
    quote:
      "Trước đây mình tìm việc trên hội nhóm Facebook rất sợ bị lừa đặt cọc. Nhờ STUWORK có bộ lọc đơn vị đã xác minh và bảng Kanban Pipeline, mình nhận việc chỉ sau 2 ngày nộp CV.",
    income: "4.500.000đ/tháng",
  },
  {
    name: "Trần Đức Minh",
    school: "ĐH Bách Khoa Hà Nội (HUST) • Năm 4",
    role: "Thực tập sinh Frontend tại TechStart",
    quote:
      "Tính năng khớp lịch học giúp mình lọc ngay được các công ty cho phép làm 4 buổi/tuần mà không trùng lịch thí nghiệm trên trường. Giao diện rất trực quan và dễ theo dõi.",
    income: "6.000.000đ/tháng",
  },
  {
    name: "Lê Thu Hà",
    school: "ĐH Ngoại Thương (FTU) • Năm 2",
    role: "Trợ giảng IELTS tại Trung tâm Học Tốt",
    quote:
      "Mọi thông tin về mức lương theo giờ và địa điểm đều được chuẩn hóa rõ ràng ngay trên thẻ công việc. Không còn cảnh phải inbox hỏi từng nơi rồi chờ đợi mòn mỏi.",
    income: "60.000đ/giờ",
  },
];

export default async function HomePage() {
  const auth = await getCurrentAuthContext();
  const [{ stats, recommendedJobs }, { jobs: allActiveJobs }] =
    await Promise.all([
      getHomePageData(auth.studentProfile),
      queryJobs({ limit: 36, sort: "newest" }, auth.studentProfile),
    ]);

  const postJobHref =
    auth.user?.role === "employer"
      ? "/employer/jobs/create"
      : "/register?role=employer";

  return (
    <div className="space-y-12 pb-10">
      {/* 1. SPLIT 2-COLUMN HERO SECTION (TopCV Emerald Green Theme + Interactive Campaign Slider + Live Market Chart) */}
      <section className="relative overflow-hidden bg-hero-mesh text-white py-9 md:py-12 border-b border-emerald-900">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
            {/* Left Column (7 cols): Tagline, Headline, Pill Search Bar, Trending Keywords, and Interactive Promo Carousel */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-[#4ade80]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Công nghệ AI dự đoán, cá nhân hóa việc làm theo lịch học sinh viên
                </p>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Tìm công việc phù hợp.{" "}
                  <span className="text-[#4ade80]">
                    Bắt đầu hành trình của bạn.
                  </span>
                </h1>

                <p className="text-sm text-emerald-100/85 max-w-2xl">
                  STUWORK giúp sinh viên tiếp cận những cơ hội việc làm thêm, thực
                  tập và freelance minh bạch, đã qua kiểm duyệt an toàn 100%.
                </p>

                {/* Unified White Pill Search Bar (TopCV Style) */}
                <form
                  action="/jobs"
                  method="GET"
                  className="mt-3 rounded-2xl bg-white p-2 shadow-elevated text-slate-900 border-2 border-emerald-400/40"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-6 flex items-center gap-2.5 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
                      <Search className="h-4 w-4 text-[#00b14f] shrink-0" />
                      <input
                        type="text"
                        name="q"
                        placeholder="Vị trí ứng tuyển, kỹ năng, tên công ty..."
                        className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center gap-1.5 px-3 py-2">
                      <MapPin className="h-4 w-4 text-[#00b14f] shrink-0" />
                      <select
                        name="location"
                        defaultValue=""
                        className="w-full bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="">Tất cả địa điểm</option>
                        {LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full h-10 text-sm font-extrabold rounded-xl bg-[#00b14f] hover:bg-[#009b45]"
                      >
                        Tìm kiếm
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Quick Trending Search Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-emerald-200/80 mr-1">
                    Từ khóa phổ biến:
                  </span>
                  {TRENDING_TAGS.map((tag) => (
                    <Link
                      key={tag.label}
                      href={tag.href}
                      className="rounded-full bg-white/10 hover:bg-[#00b14f] border border-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white transition-colors"
                    >
                      {tag.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Interactive Campaign Promo Carousel Banner below search bar */}
              <HeroPromoCarousel postJobHref={postJobHref} />
            </div>

            {/* Right Column (5 cols): Live Market Intelligence Bar Chart Widget */}
            <div className="lg:col-span-5">
              <HeroMarketWidget
                activeJobsCount={stats.activeJobs}
                verifiedJobsCount={stats.verifiedJobs}
              />
            </div>
          </div>

          {/* 4 Live Platform Trust Stats Bar inside Hero bottom */}
          <div className="mt-7 pt-6 border-t border-emerald-400/15 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00b14f]/25 text-[#4ade80]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-white leading-none">
                  {stats.activeJobs}+
                </p>
                <p className="text-[11px] text-emerald-200/80 mt-1">
                  Việc làm đang tuyển
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00b14f]/25 text-[#4ade80]">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-white leading-none">
                  {stats.verifiedJobs}
                </p>
                <p className="text-[11px] text-emerald-200/80 mt-1">
                  Tin tuyển dụng đã xác minh
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00b14f]/25 text-[#4ade80]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-white leading-none">
                  {stats.totalEmployers}+
                </p>
                <p className="text-[11px] text-emerald-200/80 mt-1">
                  Nhà tuyển dụng đối tác
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00b14f]/25 text-[#4ade80]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-white leading-none">
                  {stats.totalStudents}+
                </p>
                <p className="text-[11px] text-emerald-200/80 mt-1">
                  Hồ sơ sinh viên tham gia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BỘ 3 BANNER QUẢNG CÁO CHIẾN DỊCH NỔI BẬT (PROMOTIONAL CAMPAIGN AD BANNERS) */}
      <section className="container">
        <MidPageAdBanners />
      </section>

      {/* 3. VIỆC LÀM TỐT NHẤT (QUICK LOCATION PILLS + 3-COLUMN COMPACT CARDS) */}
      <section className="container">
        <FeaturedJobsTabs jobs={allActiveJobs} />
      </section>

      {/* 4. THƯƠNG HIỆU NHÀ TUYỂN DỤNG UY TÍN ĐÃ XÁC MINH */}
      <section className="container">
        <TopVerifiedEmployersSection />
      </section>

      {/* 5. PIPELINE & ĐỀ XUẤT CÁ NHÂN HÓA THEO LỊCH HỌC */}
      <section className="container">
        <div className="rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 p-6 md:p-8 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00b14f]/15 px-3 py-1 text-xs font-extrabold text-[#00873c] mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Gợi ý thông minh (Kỹ năng 30% • Địa điểm 20% • Lương 20% • Ca học 20%)
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Việc làm Đề xuất Phù hợp với Hồ sơ của Bạn
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Các công việc có tỷ lệ khớp cao nhất với lịch rảnh và định hướng kỹ năng sinh viên.
              </p>
            </div>
            <Link href="/student/applications">
              <Button variant="primary" size="sm">
                <Kanban className="h-4 w-4" />
                Mở bảng Kanban Pipeline ứng tuyển →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedJobs.map((job) => (
              <JobCard key={job.id} job={job} showMatchScore />
            ))}
          </div>
        </div>
      </section>

      {/* 6. CÔNG CỤ TÍNH LƯƠNG PART-TIME & CẨM NANG SINH VIÊN */}
      <section className="container">
        <StudentCareerToolsSection />
      </section>

      {/* 7. DANH MỤC CÔNG VIỆC (8 CATEGORIES) */}
      <section className="container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-extrabold text-[#00873c] mb-2">
              <GraduationCap className="h-3.5 w-3.5" />
              Phân loại theo đặc thù sinh viên
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Danh mục Việc làm Sinh viên Phổ biến
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              8 nhóm ngành nghề được chuẩn hóa tiêu chí lương theo giờ và khung ca làm việc linh hoạt
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-sm font-bold text-[#009b45] hover:underline inline-flex items-center gap-1"
          >
            Tất cả danh mục <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {JOB_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={`/jobs?category=${encodeURIComponent(cat.id)}`}
                className="group"
              >
                <Card className="p-5 h-full card-hover flex flex-col justify-between">
                  <div>
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${cat.color} mb-3 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 group-hover:text-[#009b45] transition-colors">
                      {cat.label}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <span className="mt-3.5 inline-flex items-center gap-1 text-xs font-extrabold text-[#009b45]">
                    Khám phá việc làm <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 8. ĐÁNH GIÁ THỰC TẾ TỪ CỘNG ĐỒNG SINH VIÊN CÁC TRƯỜNG ĐẠI HỌC */}
      <section className="container">
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-extrabold text-[#00873c] mb-2">
              <Star className="h-3.5 w-3.5 fill-[#00b14f] text-[#00b14f]" />
              Được tin dùng bởi sinh viên hơn 25+ trường Đại học
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Sinh viên Nói gì về Trải nghiệm Tìm việc trên STUWORK?
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hàng nghìn sinh viên tại Hà Nội, TP.HCM và Đà Nẵng đã tìm được công việc làm thêm an toàn, đúng chuyên ngành.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STUDENT_TESTIMONIALS.map((item) => (
              <Card
                key={item.name}
                className="p-6 flex flex-col justify-between border-slate-200/90 hover:border-[#00b14f]/60 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <Quote className="h-6 w-6 text-emerald-200" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">
                      {item.school}
                    </p>
                    <p className="text-[11px] font-bold text-[#00873c] mt-0.5">
                      {item.role}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-extrabold text-[#00873c]">
                    {item.income}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 9. KHU VỰC AN TOÀN (GREEN & DARK FOREST SHIELD BANNER) */}
      <section className="container">
        <div className="rounded-3xl border border-emerald-300/40 bg-gradient-to-br from-[#052616] via-[#093b23] to-[#062c1a] p-8 md:p-10 text-white shadow-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00b14f]/25 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-[#4ade80]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Cam kết An toàn STUWORK
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
                5 Nguyên tắc Bảo vệ Sinh viên khi Tìm việc Làm thêm
              </h2>
              <p className="text-sm text-emerald-100/85 leading-relaxed">
                Mọi đơn vị tuyển dụng trên STUWORK đều phải trải qua quy trình
                xác minh trước khi xuất bản tin. Tuyệt đối không thu bất kỳ
                khoản phí nào từ sinh viên.
              </p>
              <Link href="/safety" className="inline-block pt-1">
                <Button variant="primary" size="md">
                  Xem cẩm nang an toàn
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAFETY_PRINCIPLES.slice(0, 4).map((rule) => (
                <div
                  key={rule.title}
                  className="rounded-2xl bg-white/[0.08] border border-white/15 p-4"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#4ade80] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {rule.title}
                      </h3>
                      <p className="mt-1 text-xs text-emerald-100/80 leading-relaxed">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-2xl bg-rose-500/20 border border-rose-400/40 p-3.5 flex items-center justify-between gap-4">
                <span className="text-xs text-rose-100 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-300 shrink-0" />
                  <span>
                    <strong>Nguyên tắc số 5:</strong> Báo cáo ngay các tin tuyển
                    dụng yêu cầu nộp phí, đặt cọc hoặc cung cấp mã OTP ngân hàng.
                  </span>
                </span>
                <Link
                  href="/safety"
                  className="shrink-0 text-xs font-extrabold text-[#4ade80] hover:underline"
                >
                  Chi tiết →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
