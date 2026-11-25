"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  ChevronDown,
  FileText,
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
import { Button } from "@/components/ui/button";
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
    { href: "/", label: "Trang chủ" },
    { href: "/jobs", label: "Tìm việc" },
    ...(user?.role !== "employer" && user?.role !== "admin"
      ? [{ href: "/student/saved-jobs", label: "Việc đã lưu" }]
      : []),
    { href: "/safety", label: "Hướng dẫn an toàn" },
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
      {!isCloudMode ? (
        <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800">
          <div className="container flex flex-wrap items-center justify-between gap-2 py-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>
                <strong>Chế độ trình diễn cục bộ (Local Sandbox):</strong> Dữ liệu mẫu
                đang hoạt động trực tiếp. Cấu hình <code className="text-cyan-300">.env.local</code> để kết nối Supabase Cloud.
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 hidden sm:inline">Đổi nhanh vai trò Demo:</span>
              <button
                type="button"
                disabled={switching}
                onClick={() => handleQuickSwitch("student")}
                className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-cyan-300 hover:bg-slate-700"
              >
                Sinh viên
              </button>
              <button
                type="button"
                disabled={switching}
                onClick={() => handleQuickSwitch("employer_verified")}
                className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-emerald-300 hover:bg-slate-700"
              >
                NTD (Đã xác minh)
              </button>
              <button
                type="button"
                disabled={switching}
                onClick={() => handleQuickSwitch("admin")}
                className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-amber-300 hover:bg-slate-700"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-600 text-white shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                STU<span className="text-blue-700">WORK</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                Việc làm thêm an toàn
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {user?.role === "employer" ? (
              <Link href="/employer/jobs/create">
                <Button variant="accent" size="sm" className="h-9 px-3.5 text-sm">
                  <PlusCircle className="h-4 w-4" />
                  Đăng tin tuyển dụng
                </Button>
              </Link>
            ) : null}

            {user?.role === "admin" ? (
              <Link href="/admin">
                <Button variant="secondary" size="sm" className="h-9 px-3.5 text-sm">
                  <ShieldAlert className="h-4 w-4 text-blue-700" />
                  Trang quản trị
                </Button>
              </Link>
            ) : null}

            {!user ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="md">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="md">
                    Đăng ký ngay
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                  aria-label="Thông báo"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 ? (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  ) : null}
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setAccountOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white pl-1.5 pr-2.5 py-1 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-xs font-bold text-white overflow-hidden">
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
                      <p className="truncate text-xs font-semibold text-slate-800">
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
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-elevated animate-in fade-in zoom-in-95 duration-100">
                      <div className="border-b border-slate-100 px-3 py-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {user.full_name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href={dashboardHref}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <LayoutDashboard className="h-4 w-4 text-blue-600" />
                          Bảng điều khiển
                        </Link>

                        {user.role === "student" ? (
                          <>
                            <Link
                              href="/student/profile"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <UserCircle2 className="h-4 w-4 text-slate-500" />
                              Hồ sơ cá nhân & CV
                            </Link>
                            <Link
                              href="/student/applications"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <FileText className="h-4 w-4 text-slate-500" />
                              Đơn đã ứng tuyển
                            </Link>
                            <Link
                              href="/student/saved-jobs"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Bookmark className="h-4 w-4 text-slate-500" />
                              Công việc đã lưu
                            </Link>
                          </>
                        ) : null}

                        {user.role === "employer" ? (
                          <>
                            <Link
                              href="/employer/jobs"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Briefcase className="h-4 w-4 text-slate-500" />
                              Quản lý tin tuyển dụng
                            </Link>
                            <Link
                              href="/employer/applications"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <FileText className="h-4 w-4 text-slate-500" />
                              Danh sách ứng viên
                            </Link>
                            <Link
                              href="/employer/profile"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Building2 className="h-4 w-4 text-slate-500" />
                              Hồ sơ doanh nghiệp
                            </Link>
                            <Link
                              href="/employer/verification"
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              Xác minh tài khoản
                            </Link>
                          </>
                        ) : null}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
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
            {user ? (
              <Link
                href="/notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                    {unreadNotifications}
                  </span>
                ) : null}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
              aria-label="Mở menu điều hướng"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.label}
                </Link>
              ))}
              {user?.role === "employer" ? (
                <Link
                  href="/employer/jobs/create"
                  className="rounded-xl bg-cyan-50 px-3 py-2.5 text-sm font-semibold text-cyan-800"
                >
                  + Đăng tin tuyển dụng
                </Link>
              ) : null}
            </nav>

            <div className="border-t border-slate-100 pt-3">
              {!user ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" className="w-full">
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href={dashboardHref}>
                    <Button variant="secondary" className="w-full justify-start">
                      <LayoutDashboard className="h-4 w-4" />
                      Bảng điều khiển ({user.full_name})
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-start text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
