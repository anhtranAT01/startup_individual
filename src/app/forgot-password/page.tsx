"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form-controls";
import { forgotPasswordAction } from "@/services/actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await forgotPasswordAction(email);
    setLoading(false);
    if (res.ok) {
      setSent(true);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="container py-16 max-w-md">
      <Card className="p-8">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <MailCheck className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Kiểm tra hộp thư của bạn
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Nếu địa chỉ <strong>{email}</strong> đã đăng ký trên STUWORK, chúng tôi
              đã gửi hướng dẫn đặt lại mật khẩu an toàn.
            </p>
            <Link href="/login" className="block pt-2">
              <Button variant="primary" className="w-full">
                Quay lại trang Đăng nhập
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 mb-4">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Quên mật khẩu?</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu qua Supabase Auth.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="reset_email">Địa chỉ Email</Label>
                <Input
                  id="reset_email"
                  type="email"
                  required
                  placeholder="sinhvien@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Đang gửi yêu cầu..." : "Gửi liên kết đặt lại mật khẩu"}
              </Button>
            </form>
            <Link
              href="/login"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
