"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import type { Job } from "@/types/database";
import { cn } from "@/lib/utils";
import { JobCard } from "./job-card";

const LOCATION_PILLS = [
  { id: "all", label: "Ngẫu Nhiên / Tất cả" },
  { id: "Hà Nội", label: "Hà Nội" },
  { id: "TP. Hồ Chí Minh", label: "Thành phố Hồ Chí Minh" },
  { id: "Đà Nẵng", label: "Đà Nẵng" },
  { id: "Làm việc từ xa", label: "Làm việc từ xa (Remote)" },
  { id: "Ca tối", label: "Ca tối linh hoạt" },
];

export function FeaturedJobsTabs({ jobs }: { jobs: Job[] }) {
  const [activePill, setActivePill] = React.useState("all");
  const [filterMode, setFilterMode] = React.useState<"location" | "category">(
    "location"
  );
  const [showTip, setShowTip] = React.useState(true);
  const [page, setPage] = React.useState(0);

  const pills =
    filterMode === "location"
      ? LOCATION_PILLS
      : [
          { id: "all", label: "Tất cả ngành" },
          { id: "Phục vụ", label: "Phục vụ – Cafe" },
          { id: "Gia sư", label: "Gia sư – Trợ giảng" },
          { id: "Marketing", label: "Content – Marketing" },
          { id: "Bán hàng", label: "Bán hàng – Thu ngân" },
          { id: "Công nghệ", label: "Công nghệ – IT" },
        ];

  const filtered = React.useMemo(() => {
    if (activePill === "all") return jobs;
    return jobs.filter((job) => {
      if (filterMode === "category") {
        return job.category === activePill;
      }
      if (activePill === "Ca tối") {
        return job.working_time.toLowerCase().includes("ca tối");
      }
      if (activePill === "Làm việc từ xa") {
        return (
          job.work_mode === "Remote" ||
          job.location.toLowerCase().includes("từ xa")
        );
      }
      return job.location.toLowerCase().includes(activePill.toLowerCase());
    });
  }, [jobs, activePill, filterMode]);

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentSlice = filtered.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-5">
      {/* Header Row matching Image 2 ("Việc làm tốt nhất | Đề xuất bởi STUWORK MATCH") */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-800">
            Việc làm tốt nhất
          </h2>
          <div className="hidden sm:flex items-center gap-1.5 border-l-2 border-slate-200 pl-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div className="leading-none">
              <span className="block text-[10px] font-semibold uppercase text-slate-400">
                Đề xuất bởi
              </span>
              <span className="text-xs font-extrabold tracking-tight text-slate-900">
                STUWORK MATCH
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/jobs"
            className="text-sm font-semibold text-slate-700 hover:text-blue-700 underline underline-offset-4 mr-1"
          >
            Xem tất cả
          </Link>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Trang trước"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            aria-label="Trang tiếp"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Dropdown + Quick Location Pills Row (Matching Image 2) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600 shadow-2xs w-fit">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
          <span>Lọc theo:</span>
          <select
            value={filterMode}
            onChange={(e) => {
              setFilterMode(e.target.value as "location" | "category");
              setActivePill("all");
              setPage(0);
            }}
            className="font-bold text-slate-900 bg-transparent focus:outline-none"
          >
            <option value="location">Địa điểm & Ca làm</option>
            <option value="category">Nhóm ngành nghề</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pills.map((pill) => {
            const active = activePill === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => {
                  setActivePill(pill.id);
                  setPage(0);
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-bold transition-all",
                  active
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                )}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dismissible Tip Banner (Matching Image 2) */}
      {showTip ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-200/80 bg-blue-50/50 px-4 py-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              <strong className="text-blue-800">Gợi ý:</strong> Di chuột vào
              tiêu đề việc làm để xem nhanh khung giờ ca làm, nhấn biểu tượng
              trái tim để lưu công việc vào tài khoản của bạn.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowTip(false)}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Đóng gợi ý"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* 3-Column Compact Modern Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSlice.map((job) => (
          <JobCard key={job.id} job={job} showMatchScore />
        ))}
      </div>
    </div>
  );
}
