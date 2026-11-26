"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart2,
  Bookmark,
  CheckSquare,
  ChevronRight,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/types/database";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/services/actions";

interface StudentWorkspaceShellProps {
  user: Profile;
  applicationsCount: number;
  savedCount: number;
  children: React.ReactNode;
}

export function StudentWorkspaceShell({
  user,
  applicationsCount,
  savedCount,
  children,
}: StudentWorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const res = await logoutAction();
    toast.success(res.message);
    router.push(res.redirectTo || "/");
    router.refresh();
  }

  const railItems = [
    {
      href: "/student/dashboard",
      label: "Dashboard",
      icon: BarChart2,
      badge: null,
    },
    {
      href: "/student/applications",
      label: "My Application Pipeline",
      icon: CheckSquare,
      badge: applicationsCount > 0 ? applicationsCount : null,
    },
    {
      href: "/student/saved-jobs",
      label: "Việc đã lưu & Kết nối",
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null,
    },
    {
      href: "/student/profile",
      label: "Hồ sơ & Lịch rảnh",
      icon: Settings,
      badge: null,
    },
  ];

  const topTabs = [
    { href: "/student/dashboard", label: "Dashboard", badge: null },
    {
      href: "/student/saved-jobs",
      label: "Việc đã lưu",
      badge: savedCount > 0 ? savedCount : null,
    },
    {
      href: "/student/applications",
      label: "Applications",
      badge: applicationsCount > 0 ? applicationsCount : null,
    },
    { href: "/student/profile", label: "Availabilities & CV", badge: null },
  ];

  const initials = (user.full_name || "SV")
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-[calc(100vh-68px)] bg-gradient-to-br from-emerald-100/55 via-slate-50 to-teal-50/50 py-6 px-3 sm:px-6">
      <div className="mx-auto max-w-[1360px] rounded-[28px] border border-slate-200/90 bg-white/95 shadow-elevated overflow-hidden flex flex-col md:flex-row min-h-[740px]">
        {/* Left Slim Icon Rail (Matching Image 1 left sidebar with green notification pills) */}
        <aside className="hidden md:flex w-[76px] shrink-0 flex-col items-center justify-between border-r border-slate-100 bg-white py-6">
          <div className="flex flex-col items-center gap-7">
            {/* Top Brand Icon + Expand Badge */}
            <div className="relative flex items-center">
              <Link
                href="/"
                title="Về trang chủ STUWORK"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00b14f] text-white shadow-sm hover:bg-[#009b45] transition-colors"
              >
                <ShieldCheck className="h-6 w-6" />
              </Link>
              <span className="-right-3 absolute flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-2xs">
                <ChevronRight className="h-3 w-3" />
              </span>
            </div>

            {/* Vertical Icon Menu with Emerald Counter Pills */}
            <nav className="flex flex-col items-center gap-4 pt-2">
              {railItems.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all",
                      active
                        ? "bg-emerald-50 text-[#00873c] shadow-2xs"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.badge != null ? (
                      <span className="absolute -top-1.5 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1.5 text-[10px] font-extrabold text-slate-950 shadow-2xs">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Avatar & Logout */}
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/student/profile"
              title={user.full_name}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-extrabold text-white ring-2 ring-blue-100 overflow-hidden"
            >
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </aside>

        {/* Main Workspace Container */}
        <div className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10 flex flex-col">
          {/* Top Horizontal Underline Tabs Bar (Matching Image 1: Dashboard | Connections 10 | Applications | Availabilities) */}
          <div className="border-b border-slate-200 mb-7">
            <nav className="-mb-px flex flex-wrap items-center gap-6 sm:gap-8">
              {topTabs.map((tab) => {
                const active = pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      "inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors",
                      active
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-400 hover:text-slate-700"
                    )}
                  >
                    <span>{tab.label}</span>
                    {tab.badge != null ? (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1.5 text-[11px] font-extrabold text-slate-950">
                        {tab.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Page Content */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
