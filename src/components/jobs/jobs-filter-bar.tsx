"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  FILTER_CATEGORIES,
  JOB_TYPES,
  LOCATIONS,
  SALARY_RANGES,
  WORKING_TIMES,
} from "@/lib/constants";
import type { JobFilterParams } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, SelectNative } from "@/components/ui/form-controls";

interface JobsFilterSidebarProps {
  initialFilters: JobFilterParams;
  totalResults: number;
}

export function JobsFilterPanel({
  initialFilters,
  totalResults,
}: JobsFilterSidebarProps) {
  const router = useRouter();
  const [q, setQ] = React.useState(initialFilters.q || "");
  const [jobType, setJobType] = React.useState(initialFilters.job_type || "");
  const [category, setCategory] = React.useState(initialFilters.category || "");
  const [salaryRange, setSalaryRange] = React.useState(
    initialFilters.salary_range || ""
  );
  const [location, setLocation] = React.useState(initialFilters.location || "");
  const [workingTime, setWorkingTime] = React.useState(
    initialFilters.working_time || ""
  );
  const [verifiedOnly, setVerifiedOnly] = React.useState(
    Boolean(initialFilters.verified_only)
  );
  const [sort, setSort] = React.useState<JobFilterParams["sort"]>(
    initialFilters.sort || "newest"
  );
  const [mobileOpen, setMobileOpen] = React.useState(false);

  function pushFilters(overrides: Partial<JobFilterParams> = {}) {
    const merged: JobFilterParams = {
      q,
      job_type: jobType,
      category,
      salary_range: salaryRange,
      location,
      working_time: workingTime,
      verified_only: verifiedOnly,
      sort,
      ...overrides,
    };

    const sp = new URLSearchParams();
    if (merged.q?.trim()) sp.set("q", merged.q.trim());
    if (merged.job_type) sp.set("job_type", merged.job_type);
    if (merged.category) sp.set("category", merged.category);
    if (merged.salary_range) sp.set("salary_range", merged.salary_range);
    if (merged.location) sp.set("location", merged.location);
    if (merged.working_time) sp.set("working_time", merged.working_time);
    if (merged.verified_only) sp.set("verified_only", "1");
    if (merged.sort && merged.sort !== "newest") sp.set("sort", merged.sort);

    router.push(`/jobs?${sp.toString()}`);
  }

  function handleReset() {
    setQ("");
    setJobType("");
    setCategory("");
    setSalaryRange("");
    setLocation("");
    setWorkingTime("");
    setVerifiedOnly(false);
    setSort("newest");
    router.push("/jobs");
  }

  return (
    <div className="space-y-5">
      {/* Top Search & Sort Bar */}
      <Card className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            pushFilters();
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
        >
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tên việc làm, đơn vị, kỹ năng, quận huyện (VD: Cầu Giấy)..."
              className="pl-10"
            />
          </div>

          <div className="md:col-span-3">
            <SelectNative
              value={sort}
              onChange={(e) => {
                const nextSort = e.target.value as JobFilterParams["sort"];
                setSort(nextSort);
                pushFilters({ sort: nextSort });
              }}
              aria-label="Sắp xếp công việc"
            >
              <option value="newest">Sắp xếp: Mới nhất</option>
              <option value="salary_desc">Sắp xếp: Lương cao nhất</option>
              <option value="best_match">Sắp xếp: Phù hợp nhất</option>
            </SelectNative>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              <Filter className="h-4 w-4" />
              Lọc ({totalResults})
            </Button>
            <Button
              type="button"
              variant="outline"
              className="lg:hidden"
              onClick={() => setMobileOpen((p) => !p)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Sidebar Filters (Always visible on lg+, collapsible on mobile) */}
      <div className={mobileOpen ? "block" : "hidden lg:block"}>
        <Card className="p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-blue-700" />
              Bộ lọc chi tiết
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              Đặt lại
            </button>
          </div>

          {/* Độ tin cậy */}
          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/70 p-3.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => {
                  setVerifiedOnly(e.target.checked);
                  pushFilters({ verified_only: e.target.checked });
                }}
                className="h-4 w-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1">
                <BadgeCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                Chỉ nhà tuyển dụng đã xác minh
              </span>
            </label>
          </div>

          {/* Loại công việc */}
          <div>
            <Label>Theo loại công việc</Label>
            <SelectNative
              value={jobType}
              onChange={(e) => {
                setJobType(e.target.value);
                pushFilters({ job_type: e.target.value });
              }}
            >
              <option value="">Tất cả loại hình</option>
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </SelectNative>
          </div>

          {/* Danh mục */}
          <div>
            <Label>Theo danh mục</Label>
            <SelectNative
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                pushFilters({ category: e.target.value });
              }}
            >
              <option value="">Tất cả danh mục</option>
              {FILTER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectNative>
          </div>

          {/* Mức lương */}
          <div>
            <Label>Theo mức lương</Label>
            <SelectNative
              value={salaryRange}
              onChange={(e) => {
                setSalaryRange(e.target.value);
                pushFilters({ salary_range: e.target.value });
              }}
            >
              <option value="">Tất cả mức lương</option>
              {SALARY_RANGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </SelectNative>
          </div>

          {/* Địa điểm */}
          <div>
            <Label>Theo địa điểm</Label>
            <SelectNative
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                pushFilters({ location: e.target.value });
              }}
            >
              <option value="">Toàn quốc & Từ xa</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </SelectNative>
          </div>

          {/* Thời gian */}
          <div>
            <Label>Theo ca / thời gian làm việc</Label>
            <SelectNative
              value={workingTime}
              onChange={(e) => {
                setWorkingTime(e.target.value);
                pushFilters({ working_time: e.target.value });
              }}
            >
              <option value="">Mọi khung giờ</option>
              {WORKING_TIMES.map((wt) => (
                <option key={wt} value={wt}>
                  {wt}
                </option>
              ))}
            </SelectNative>
          </div>
        </Card>
      </div>
    </div>
  );
}
