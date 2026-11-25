"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Clock,
  Heart,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { Job } from "@/types/database";
import { cn, formatSalaryRange } from "@/lib/utils";
import { toggleSaveJobAction } from "@/services/actions";

interface JobCardProps {
  job: Job;
  showMatchScore?: boolean;
  initialSaved?: boolean;
}

const AVATAR_STYLES = [
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-cyan-50 text-cyan-700 border-cyan-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "bg-amber-50 text-amber-700 border-amber-200",
];

export function JobCard({
  job,
  showMatchScore = false,
  initialSaved = false,
}: JobCardProps) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(initialSaved);
  const [saving, setSaving] = React.useState(false);

  const companyName = job.employer?.company_name || "Đơn vị tuyển dụng";
  const isVerified = job.employer?.verification_status === "verified";
  const initials = companyName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const boxTone = AVATAR_STYLES[companyName.length % AVATAR_STYLES.length];

  async function handleToggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    const res = await toggleSaveJobAction(job.id);
    setSaving(false);

    if (!res.ok) {
      toast.info(res.message);
      if (res.redirectTo) router.push(res.redirectTo);
      return;
    }
    setSaved(Boolean(res.data?.saved));
    toast.success(res.message);
  }

  return (
    <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/70 hover:shadow-elevated flex flex-col justify-between">
      {/* Top section: Square Logo Box + Title + Company (Matching Image 2 TopCV card layout) */}
      <div className="flex items-start gap-3.5">
        <Link
          href={`/jobs/${job.id}`}
          className={cn(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border text-sm font-extrabold transition-transform group-hover:scale-105",
            boxTone
          )}
        >
          {job.employer?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.employer.logo_url}
              alt={companyName}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            initials
          )}
          {isVerified ? (
            <span
              title="Nhà tuyển dụng đã xác minh"
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white"
            >
              <BadgeCheck className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/jobs/${job.id}`}
              className="line-clamp-1 text-[15px] font-bold text-slate-900 group-hover:text-blue-700 transition-colors"
              title={`${job.title} — ${job.working_time}`}
            >
              {job.title}
            </Link>
            {showMatchScore && job.match_score ? (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-cyan-50 border border-cyan-200 px-2 py-0.5 text-[10px] font-bold text-cyan-700">
                <Sparkles className="h-2.5 w-2.5" />
                {job.match_score}%
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
            {companyName}
          </p>

          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 truncate">
              <Clock className="h-3 w-3 text-slate-400 shrink-0" />
              {job.working_time}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom section: Pill Badges (Salary + Location + Type) on left, Heart Save icon on right */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
            {formatSalaryRange(job.salary_min, job.salary_max, job.salary_unit)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 truncate max-w-[140px]">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{job.location}</span>
          </span>
          {job.is_demo ? (
            <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
              Demo
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleToggleSave}
          disabled={saving}
          aria-label="Lưu công việc yêu thích"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
            saved
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : "border-slate-200 bg-white text-slate-400 hover:border-blue-300 hover:text-blue-600"
          )}
        >
          <Heart className={cn("h-4 w-4", saved ? "fill-rose-500" : "")} />
        </button>
      </div>
    </div>
  );
}
