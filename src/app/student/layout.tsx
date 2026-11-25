import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bookmark,
  FileText,
  LayoutDashboard,
  UserCircle2,
} from "lucide-react";
import { getCurrentAuthContext } from "@/services/data-service";

export default async function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getCurrentAuthContext();
  if (!auth.user) {
    redirect("/login?next=/student/dashboard");
  }
  if (auth.user.role === "employer") {
    redirect("/employer/dashboard");
  }
  if (auth.user.role === "admin") {
    redirect("/admin");
  }

  const navItems = [
    {
      href: "/student/dashboard",
      label: "Tổng quan",
      icon: LayoutDashboard,
    },
    {
      href: "/student/profile",
      label: "Hồ sơ & CV",
      icon: UserCircle2,
    },
    {
      href: "/student/applications",
      label: "Quản lý ứng tuyển",
      icon: FileText,
    },
    {
      href: "/student/saved-jobs",
      label: "Công việc đã lưu",
      icon: Bookmark,
    },
  ];

  return (
    <div className="container py-8 space-y-6">
      {/* Sub-navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <Icon className="h-4 w-4 text-blue-600" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Xin chào, <strong className="text-slate-800">{auth.user.full_name}</strong>
        </span>
      </div>

      {children}
    </div>
  );
}
