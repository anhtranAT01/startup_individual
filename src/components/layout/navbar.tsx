"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  ChevronDown,
  Flame,
  Kanban,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  logoutAction,
  sandboxSwitchDemoRoleAction,
} from "@/services/actions";

interface NavbarProps {
  user: Profile | null;
  unreadNotifications: number;
  isCloudMode: boolean;
}

export function Navbar({
  user,
  unreadNotifications,
  isCloudMode,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [switching, setSwitching] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  async function handleLogout() {
    const res = await logoutAction();
    toast.success(res.message);
    router.push(res.redirectTo || "/");
    router.refresh();
  }

  async function handleQuickSwitch(
    persona: "student" | "employer_verified" | "employer_pending" | "admin"
  ) {
    setSwitching(true);
    const res = await sandboxSwitchDemoRoleAction(persona);
    setSwitching(false);
    if (res.ok) {
      toast.success(res.message);
      router.push(res.redirectTo || "/");
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  const navItems = [
    { href: "/jobs", label: "Việc làm" },
    {
      href:
        user?.role === "employer"
          ? "/employer/applications"
          : "/student/profile",
      label: user?.role === "employer" ? "Hồ sơ ứng viên" : "Hồ sơ & CV",
    },
    {
      href:
        user?.role === "employer"
          ? "/employer/jobs"
          : "/student/applications",
      label: "Pipeline Ứng tuyển",
    },
    ...(user?.role !== "employer" && user?.role !== "admin"
      ? [{ href: "/student/saved-jobs", label: "Việc đã lưu" }]
      : []),
    { href: "/safety", label: "An toàn nghề nghiệp" },
    { href: "/guide", label: "Cẩm nang" },
  ];

  const dashboardHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "employer"
      ? "/employer/dashboard"
      : "/student/dashboard";

  const initials = (user?.full_name || "SW")
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Promotional Announcement Strip */}
      <div className="bg-gradient-to-r from-[#052e1a] via-[#074226] to-[#052e1a] text-emerald-100 text-xs border-b border-emerald-800/60">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#00b14f] px-2 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wide">
              <Flame className="h-3 w-3 fill-amber-300 text-amber-300" />
              Mới 2026
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-emerald-50">
              Chiến dịch <strong>Việc làm thêm & Thực tập An toàn</strong>: 100% Đơn vị đã xác minh pháp lý & Miễn phí ứng tuyển!
            </span>
            <Link
              href="/jobs?verified_only=1"
              className="hidden md:inline-flex items-center gap-1 text-[11px] font-extrabold text-[#4ade80] hover:underline"
            >
              Ứng tuyển ngay <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!isCloudMode ? (
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-300/80 hidden sm:inline text-[11px]">
                Demo nhanh:
              </span>
              <button
                type="button"
                disabled={switching}
                onClick={() => handleQuickSwitch("student")}
                className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200 hover:bg-white/20 transition-colors"
              >
                Sinh viên
              </button>
              <button
                type="button"
                disabled={switching}
                onClick={() => handleQuickSwitch("employer_verified")}
                className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-lime-200 hover:bg-white/20 transition-colors"
              >
                Nhà tuyển dụng
              </button>
              <button
                type="button"
                disabled={switching}
                onClick={() => handleQuickSwitch("admin")}
                className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200 hover:bg-white/20 transition-colors"
              >
                Admin
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-emerald-200/90">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#4ade80]" />
                Khớp ca học tự động
              </span>
              <span>•</span>
              <Link href="/safety" className="hover:text-white underline">
                Bảo vệ sinh viên 24/7
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-emerald-100/90 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="container flex h-[70px] items-center justify-between gap-4">
          {/* Left: Brand Logo + Navigation */}
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00b14f] via-emerald-600 to-teal-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  stu<span className="text-[#00b14f]">work</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                  Tiếp lợi thế • Việc an toàn
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-xl px-3.5 py-2 text-sm font-bold transition-colors",
                      active
                        ? "text-[#00873c] bg-emerald-50"
                        : "text-slate-700 hover:text-[#009b45] hover:bg-emerald-50/50"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Buttons (TopCV Green Style) */}
          <div className="hidden md:flex items-center gap-2.5">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center rounded-xl border-2 border-[#00b14f] bg-white px-4 text-sm font-bold text-[#009b45] hover:bg-emerald-50 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-[#00b14f] px-4 text-sm font-bold text-white shadow-xs hover:bg-[#009b45] transition-colors"
                >
                  Đăng ký
                </Link>
                <Link
                  href="/register?role=employer"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-[#072e1b] px-4 text-sm font-bold text-white shadow-xs hover:bg-[#0b4227] transition-colors"
                >
                  Đăng tuyển & tìm hồ sơ
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                {user.role === "student" ? (
                  <Link
                    href="/student/applications"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 text-xs font-bold text-[#00873c] hover:bg-emerald-100 transition-colors"
                  >
                    <Kanban className="h-3.5 w-3.5" />
                    My Application Pipeline
                  </Link>
                ) : null}

                {user.role === "employer" ? (
                  <Link
                    href="/employer/jobs/create"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#072e1b] px-3.5 text-xs font-bold text-white hover:bg-[#0b4227] transition-colors"
                  >
                    <PlusCircle className="h-3.5 w-3.5 text-[#4ade80]" />
                    Đăng tuyển & tìm hồ sơ
                  </Link>
                ) : null}

                {user.role === "admin" ? (
                  <Link
                    href="/admin"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 text-xs font-bold text-[#00873c] hover:bg-emerald-100"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Trung tâm Quản trị
                  </Link>
                ) : null}

                <Link
                  href="/notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:text-[#009b45] transition-colors"
                  aria-label="Thông báo"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 ? (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00b14f] px-1 text-[10px] font-bold text-white shadow-2xs">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  ) : null}
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setAccountOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white pl-1.5 pr-2.5 py-1 text-left hover:bg-emerald-50/40 transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#00b14f] to-teal-600 text-xs font-bold text-white overflow-hidden">
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
                    </div>
                    <div className="max-w-[130px]">
                      <p className="truncate text-xs font-bold text-slate-800">
                        {user.full_name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {user.role === "admin"
                          ? "Quản trị viên"
                          : user.role === "employer"
                          ? "Nhà tuyển dụng"
                          : "Sinh viên"}
                      </p>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>

                  {accountOpen ? (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-elevated animate-in fade-in zoom-in-95 duration-100">
                      <div className="border-b border-slate-100 px-3 py-2">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {user.full_name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href={dashboardHref}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50/60"
                        >
                          <LayoutDashboard className="h-4 w-4 text-[#00b14f]" />
                          Workspace Tổng quan
                        </Link>

                        {user.role === "student" ? (
                          <>
                            <Link
                              href="/student/applications"
                              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50/60"
                            >
                              <span className="flex items-center gap-2.5">
                                <Kanban className="h-4 w-4 text-emerald-600" />
                                My Application Pipeline
                              </span>
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                Live
                              </span>
                            </Link>
                            <Link
                              href="/student/profile"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50/60"
                            >
                              <UserCircle2 className="h-4 w-4 text-slate-500" />
                              Hồ sơ & Lịch rảnh
                            </Link>
                            <Link
                              href="/student/saved-jobs"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50/60"
                            >
                              <Bookmark className="h-4 w-4 text-slate-500" />
                              Công việc đã lưu
                            </Link>
                          </>
                        ) : null}

                        {user.role === "employer" ? (
                          <>
                            <Link
                              href="/employer/applications"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50/60"
                            >
                              <Kanban className="h-4 w-4 text-emerald-600" />
                              Pipeline Ứng viên
                            </Link>
                            <Link
                              href="/employer/jobs"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50/60"
                            >
                              <Briefcase className="h-4 w-4 text-slate-500" />
                              Tin tuyển dụng đã đăng
                            </Link>
                            <Link
                              href="/employer/profile"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50/60"
                            >
                              <Building2 className="h-4 w-4 text-slate-500" />
                              Hồ sơ doanh nghiệp
                            </Link>
                            <Link
                              href="/employer/verification"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50/60"
                            >
                              <ShieldCheck className="h-4 w-4 text-[#00b14f]" />
                              Xác minh tài khoản
                            </Link>
                          </>
                        ) : null}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
              aria-label="Mở menu điều hướng"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden space-y-3 shadow-lg">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#00873c]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              {!user ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      className="flex h-10 items-center justify-center rounded-xl border-2 border-[#00b14f] text-sm font-bold text-[#009b45]"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      className="flex h-10 items-center justify-center rounded-xl bg-[#00b14f] text-sm font-bold text-white"
                    >
                      Đăng ký
                    </Link>
                  </div>
                  <Link
                    href="/register?role=employer"
                    className="flex h-10 items-center justify-center rounded-xl bg-[#072e1b] text-sm font-bold text-white"
                  >
                    Đăng tuyển & tìm hồ sơ
                  </Link>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href={dashboardHref}
                    className="flex h-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-[#00873c]"
                  >
                    Bảng điều khiển ({user.full_name})
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex h-10 items-center justify-center rounded-xl border border-rose-200 text-sm font-bold text-rose-600"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
