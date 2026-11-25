import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Kanban,
  MapPin,
  Play,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <div>
      {/* 1. SPLIT 2-COLUMN HERO SECTION (Inspired by Image 2 TopCV Hero + STUWORK Navy-Cyan Identity) */}
      <section className="relative overflow-hidden bg-hero-mesh text-white py-10 md:py-14">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
            {/* Left Column (7 cols): Tagline, Headline, Pill Search Bar, and Featured Promo Banner */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-300">
                  <Sparkles className="h-4 w-4" />
                  Công nghệ gợi ý theo lịch học & xác minh nhà tuyển dụng an toàn
                </p>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Tìm công việc phù hợp.{" "}
                  <span className="text-cyan-300">
                    Bắt đầu hành trình của bạn.
                  </span>
                </h1>

                <p className="text-sm text-slate-200/90 max-w-2xl">
                  STUWORK giúp sinh viên tiếp cận những cơ hội việc làm thêm minh
                  bạch, linh hoạt và phù hợp với lịch học.
                </p>

                {/* Unified White Pill Search Bar */}
                <form
                  action="/jobs"
                  method="GET"
                  className="mt-4 rounded-2xl bg-white p-2 shadow-elevated text-slate-900"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-6 flex items-center gap-2.5 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
                      <Search className="h-4 w-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        name="q"
                        placeholder="Vị trí ứng tuyển, kỹ năng..."
                        className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center gap-1.5 px-3 py-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <select
                        name="location"
                        defaultValue=""
                        className="w-full bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
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
                        variant="accent"
                        className="w-full h-10 text-sm font-bold rounded-xl"
                      >
                        Tìm việc ngay
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Visual Promo Card below search bar (Matching Image 2's bottom-left hero card) */}
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-slate-900/90 via-blue-950/90 to-teal-900/80 p-6 shadow-elevated">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  <div className="sm:col-span-7 space-y-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      100% Miễn phí ứng tuyển
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                      Tiếp lợi thế,
                      <br />
                      <span className="text-cyan-300">nối thành công</span>
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Hệ sinh thái việc làm thêm tiên phong chuẩn hóa thông tin
                      và bảo vệ sinh viên Việt Nam trước rủi ro lừa đảo.
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-2.5">
                      <Link href="/jobs">
                        <Button variant="primary" size="sm" className="rounded-full px-4">
                          <Play className="h-3.5 w-3.5 fill-white" />
                          Khám phá công việc
                        </Button>
                      </Link>
                      <Link href={postJobHref}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20"
                        >
                          Đăng tin tuyển dụng
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Mini Kanban Pipeline Preview Card inside the Hero Promo */}
                  <div className="sm:col-span-5 rounded-2xl bg-white/95 p-4 text-slate-900 shadow-lg transform sm:rotate-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                      <span className="inline-flex items-center gap-1 text-blue-700 font-bold">
                        <Kanban className="h-3.5 w-3.5" />
                        Application Pipeline
                      </span>
                      <span>Student Job</span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900">
                      CTV Content Marketing
                    </p>
                    <p className="text-xs text-slate-500">Media Lab Demo</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                        ✓ Đã xác minh
                      </span>
                      <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                        📅 Linh hoạt
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Live Market Intelligence Bar Chart Widget */}
            <div className="lg:col-span-5">
              <HeroMarketWidget
                activeJobsCount={stats.activeJobs}
                verifiedJobsCount={stats.verifiedJobs}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. VIỆC LÀM TỐT NHẤT (QUICK LOCATION PILLS + 3-COLUMN COMPACT CARDS FROM IMAGE 2) */}
      <section className="container pt-10">
        <FeaturedJobsTabs jobs={allActiveJobs} />
      </section>

      {/* 3. PIPELINE & ĐỀ XUẤT CÁ NHÂN HÓA */}
      <section className="container pt-14">
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-cyan-50/60 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Thuật toán tính điểm trọng số (Kỹ năng 30% • Địa điểm 20% • Lương 20% • Giờ 20%)
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Công việc phù hợp với hồ sơ của bạn
              </h2>
            </div>
            <Link href="/student/applications">
              <Button variant="secondary" size="sm">
                <Kanban className="h-4 w-4 text-blue-700" />
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

      {/* 4. DANH MỤC CÔNG VIỆC (8 CATEGORIES) */}
      <section className="container pt-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Danh mục Việc làm Sinh viên
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              8 nhóm công việc phổ biến nhất đã được chuẩn hóa tiêu chí tuyển dụng
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-sm font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
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
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${cat.color} mb-3`}
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
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                    Khám phá <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. KHU VỰC AN TOÀN */}
      <section className="container pt-14">
        <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8 md:p-10 text-white shadow-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Cam kết An toàn STUWORK
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
                5 Nguyên tắc Bảo vệ Sinh viên khi Tìm việc Làm thêm
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Mọi đơn vị tuyển dụng trên STUWORK đều phải trải qua quy trình
                xác minh trước khi xuất bản tin.
              </p>
              <Link href="/safety" className="inline-block pt-1">
                <Button variant="accent">
                  Xem hướng dẫn an toàn
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAFETY_PRINCIPLES.slice(0, 4).map((rule) => (
                <div
                  key={rule.title}
                  className="rounded-2xl bg-white/10 border border-white/15 p-4"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300 shrink-0 mt-0.5" />
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
              <div className="sm:col-span-2 rounded-2xl bg-rose-500/15 border border-rose-400/30 p-3.5 flex items-center justify-between gap-4">
                <span className="text-xs text-rose-100 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-300 shrink-0" />
                  <span>
                    <strong>Nguyên tắc số 5:</strong> Báo cáo ngay các tin tuyển
                    dụng yêu cầu nộp phí, đặt cọc hoặc cung cấp mã OTP.
                  </span>
                </span>
                <Link
                  href="/safety"
                  className="shrink-0 text-xs font-bold text-cyan-300 hover:underline"
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
