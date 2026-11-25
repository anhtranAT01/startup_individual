import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  Globe,
  MapPin,
  Send,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { VERIFICATION_STATUS_MAP } from "@/lib/constants";
import {
  formatDateVN,
  formatSalaryRange,
  isJobExpired,
} from "@/lib/utils";
import {
  getCurrentAuthContext,
  getJobDetailById,
} from "@/services/data-service";
import {
  JobReviewForm,
  SaveAndShareButtons,
} from "@/components/jobs/job-detail-actions";
import { JobCard } from "@/components/jobs/job-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const auth = await getCurrentAuthContext();
  const detail = await getJobDetailById(id, auth.user);

  if (!detail) {
    notFound();
  }

  const { job, reviews, existingApplication, isSaved, canReview, relatedJobs } =
    detail;
  const expired = isJobExpired(job.deadline);
  const closed = job.status !== "active" || expired;
  const isVerified = job.employer?.verification_status === "verified";
  const verStatusInfo =
    VERIFICATION_STATUS_MAP[
      job.employer?.verification_status || "not_submitted"
    ];

  const applyTargetHref = !auth.user
    ? `/login?next=/jobs/${job.id}/apply`
    : `/jobs/${job.id}/apply`;

  return (
    <div className="container py-10 space-y-10">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách việc làm
      </Link>

      {/* Header Card */}
      <Card className="p-6 md:p-8 shadow-elevated">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-600 text-xl font-extrabold text-white shadow-xs overflow-hidden">
              {job.employer?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.employer.logo_url}
                  alt={job.employer.company_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                (job.employer?.company_name || "SW").slice(0, 2).toUpperCase()
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="default">{job.category}</Badge>
                <Badge tone="cyan">{job.job_type}</Badge>
                <Badge tone={isVerified ? "verified" : "warning"}>
                  {isVerified ? <BadgeCheck className="h-3.5 w-3.5" /> : null}
                  {verStatusInfo?.label || "Chưa xác minh"}
                </Badge>
                {job.is_demo ? <Badge tone="demo">Dữ liệu minh họa</Badge> : null}
                {closed ? <Badge tone="danger">Đã ngừng nhận hồ sơ</Badge> : null}
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {job.title}
              </h1>

              <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-slate-400" />
                {job.employer?.company_name || "Đơn vị tuyển dụng"}
              </p>
            </div>
          </div>

          {/* Primary Action Area */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            {existingApplication &&
            existingApplication.status !== "withdrawn" ? (
              <Link href="/student/applications">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto border-emerald-200 bg-emerald-50 text-emerald-800"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Đã ứng tuyển (Xem trạng thái)
                </Button>
              </Link>
            ) : closed ? (
              <Button variant="outline" size="lg" disabled>
                Hết hạn / Đã đóng tuyển dụng
              </Button>
            ) : auth.user && auth.user.role !== "student" ? (
              <span className="text-xs text-slate-500 rounded-xl bg-slate-100 px-3.5 py-2">
                Đăng nhập bằng tài khoản Sinh viên để ứng tuyển
              </span>
            ) : (
              <Link href={applyTargetHref}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  <Send className="h-4 w-4" />
                  Ứng tuyển ngay
                </Button>
              </Link>
            )}

            <SaveAndShareButtons jobId={job.id} initialSaved={isSaved} />
          </div>
        </div>

        {/* Key Metadata Grid */}
        <div className="mt-7 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-xl bg-blue-50/60 p-3.5">
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5 text-blue-600" /> Mức lương
            </p>
            <p className="mt-1 text-sm font-bold text-blue-800">
              {formatSalaryRange(job.salary_min, job.salary_max, job.salary_unit)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5">
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> Địa điểm
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {job.location}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5">
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Hình thức
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {job.work_mode} ({job.job_type})
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5">
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" /> Thời gian làm
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {job.working_time}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5">
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" /> Số lượng tuyển
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {job.vacancies} sinh viên
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5">
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> Hạn nộp hồ sơ
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatDateVN(job.deadline)}
            </p>
          </div>
        </div>
      </Card>

      {/* Main Content + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 md:p-8 space-y-7">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3 border-l-4 border-blue-600 pl-3">
                Mô tả công việc
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </section>

            <section className="pt-5 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-3 border-l-4 border-cyan-600 pl-3">
                Yêu cầu ứng viên
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </p>
            </section>

            <section className="pt-5 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-3 border-l-4 border-emerald-600 pl-3">
                Quyền lợi được hưởng
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {job.benefits}
              </p>
            </section>
          </Card>

          {/* Reviews Section */}
          <Card className="p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Đánh giá từ sinh viên đã làm việc ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500">
                Chưa có đánh giá nào cho công việc này. Đánh giá chỉ mở đối với
                sinh viên đã được chấp nhận nhận việc để đảm bảo tính khách quan.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">
                        {rev.student?.full_name || "Sinh viên đã xác thực"}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star
                            key={idx}
                            className="h-3.5 w-3.5 fill-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">{rev.comment}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatDateVN(rev.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {canReview && job.employer ? (
              <JobReviewForm jobId={job.id} employerId={job.employer.id} />
            ) : null}
          </Card>
        </div>

        {/* Right Column: Employer Info & Safety Alert */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Thông tin nhà tuyển dụng
            </h3>
            <div className="space-y-2.5 text-sm text-slate-600">
              <p className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                {job.employer?.company_name}
                {isVerified ? (
                  <BadgeCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : null}
              </p>
              {job.employer?.description ? (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {job.employer.description}
                </p>
              ) : null}
              <div className="pt-2 space-y-2 text-xs">
                <p>
                  <strong className="text-slate-800">Lĩnh vực:</strong>{" "}
                  {job.employer?.industry || "Đang cập nhật"}
                </p>
                <p>
                  <strong className="text-slate-800">Địa chỉ:</strong>{" "}
                  {job.employer?.address || job.location}
                </p>
                {job.employer?.founded_info ? (
                  <p>
                    <strong className="text-slate-800">Thời gian hoạt động:</strong>{" "}
                    {job.employer.founded_info}
                  </p>
                ) : null}
                <p>
                  <strong className="text-slate-800">Trạng thái xác minh:</strong>{" "}
                  <span
                    className={
                      isVerified
                        ? "font-semibold text-emerald-700"
                        : "font-semibold text-amber-700"
                    }
                  >
                    {verStatusInfo?.label}
                  </span>
                </p>
                {job.employer?.website ? (
                  <p className="flex items-center gap-1 text-blue-700 truncate">
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <span>{job.employer.website}</span>
                  </p>
                ) : null}
              </div>
            </div>
          </Card>

          {/* Safety Warning Box */}
          <Card className="p-6 border-amber-200 bg-amber-50/60 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              Cảnh báo An toàn dành cho Sinh viên
            </div>
            <ul className="space-y-1.5 text-xs text-amber-900/90 leading-relaxed">
              <li>• Tuyệt đối <strong>không chuyển tiền đặt cọc</strong> hoặc đóng phí nhận việc.</li>
              <li>• Không cung cấp mật khẩu tài khoản hay <strong>mã OTP</strong> ngân hàng.</li>
              <li>• Kiểm tra kỹ địa chỉ phỏng vấn trước khi đến trực tiếp.</li>
            </ul>
            <div className="pt-2 flex items-center justify-between border-t border-amber-200/70">
              <Link
                href="/safety"
                className="text-xs font-semibold text-blue-800 hover:underline"
              >
                Hướng dẫn an toàn
              </Link>
              <Link href={`/jobs/${job.id}/report`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Báo cáo tin tuyển dụng
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Related Jobs */}
      {relatedJobs.length > 0 ? (
        <section className="pt-6 border-t border-slate-200/80 space-y-5">
          <h2 className="text-xl font-bold text-slate-900">
            Công việc cùng danh mục {job.category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedJobs.map((rj) => (
              <JobCard key={rj.id} job={rj} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
