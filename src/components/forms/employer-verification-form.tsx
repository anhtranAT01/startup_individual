"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, FileUp, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { VERIFICATION_STATUS_MAP } from "@/lib/constants";
import { formatDateVN } from "@/lib/utils";
import type {
  EmployerProfile,
  Profile,
  VerificationRequest,
} from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form-controls";
import {
  submitVerificationRequestAction,
  uploadStorageFileAction,
} from "@/services/actions";

export function EmployerVerificationForm({
  user,
  employer,
  history,
}: {
  user: Profile;
  employer: EmployerProfile;
  history: VerificationRequest[];
}) {
  const router = useRouter();
  const [businessName, setBusinessName] = React.useState(
    employer.company_name || ""
  );
  const [repName, setRepName] = React.useState(user.full_name || "");
  const [address, setAddress] = React.useState(employer.address || "");
  const [taxCode, setTaxCode] = React.useState("");
  const [website, setWebsite] = React.useState(employer.website || "");
  const [contactEmail, setContactEmail] = React.useState(
    employer.contact_email || user.email
  );
  const [contactPhone, setContactPhone] = React.useState(
    employer.contact_phone || user.phone || ""
  );
  const [docUrl, setDocUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const verInfo = VERIFICATION_STATUS_MAP[employer.verification_status];

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("bucket", "verification-documents");
    fd.set("file", file);
    const res = await uploadStorageFileAction(fd);
    setUploading(false);
    if (res.ok && res.data) {
      setDocUrl(res.data.url);
      toast.success("Đã tải tài liệu minh chứng lên Private Bucket!");
    } else {
      toast.error(res.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await submitVerificationRequestAction({
      business_name: businessName,
      representative_name: repName,
      address,
      tax_code: taxCode,
      website,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      document_url: docUrl,
    });
    setSubmitting(false);

    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">
              Trạng thái xác minh hiện tại
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Badge className={verInfo?.badgeClass}>
                {employer.verification_status === "verified" ? (
                  <BadgeCheck className="h-3.5 w-3.5" />
                ) : null}
                {verInfo?.label}
              </Badge>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Lưu ý: Hệ thống không tự động cấp nhãn xác minh khi mới đăng ký.
              Mọi hồ sơ đều do Quản trị viên kiểm duyệt.
            </p>
          </div>
        </div>
      </Card>

      {/* Submission Form */}
      {employer.verification_status !== "verified" ? (
        <Card className="p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Biểu mẫu Gửi Yêu cầu Xác minh Đơn vị
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tên đăng ký doanh nghiệp / hộ kinh doanh *</Label>
                <Input
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div>
                <Label>Họ tên người đại diện *</Label>
                <Input
                  required
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Địa chỉ hoạt động thực tế *</Label>
                <Input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div>
                <Label>Số điện thoại xác thực *</Label>
                <Input
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <div>
                <Label>Email liên hệ chính thức *</Label>
                <Input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Mã số doanh nghiệp / Mã số hộ KD (Nếu có)</Label>
                <Input
                  placeholder="VD: 010xxxxxxx"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                />
              </div>
              <div>
                <Label>Website hoặc Fanpage công khai</Label>
                <Input
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <Label>
                Tài liệu chứng minh (Giấy ĐKKD / Ảnh biển hiệu cửa hàng – Lưu trữ riêng tư)
              </Label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  <FileUp className="h-4 w-4 text-blue-600" />
                  <span>
                    {uploading
                      ? "Đang tải tệp..."
                      : "Tải PDF / Ảnh minh chứng (Tối đa 10MB)"}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    onChange={handleDocUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <span className="text-xs text-slate-500">
                  {docUrl
                    ? "✓ Đã đính kèm tài liệu xác minh an toàn"
                    : "Tùy chọn trong bản Demo"}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || uploading}
              >
                <Send className="h-4 w-4" />
                {submitting ? "Đang gửi hồ sơ..." : "Gửi yêu cầu xác minh"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {/* History */}
      {history.length > 0 ? (
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-3">
            Lịch sử yêu cầu xác minh
          </h3>
          <div className="divide-y divide-slate-100 text-sm">
            {history.map((req) => (
              <div
                key={req.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {req.business_name} — Đại diện: {req.representative_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Ngày gửi: {formatDateVN(req.created_at)}
                    {req.admin_note ? ` • Phản hồi Admin: ${req.admin_note}` : ""}
                  </p>
                </div>
                <Badge
                  tone={
                    req.status === "verified"
                      ? "verified"
                      : req.status === "rejected"
                      ? "danger"
                      : "warning"
                  }
                >
                  {req.status === "verified"
                    ? "Đã duyệt"
                    : req.status === "rejected"
                    ? "Từ chối"
                    : "Đang chờ duyệt"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
