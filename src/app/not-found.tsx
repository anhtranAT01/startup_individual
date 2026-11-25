import Link from "next/link";
import { Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="container py-24 flex flex-col items-center text-center max-w-lg">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 mb-5">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900">
        Không tìm thấy trang (404)
      </h1>
      <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
        Trang bạn đang tìm kiếm không tồn tại hoặc tin tuyển dụng đã được gỡ bỏ.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link href="/jobs">
          <Button variant="primary">
            <Search className="h-4 w-4" />
            Khám phá việc làm
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
