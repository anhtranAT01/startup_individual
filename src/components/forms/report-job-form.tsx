"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flag, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { REPORT_REASONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label, SelectNative, Textarea } from "@/components/ui/form-controls";
import { submitJobReportAction } from "@/services/actions";

export function ReportJobForm({
  jobId,
  jobTitle,
  companyName,
}: {
  jobId: string;
  jobTitle: string;
  companyName: string;
}) {
  const router = useRouter();
  const [reason, setReason] = React.useState<string>(REPORT_REASONS[0]);
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await submitJobReportAction({
      job_id: jobId,
      reason,
      description,
    });
    setLoading(false);

    if (!res.ok) {
      toast.error(res.message);
      if (res.redirectTo) router.push(res.redirectTo);
      return;
    }

    toast.success(res.message);
    router.push(res.redirectTo || `/jobs/${jobId}`);
    router.refresh();
  }

  return (
    <Card className="p-6 md:p-8 space-y-6">
      <div className="flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-900">
        <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-sm">
            Báo cáo tin: {jobTitle} ({companyName})
          </p>
          <p className="mt-1">
            Danh tính người báo cáo được bảo mật tuyệt đối với nhà tuyển dụng.
            Ban quản trị STUWORK sẽ kiểm tra và khóa tin nếu phát hiện vi phạm.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="reason">Lý do báo cáo *</Label>
          <SelectNative
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectNative>
        </div>

        <div>
          <Label htmlFor="report_desc">Mô tả chi tiết dấu hiệu đáng ngờ *</Label>
          <Textarea
            id="report_desc"
            required
            placeholder="Vui lòng mô tả cụ thể nội dung trao đổi, yêu cầu chuyển tiền hoặc thông tin sai lệch bạn gặp phải..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[130px]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={`/jobs/${jobId}`}>
            <Button variant="outline">Hủy</Button>
          </Link>
          <Button type="submit" variant="danger" disabled={loading}>
            <Flag className="h-4 w-4" />
            {loading ? "Đang gửi báo cáo..." : "Gửi báo cáo vi phạm"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
