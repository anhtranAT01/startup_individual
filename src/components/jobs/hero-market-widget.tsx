"use client";

import * as React from "react";
import { BarChart3, Search, TrendingUp } from "lucide-react";

interface MarketBarItem {
  label: string;
  count: number;
  barColor: string;
  dotColor: string;
}

const CATEGORY_MARKET_DATA: MarketBarItem[] = [
  {
    label: "Phục vụ / F&B",
    count: 142,
    barColor: "from-emerald-400 to-teal-500",
    dotColor: "bg-emerald-400",
  },
  {
    label: "Marketing / Content",
    count: 118,
    barColor: "from-blue-400 to-indigo-500",
    dotColor: "bg-blue-400",
  },
  {
    label: "Gia sư / Trợ giảng",
    count: 96,
    barColor: "from-amber-400 to-orange-500",
    dotColor: "bg-amber-400",
  },
  {
    label: "Bán hàng / CSKH",
    count: 84,
    barColor: "from-cyan-400 to-sky-500",
    dotColor: "bg-cyan-400",
  },
  {
    label: "Công nghệ / Thiết kế",
    count: 72,
    barColor: "from-lime-400 to-emerald-500",
    dotColor: "bg-lime-400",
  },
];

const SHIFT_MARKET_DATA: MarketBarItem[] = [
  {
    label: "Ca tối (18h–22h)",
    count: 164,
    barColor: "from-emerald-400 to-teal-500",
    dotColor: "bg-emerald-400",
  },
  {
    label: "Linh hoạt / Remote",
    count: 135,
    barColor: "from-blue-400 to-indigo-500",
    dotColor: "bg-blue-400",
  },
  {
    label: "Cuối tuần (T7–CN)",
    count: 98,
    barColor: "from-amber-400 to-orange-500",
    dotColor: "bg-amber-400",
  },
  {
    label: "Ca chiều (13h–17h)",
    count: 68,
    barColor: "from-cyan-400 to-sky-500",
    dotColor: "bg-cyan-400",
  },
  {
    label: "Ca sáng (7h–12h)",
    count: 47,
    barColor: "from-lime-400 to-emerald-500",
    dotColor: "bg-lime-400",
  },
];

export function HeroMarketWidget({
  activeJobsCount,
  verifiedJobsCount,
}: {
  activeJobsCount: number;
  verifiedJobsCount: number;
}) {
  const [mode, setMode] = React.useState<"category" | "shift">("category");
  const items = mode === "category" ? CATEGORY_MARKET_DATA : SHIFT_MARKET_DATA;
  const maxVal = Math.max(...items.map((i) => i.count));

  const todayStr = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-md shadow-elevated text-white flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
              <Search className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-white">
              Thị trường việc làm hôm nay:
            </span>
          </div>
          <span className="text-xs font-semibold text-cyan-300">{todayStr}</span>
        </div>

        {/* 2 Live KPI Metrics Row */}
        <div className="grid grid-cols-2 gap-4 py-3.5 border-b border-white/10">
          <div className="flex items-center justify-between pr-2 border-r border-white/10">
            <span className="text-xs text-slate-300">Việc làm đang tuyển</span>
            <span className="inline-flex items-center gap-1 text-base font-extrabold text-cyan-300">
              {activeJobsCount}
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            </span>
          </div>
          <div className="flex items-center justify-between pl-1">
            <span className="text-xs text-slate-300">Tin đã xác minh</span>
            <span className="text-base font-extrabold text-emerald-300">
              {verifiedJobsCount}
            </span>
          </div>
        </div>

        {/* Chart Title & Filter Dropdown */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <BarChart3 className="h-4 w-4 text-cyan-300" />
            <span>Nhu cầu tuyển dụng theo</span>
          </div>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "category" | "shift")}
            aria-label="Chế độ thống kê nhu cầu tuyển dụng"
            className="rounded-lg border border-cyan-400/40 bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-cyan-200 focus:outline-none"
          >
            <option value="category">Ngành nghề</option>
            <option value="shift">Ca làm việc</option>
          </select>
        </div>

        {/* 5 Vertical Colored Bar Columns (Matching Image 2) */}
        <div className="mt-5 grid grid-cols-5 gap-3 items-end h-32 pt-4 px-1">
          {items.map((item) => {
            const heightPct = Math.max(22, Math.round((item.count / maxVal) * 100));
            return (
              <div
                key={item.label}
                className="flex flex-col items-center justify-end h-full gap-1.5 group"
              >
                <div className="w-full flex items-end justify-center h-24">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[44px] rounded-t-lg bg-gradient-to-t ${item.barColor} shadow-sm transition-all duration-300 group-hover:brightness-110`}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-200">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Legend & Demo Note */}
      <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate"
            >
              <span className={`h-2 w-3 rounded-xs shrink-0 ${item.dotColor}`} />
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400">
          * Biểu đồ minh họa xu hướng tuyển dụng sinh viên trong môi trường Demo MVP.
        </p>
      </div>
    </div>
  );
}
