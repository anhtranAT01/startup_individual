"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container py-20 flex flex-col items-center text-center max-w-lg">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-5">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">
        Đã xảy ra sự cố tạm thời
      </h1>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
        Hệ thống không thể hoàn tất yêu cầu lúc này (có thể do kết nối cơ sở dữ
        liệu bị gián đoạn). Dữ liệu của bạn vẫn được bảo vệ an toàn.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => reset()} variant="primary">
          <RefreshCcw className="h-4 w-4" />
          Thử tải lại
        </Button>
        <Link href="/">
          <Button variant="outline">Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
