import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Clock,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { Job } from "@/types/database";
import { formatSalaryRange } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface JobCardProps {
  job: Job;
  showMatchScore?: boolean;
}

const AVATAR_GRADIENTS = [
  "from-blue-600 to-cyan-500",
  "from-indigo-600 to-blue-500",
  "from-teal-600 to-emerald-500",
  "from-sky-600 to-indigo-500",
];

export function JobCard({ job, showMatchScore = false }: JobCardProps) {
  const companyName = job.employer?.company_name || "Đơn vị tuyển dụng";
  const isVerified = job.employer?.verification_status === "verified";
  const initials = companyName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const grad =
    AVATAR_GRADIENTS[companyName.length % AVATAR_GRADIENTS.length];

  return (
    <Card className="p-5 flex flex-col justify-between card-hover group relative overflow-hidden">
      <div>
        {/* Top Row: Logo + Company + Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-sm font-extrabold text-white shadow-xs overflow-hidden`}
            >
              {job.employer?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.employer.logo_url}
                  alt={companyName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <Link
                href={`/jobs/${job.id}`}
                className="block truncate text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors"
                title={job.title}
              >
                {job.title}
              </Link>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span className="truncate font-medium text-slate-700">
                  {companyName}
                </span>
                {isVerified ? (
                  <span
                    className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold"
                    title="Nhà tuyển dụng đã xác minh"
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Đã xác minh
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {showMatchScore && job.match_score ? (
            <Badge tone="cyan" className="shrink-0">
              <Sparkles className="h-3 w-3" />
              {job.match_score}% phù hợp
            </Badge>
          ) : null}
        </div>

        {/* Tags */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <Badge tone="default">{job.job_type}</Badge>
          <Badge tone="neutral">{job.work_mode}</Badge>
          {job.is_demo ? <Badge tone="demo">Dữ liệu minh họa</Badge> : null}
        </div>

        {/* Meta Info */}
        <div className="mt-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-blue-700 text-sm">
            <Wallet className="h-4 w-4 shrink-0 text-blue-600" />
            <span>
              {formatSalaryRange(job.salary_min, job.salary_max, job.salary_unit)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{job.working_time}</span>
          </div>
        </div>

        {showMatchScore && job.match_reasons && job.match_reasons.length > 0 ? (
          <div className="mt-3 rounded-xl bg-cyan-50/70 border border-cyan-100 px-3 py-1.5 text-[11px] text-cyan-800">
            Gợi ý: {job.match_reasons.join(" • ")}
          </div>
        ) : null}
      </div>

      {/* Footer CTA */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
          Tuyển {job.vacancies} bạn
        </span>
        <Link href={`/jobs/${job.id}`}>
          <Button variant="secondary" size="sm" className="group-hover:bg-blue-700 group-hover:text-white group-hover:border-blue-700">
            Xem chi tiết
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
