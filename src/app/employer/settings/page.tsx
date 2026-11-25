import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";
import { getCurrentAuthContext } from "@/services/data-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Cài đặt tài khoản Nhà tuyển dụng" };

export default async function EmployerSettingsPage() {
  const auth = await getCurrentAuthContext();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Cài đặt Tài khoản & Bảo mật
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý thông tin đăng nhập và thông báo cho đơn vị tuyển dụng.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-bold text-slate-900">
              Email tài khoản đăng nhập
            </p>
            <p className="text-xs text-slate-500">{auth.user?.email}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Cần đặt lại mật khẩu đăng nhập qua email xác thực?
          </div>
          <Link href="/forgot-password">
            <Button variant="outline" size="sm">
              <KeyRound className="h-3.5 w-3.5" />
              Đặt lại mật khẩu
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
