import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Building2,
  Flag,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getCurrentAuthContext } from "@/services/data-service";

export const dynamic = "force-dynamic";

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getCurrentAuthContext();

  // Bảo vệ nghiêm ngặt từ phía Server: Chỉ role === 'admin' mới được phép vào /admin
  if (!auth.user) {
    redirect("/login?next=/admin");
  }
  if (auth.user.role !== "admin") {
    redirect(
      auth.user.role === "employer"
        ? "/employer/dashboard"
        : "/student/dashboard"
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Người dùng", icon: Users },
    { href: "/admin/employers", label: "Nhà tuyển dụng", icon: Building2 },
    {
      href: "/admin/verifications",
      label: "Yêu cầu xác minh",
      icon: ShieldCheck,
    },
    { href: "/admin/jobs", label: "Tin tuyển dụng", icon: Briefcase },
    { href: "/admin/reports", label: "Báo cáo vi phạm", icon: Flag },
    {
      href: "/admin/analytics",
      label: "Thống kê & Nhật ký",
      icon: BarChart3,
    },
  ];

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <aside className="lg:col-span-3 rounded-2xl border border-slate-200 bg-slate-900 text-slate-200 p-4 shadow-elevated space-y-4">
          <div className="border-b border-slate-800 pb-4 px-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <ShieldAlert className="h-4 w-4" />
              STUWORK ADMIN CENTER
            </span>
            <p className="mt-1 truncate text-sm font-semibold text-white">
              {auth.user.full_name}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {auth.user.email}
            </p>
          </div>

          <nav className="flex flex-wrap lg:flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Icon className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="lg:col-span-9 min-w-0">{children}</div>
      </div>
    </div>
  );
}
