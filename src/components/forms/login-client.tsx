"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form-controls";
import {
  loginAction,
  sandboxSwitchDemoRoleAction,
} from "@/services/actions";

function LoginFormInner({ isCloudMode }: { isCloudMode: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const res = await loginAction({ email, password, remember, nextUrl });
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(res.message);
      toast.error(res.message);
      return;
    }

    toast.success(res.message);
    router.push(res.redirectTo || "/");
    router.refresh();
  }

  async function handleSandboxRole(
    role: "student" | "employer_verified" | "employer_pending" | "admin"
  ) {
    setLoading(true);
    const res = await sandboxSwitchDemoRoleAction(role);
    setLoading(false);
    if (res.ok) {
      toast.success(res.message);
      router.push(nextUrl || res.redirectTo || "/");
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Visual Banner */}
        <div className="lg:col-span-5 rounded-3xl bg-hero-mesh p-8 text-white flex flex-col justify-between shadow-elevated">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-cyan-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Nền tảng xác thực tin tuyển dụng
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
              Chào mừng trở lại với STUWORK
            </h1>
            <p className="text-sm text-slate-200/90 leading-relaxed">
              Đăng nhập để quản lý hồ sơ, theo dõi trạng thái ứng tuyển theo thời
              gian thực và kết nối với các nhà tuyển dụng minh bạch.
            </p>
          </div>

          <div className="mt-8 space-y-3 rounded-2xl bg-white/10 p-4 border border-white/15 text-xs text-slate-200">
            <p className="font-semibold text-cyan-300">
              Nguyên tắc bảo vệ tài khoản:
            </p>
            <p>• STUWORK không bao giờ yêu cầu mã OTP ngân hàng của bạn.</p>
            <p>• Mọi đợt ứng tuyển hợp lệ trên nền tảng đều miễn phí 100%.</p>
          </div>
        </div>

        {/* Right Form */}
        <Card className="lg:col-span-7 p-7 md:p-9">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Đăng nhập</h2>
            <p className="mt-1 text-sm text-slate-500">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-700 hover:underline"
              >
                Đăng ký miễn phí ngay
              </Link>
            </p>
          </div>

          {errorMsg ? (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMsg}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email đăng nhập</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="sinhvien@truongdaihoc.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="mb-0">
                  Mật khẩu
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-blue-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <label htmlFor="remember" className="text-sm text-slate-600">
                Ghi nhớ đăng nhập trên thiết bị này
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? "Đang xác thực..." : "Đăng nhập"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {!isCloudMode ? (
            <div className="mt-7 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-3">
                <Sparkles className="h-4 w-4 text-cyan-600" />
                Trải nghiệm nhanh vai trò mẫu (Chỉ dành cho Local Sandbox Demo):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleSandboxRole("student")}
                  className="justify-start h-10"
                >
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  Sinh viên: Nguyễn Minh Anh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleSandboxRole("employer_verified")}
                  className="justify-start h-10"
                >
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  NTD Đã xác minh: Cafe Mộc Demo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleSandboxRole("employer_pending")}
                  className="justify-start h-10"
                >
                  <Building2 className="h-4 w-4 text-amber-600" />
                  NTD Chờ duyệt: Fresh Food Demo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleSandboxRole("admin")}
                  className="justify-start h-10"
                >
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  Quản trị viên (Admin Demo)
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

export function LoginClientWrapper({ isCloudMode }: { isCloudMode: boolean }) {
  return (
    <React.Suspense fallback={<div className="container py-16 text-center text-sm text-slate-500">Đang tải biểu mẫu đăng nhập...</div>}>
      <LoginFormInner isCloudMode={isCloudMode} />
    </React.Suspense>
  );
}
