import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  LayoutDashboard,
  PlusCircle,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { VERIFICATION_STATUS_MAP } from "@/lib/constants";
import { getCurrentAuthContext } from "@/services/data-service";
import { Badge } from "@/components/ui/badge";

export default async function EmployerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getCurrentAuthContext();
  if (!auth.user) {
    redirect("/login?next=/employer/dashboard");
  }
  if (auth.user.role === "student") {
    redirect("/student/dashboard");
  }
  if (auth.user.role === "admin") {
    redirect("/admin");
  }

  const verStatus =
    auth.employerProfile?.verification_status || "not_submitted";
  const verInfo = VERIFICATION_STATUS_MAP[verStatus];

  const menuItems = [
    { href: "/employer/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { href: "/employer/jobs", label: "Tin tuyển dụng", icon: Briefcase },
    { href: "/employer/jobs/create", label: "Tạo tin mới", icon: PlusCircle },
    { href: "/employer/applications", label: "Ứng viên", icon: Users },
    {
      href: "/employer/profile",
      label: "Hồ sơ doanh nghiệp",
      icon: Building2,
    },
    {
      href: "/employer/verification",
      label: "Xác minh tài khoản",
      icon: ShieldCheck,
    },
    { href: "/employer/settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Sidebar Menu */}
        <aside className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft space-y-4">
          <div className="border-b border-slate-100 pb-4 px-2">
            <p className="text-xs font-medium text-slate-400">
              Cổng Nhà tuyển dụng
            </p>
            <p className="mt-0.5 truncate text-base font-extrabold text-slate-900">
              {auth.employerProfile?.company_name || auth.user.full_name}
            </p>
            <div className="mt-2">
              <Badge className={verInfo?.badgeClass}>
                {verStatus === "verified" ? (
                  <BadgeCheck className="h-3.5 w-3.5" />
                ) : null}
                {verInfo?.label}
              </Badge>
            </div>
          </div>

          <nav className="flex flex-wrap lg:flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <Icon className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Workspace */}
        <div className="lg:col-span-9 min-w-0">{children}</div>
      </div>
    </div>
  );
}
