"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatRelativeTimeVN } from "@/lib/utils";
import type { AppNotification } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/services/actions";

export function NotificationsClient({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const router = useRouter();
  const [loadingAll, setLoadingAll] = React.useState(false);

  async function handleMarkAll() {
    setLoadingAll(true);
    const res = await markAllNotificationsReadAction();
    setLoadingAll(false);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    }
  }

  async function handleMarkOne(id: string) {
    await markNotificationReadAction(id);
    router.refresh();
  }

  if (notifications.length === 0) {
    return (
      <Card className="p-12 text-center space-y-2">
        <Bell className="h-9 w-9 text-slate-400 mx-auto" />
        <h3 className="font-bold text-slate-900">Chưa có thông báo mới</h3>
        <p className="text-xs text-slate-500">
          Mọi cập nhật về đơn ứng tuyển, trạng thái xác minh và báo cáo sẽ hiển
          thị tại đây.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={loadingAll}
          onClick={handleMarkAll}
        >
          <CheckCheck className="h-4 w-4 text-blue-600" />
          Đánh dấu tất cả là đã đọc
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`p-5 transition-colors ${
              !n.is_read
                ? "border-blue-200 bg-blue-50/40"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!n.is_read ? (
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                  ) : null}
                  <h3 className="text-sm font-bold text-slate-900">
                    {n.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-600">{n.message}</p>
                <p className="text-[11px] text-slate-400">
                  {formatRelativeTimeVN(n.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.is_read ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkOne(n.id)}
                  >
                    Đã đọc
                  </Button>
                ) : null}
                {n.link ? (
                  <Link href={n.link} onClick={() => handleMarkOne(n.id)}>
                    <Button variant="secondary" size="sm">
                      Xem chi tiết <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
