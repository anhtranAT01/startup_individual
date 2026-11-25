import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { JOB_CATEGORIES, LOCATIONS, SAFETY_PRINCIPLES } from "@/lib/constants";
import { getCurrentAuthContext, getHomePageData } from "@/services/data-service";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function HomePage() {
  const auth = await getCurrentAuthContext();
  const { stats, featuredJobs, recommendedJobs } = await getHomePageData(
    auth.studentProfile
  );

  const postJobHref =
    auth.user?.role === "employer"
      ? "/employer/jobs/create"
      : "/register?role=employer";

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-hero-mesh text-white pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-white/10 px-4 py-1.5 text-xs font-medium text-cyan-200 backdrop-blur-xs">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              Kết nối Minh bạch • Nhà tuyển dụng Xác minh • 0đ Phí ứng tuyển
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Tìm công việc phù hợp.{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-emerald-300 bg-clip-text text-transparent">
                Bắt đầu hành trình của bạn.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-200/90 leading-relaxed">
              STUWORK giúp sinh viên tiếp cận những cơ hội việc làm thêm minh
              bạch, linh hoạt và phù hợp với lịch học.
            </p>

            {/* Large Search Bar */}
            <form
              action="/jobs"
              method="GET"
              className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white p-2.5 shadow-elevated text-slate-900"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <div className="md:col-span-6 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
                  <Search className="h-5 w-5 text-blue-600 shrink-0" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Tên công việc, kỹ năng hoặc từ khóa..."
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3 flex items-center gap-2 px-3 py-2">
                  <MapPin className="h-5 w-5 text-cyan-600 shrink-0" />
                  <select
                    name="location"
                    defaultValue=""
                    className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                  >
                    <option value="">Tất cả địa điểm</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full h-11 text-sm font-semibold"
                  >
                    Tìm việc ngay
                  </Button>
                </div>
              </div>
            </form>

            {/* Two CTAs */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
              <Link href="/jobs">
                <Button variant="accent" size="lg">
                  Khám phá công việc
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={postJobHref}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50"
                >
                  Đăng tin tuyển dụng
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THỐNG KÊ NỔI BẬT (DEMO METRICS) */}
      <section className="container -mt-10 relative z-20">
        <Card className="p-6 md:p-8 shadow-elevated border-slate-200/90">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  {stats.activeJobs}+
                </p>
                <p className="text-xs sm:text-sm text-slate-500">
                  Công việc đang tuyển
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  {stats.totalStudents}+
                </p>
                <p className="text-xs sm:text-sm text-slate-500">
                  Hồ sơ sinh viên tham gia
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  {stats.totalEmployers}+
                </p>
                <p className="text-xs sm:text-sm text-slate-500">
                  Đơn vị nhà tuyển dụng
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  {stats.verifiedJobs}
                </p>
                <p className="text-xs sm:text-sm text-slate-500">
                  Tin tuyển dụng đã xác minh
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 border-t border-slate-100 pt-3 text-[11px] text-slate-400 text-center">
            * Ghi chú minh bạch: Số liệu trên được tổng hợp từ tập dữ liệu minh
            họa trong môi trường trình diễn MVP, không trình bày như số liệu kinh
            doanh thương mại thực tế.
          </p>
        </Card>
      </section>

      {/* 3. CÔNG VIỆC PHÙ HỢP VỚI BẠN (RULE-BASED RECOMMENDATION) */}
      <section className="container pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">
              <Sparkles className="h-4 w-4" />
              Đề xuất theo hồ sơ & lịch học
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Công việc phù hợp với bạn
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Tính điểm theo quy tắc trọng số minh bạch (Kỹ năng 30% • Địa điểm 20% • Mức lương 20% • Thời gian 20% • Loại hình 10%).
            </p>
          </div>
          <Link href="/jobs?sort=best_match">
            <Button variant="outline" size="sm">
              Xem thêm gợi ý
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {recommendedJobs.map((job) => (
            <JobCard key={job.id} job={job} showMatchScore />
          ))}
        </div>
      </section>

      {/* 4. CÔNG VIỆC NỔI BẬT (6-8 CARDS) */}
      <section className="container pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Công việc nổi bật mới nhất
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Thông tin lương thưởng, thời gian ca làm và trạng thái xác minh được chuẩn hóa rõ ràng
            </p>
          </div>
          <Link href="/jobs">
            <Button variant="primary" size="md">
              Xem tất cả {stats.activeJobs} công việc
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* 5. DANH MỤC CÔNG VIỆC (8 CATEGORIES) */}
      <section className="container pt-16">
        <div className="text-center max-w-2xl mx-auto mb-9">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Khám phá theo Danh mục Công việc
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Đa dạng nhóm ngành từ dịch vụ cửa hàng, gia sư học thuật đến sáng tạo nội dung và công nghệ từ xa
          </p>
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
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${cat.color} mb-3.5`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {cat.label}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                    Tìm việc nhóm này
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. KHU VỰC AN TOÀN */}
      <section className="container pt-16">
        <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950 p-8 md:p-12 text-white shadow-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300">
                <ShieldAlert className="h-3.5 w-3.5" />
                Lá chắn An toàn Sinh viên
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
                Nguyên tắc An toàn Bất di Bất dịch trên STUWORK
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Chúng tôi xây dựng quy trình xác minh nhà tuyển dụng và công cụ
                báo cáo cộng đồng để loại bỏ rủi ro lừa đảo việc làm thêm.
              </p>
              <div className="pt-2">
                <Link href="/safety">
                  <Button variant="accent" size="lg">
                    Xem cẩm nang an toàn chi tiết
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {SAFETY_PRINCIPLES.slice(0, 4).map((rule) => (
                <div
                  key={rule.title}
                  className="rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-cyan-300 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {rule.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-2xl bg-rose-500/15 border border-rose-400/30 p-4 flex items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-rose-100">
                  <strong>Nguyên tắc số 5:</strong> Báo cáo ngay mọi tin tuyển dụng yêu cầu đặt cọc, nộp phí hoặc chia sẻ OTP để bảo vệ bạn bè sinh viên!
                </p>
                <Link href="/safety" className="shrink-0 text-xs font-bold text-cyan-300 hover:underline">
                  Tìm hiểu →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
