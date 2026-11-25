"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeCheck,
  BarChart2,
  Briefcase,
  Building2,
  ChevronRight,
  LogOut,
  PlusCircle,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { VERIFICATION_STATUS_MAP } from "@/lib/constants";
import type { EmployerProfile, Profile } from "@/types/database";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/services/actions";

interface EmployerWorkspaceShellProps {
  user: Profile;
  employerProfile: EmployerProfile | null;
  jobsCount: number;
  pendingApplicantsCount: number;
  totalApplicantsCount: number;
  children: React.ReactNode;
}

export function EmployerWorkspaceShell({
  user,
  employerProfile,
  jobsCount,
  pendingApplicantsCount,
  totalApplicantsCount,
  children,
}: EmployerWorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const verStatus = employerProfile?.verification_status || "not_submitted";
  const verInfo = VERIFICATION_STATUS_MAP[verStatus];

  async function handleLogout() {
    const res = await logoutAction();
    toast.success(res.message);
    router.push(res.redirectTo || "/");
    router.refresh();
  }

  const railItems = [
    {
      href: "/employer/dashboard",
      label: "Tổng quan",
      icon: BarChart2,
      badge: null,
    },
    {
      href: "/employer/applications",
      label: "Pipeline Ứng viên",
      icon: Users,
      badge: pendingApplicantsCount > 0 ? pendingApplicantsCount : totalApplicantsCount || null,
    },
    {
      href: "/employer/jobs",
      label: "Tin tuyển dụng",
      icon: Briefcase,
      badge: jobsCount > 0 ? jobsCount : null,
    },
    {
      href: "/employer/jobs/create",
      label: "Đăng tin mới",
      icon: PlusCircle,
      badge: null,
    },
    {
      href: "/employer/verification",
      label: "Xác minh đơn vị",
      icon: ShieldCheck,
      badge: null,
    },
    {
      href: "/employer/profile",
      label: "Hồ sơ doanh nghiệp",
      icon: Building2,
      badge: null,
    },
    {
      href: "/employer/settings",
      label: "Cài đặt",
      icon: Settings,
      badge: null,
    },
  ];

  const topTabs = [
    { href: "/employer/dashboard", label: "Dashboard", badge: null },
    {
      href: "/employer/applications",
      label: "Candidate Pipeline",
      badge: totalApplicantsCount > 0 ? totalApplicantsCount : null,
    },
    {
      href: "/employer/jobs",
      label: "Tin tuyển dụng",
      badge: jobsCount > 0 ? jobsCount : null,
    },
    { href: "/employer/jobs/create", label: "+ Tạo tin mới", badge: null },
    { href: "/employer/profile", label: "Hồ sơ đơn vị", badge: null },
    { href: "/employer/verification", label: "Xác minh", badge: null },
  ];

  const initials = (employerProfile?.company_name || user.full_name || "NT")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-[calc(100vh-68px)] bg-gradient-to-br from-indigo-100/50 via-slate-50 to-cyan-50/40 py-6 px-3 sm:px-6">
      <div className="mx-auto max-w-[1380px] rounded-[28px] border border-slate-200/90 bg-white/95 shadow-elevated overflow-hidden flex flex-col md:flex-row min-h-[750px]">
        {/* Left Slim Icon Rail */}
        <aside className="hidden md:flex w-[76px] shrink-0 flex-col items-center justify-between border-r border-slate-100 bg-white py-6">
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex items-center">
              <Link
                href="/"
                title="Về trang chủ STUWORK"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <ShieldCheck className="h-6 w-6" />
              </Link>
              <span className="-right-3 absolute flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-2xs">
                <ChevronRight className="h-3 w-3" />
              </span>
            </div>

            <nav className="flex flex-col items-center gap-3.5 pt-2">
              {railItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/employer/jobs"
                    ? pathname === "/employer/jobs"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all",
                      active
                        ? "bg-blue-50 text-blue-700 shadow-2xs"
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

          <div className="flex flex-col items-center gap-4">
            <Link
              href="/employer/profile"
              title={employerProfile?.company_name || user.full_name}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-cyan-500 text-xs font-extrabold text-white ring-2 ring-blue-100"
            >
              {initials}
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
          {/* Top Company Identity + Underline Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-extrabold text-slate-900">
                {employerProfile?.company_name || user.full_name}
              </span>
              <Badge className={verInfo?.badgeClass}>
                {verStatus === "verified" ? (
                  <BadgeCheck className="h-3.5 w-3.5" />
                ) : null}
                {verInfo?.label}
              </Badge>
            </div>
          </div>

          <div className="border-b border-slate-200 mb-7">
            <nav className="-mb-px flex flex-wrap items-center gap-6">
              {topTabs.map((tab) => {
                const active =
                  tab.href === "/employer/jobs"
                    ? pathname === "/employer/jobs"
                    : pathname.startsWith(tab.href);
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

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
