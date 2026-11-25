"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form-controls";
import { registerAction } from "@/services/actions";

function RegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole =
    searchParams.get("role") === "employer" ? "employer" : "student";

  const [role, setRole] = React.useState<"student" | "employer">(defaultRole);
  const [fullName, setFullName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg("Mật khẩu phải có tối thiểu 8 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không trùng khớp.");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Vui lòng đồng ý với Điều khoản sử dụng của STUWORK.");
      return;
    }

    setLoading(true);
    const res = await registerAction({
      full_name: fullName,
      email,
      password,
      confirm_password: confirmPassword,
      role,
      company_name: role === "employer" ? companyName : undefined,
      agree_terms: agreeTerms,
    });
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

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <Card className="p-7 md:p-10">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              Tạo tài khoản miễn phí
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Bắt đầu cùng STUWORK
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Chọn vai trò phù hợp để trải nghiệm quy trình kết nối việc làm minh bạch
            </p>
          </div>

          {/* 2 Role Selection Cards (Strict: Student or Employer ONLY, never Admin) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-7">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={cn(
                "relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all",
                role === "student"
                  ? "border-blue-600 bg-blue-50/50 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                {role === "student" ? (
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                ) : null}
              </div>
              <p className="mt-3 font-bold text-slate-900">Tôi là sinh viên</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Tìm việc làm thêm an toàn, phù hợp lịch học và theo dõi đơn ứng tuyển
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRole("employer")}
              className={cn(
                "relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all",
                role === "employer"
                  ? "border-cyan-600 bg-cyan-50/50 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                {role === "employer" ? (
                  <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                ) : null}
              </div>
              <p className="mt-3 font-bold text-slate-900">
                Tôi là nhà tuyển dụng
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Xác minh đơn vị uy tín, đăng tin tuyển dụng và quản lý hồ sơ sinh viên
              </p>
            </button>
          </div>

          {errorMsg ? (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMsg}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={role === "student" ? "sm:col-span-2" : ""}>
                <Label htmlFor="full_name">
                  {role === "employer" ? "Họ tên người đại diện *" : "Họ và tên *"}
                </Label>
                <Input
                  id="full_name"
                  required
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {role === "employer" ? (
                <div>
                  <Label htmlFor="company_name">
                    Tên doanh nghiệp / cửa hàng *
                  </Label>
                  <Input
                    id="company_name"
                    required
                    placeholder="Ví dụ: Tiệm Sách Xanh"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              ) : null}
            </div>

            <div>
              <Label htmlFor="reg_email">Địa chỉ Email *</Label>
              <Input
                id="reg_email"
                type="email"
                required
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reg_password">Mật khẩu (tối thiểu 8 ký tự) *</Label>
                <Input
                  id="reg_password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Ít nhất 8 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm_password">Xác nhận mật khẩu *</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input
                id="agree_terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <label htmlFor="agree_terms" className="text-sm text-slate-600 leading-relaxed">
                Tôi đồng ý với{" "}
                <Link href="/terms" className="font-medium text-blue-700 hover:underline">
                  Điều khoản sử dụng
                </Link>
                ,{" "}
                <Link href="/privacy" className="font-medium text-blue-700 hover:underline">
                  Chính sách quyền riêng tư
                </Link>{" "}
                và cam kết tuân thủ quy định không thu phí ứng viên trên STUWORK.
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading
                ? "Đang khởi tạo tài khoản..."
                : role === "employer"
                ? "Đăng ký tài khoản Nhà tuyển dụng"
                : "Đăng ký tài khoản Sinh viên"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-blue-700 hover:underline">
              Đăng nhập tại đây
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export function RegisterClientWrapper() {
  return (
    <React.Suspense fallback={<div className="container py-16 text-center text-sm text-slate-500">Đang tải trang đăng ký...</div>}>
      <RegisterFormInner />
    </React.Suspense>
  );
}
