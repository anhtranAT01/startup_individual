"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, Upload } from "lucide-react";
import { toast } from "sonner";
import type { EmployerProfile, Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/form-controls";
import {
  updateEmployerProfileAction,
  uploadStorageFileAction,
} from "@/services/actions";

export function EmployerProfileForm({
  user,
  employer,
}: {
  user: Profile;
  employer: EmployerProfile;
}) {
  const router = useRouter();
  const [fullName, setFullName] = React.useState(user.full_name || "");
  const [companyName, setCompanyName] = React.useState(
    employer.company_name || ""
  );
  const [industry, setIndustry] = React.useState(employer.industry || "");
  const [address, setAddress] = React.useState(employer.address || "");
  const [website, setWebsite] = React.useState(employer.website || "");
  const [contactEmail, setContactEmail] = React.useState(
    employer.contact_email || user.email
  );
  const [contactPhone, setContactPhone] = React.useState(
    employer.contact_phone || user.phone || ""
  );
  const [foundedInfo, setFoundedInfo] = React.useState(
    employer.founded_info || ""
  );
  const [description, setDescription] = React.useState(
    employer.description || ""
  );
  const [logoUrl, setLogoUrl] = React.useState<string | null>(
    employer.logo_url
  );
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("bucket", "company-logos");
    fd.set("file", file);
    const res = await uploadStorageFileAction(fd);
    setUploading(false);
    if (res.ok && res.data) {
      setLogoUrl(res.data.url);
      toast.success("Đã tải logo đơn vị lên thành công!");
    } else {
      toast.error(res.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await updateEmployerProfileAction({
      full_name: fullName,
      company_name: companyName,
      industry,
      address,
      website,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      founded_info: foundedInfo,
      description,
      logo_url: logoUrl,
    });
    setSaving(false);

    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-600 text-xl font-bold text-white overflow-hidden shrink-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={companyName}
                className="h-full w-full object-cover"
              />
            ) : (
              companyName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              Logo Doanh nghiệp / Cửa hàng
            </h2>
            <p className="text-xs text-slate-500">
              Hiển thị công khai trên các thẻ tin tuyển dụng của bạn (PNG/JPG/SVG tối đa 3MB).
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Upload className="h-3.5 w-3.5 text-blue-600" />
              <span>{uploading ? "Đang tải..." : "Tải logo mới"}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Tên doanh nghiệp / cửa hàng *</Label>
            <Input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <Label>Người quản lý tài khoản *</Label>
            <Input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <Label>Lĩnh vực hoạt động</Label>
            <Input
              placeholder="VD: F&B, Giáo dục, Công nghệ thông tin, Bán lẻ..."
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <div>
            <Label>Thời gian hoạt động / Quy mô</Label>
            <Input
              placeholder="VD: Hoạt động từ 2022 • 15 nhân sự"
              value={foundedInfo}
              onChange={(e) => setFoundedInfo(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Địa chỉ trụ sở / cửa hàng *</Label>
            <Input
              required
              placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <Label>Email liên hệ tuyển dụng</Label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div>
            <Label>Số điện thoại liên hệ</Label>
            <Input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Website hoặc trang thông tin chính thức</Label>
            <Input
              placeholder="https://..."
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Giới thiệu về đơn vị tuyển dụng</Label>
          <Textarea
            placeholder="Mô tả môi trường làm việc, văn hóa đội ngũ và lý do sinh viên nên đồng hành cùng đơn vị bạn..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={saving || uploading}
          >
            <Save className="h-4 w-4" />
            {saving ? "Đang lưu..." : "Lưu hồ sơ đơn vị"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
