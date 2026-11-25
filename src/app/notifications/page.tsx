import { redirect } from "next/navigation";
import {
  getCurrentAuthContext,
  getUserNotifications,
} from "@/services/data-service";
import { NotificationsClient } from "@/components/dashboard/notifications-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Thông báo của bạn" };

export default async function NotificationsPage() {
  const auth = await getCurrentAuthContext();
  if (!auth.user) {
    redirect("/login?next=/notifications");
  }

  const notifications = await getUserNotifications(auth.user.id);

  return (
    <div className="container py-10 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Trung tâm Thông báo
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi toàn bộ phản hồi ứng tuyển, trạng thái xác minh và xử lý báo cáo.
        </p>
      </div>

      <NotificationsClient notifications={notifications} />
    </div>
  );
}
