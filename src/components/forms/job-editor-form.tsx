"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, Save, Send, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import { FILTER_CATEGORIES, JOB_TYPES, LOCATIONS } from "@/lib/constants";
import { formatSalaryRange } from "@/lib/utils";
import type { Job } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Input,
  Label,
  SelectNative,
  Textarea,
} from "@/components/ui/form-controls";
import { saveJobAction } from "@/services/actions";

export function JobEditorForm({
  initialJob,
  isVerifiedEmployer,
  companyEmail,
}: {
  initialJob?: Job | null;
  isVerifiedEmployer: boolean;
  companyEmail: string;
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState(initialJob?.title || "");
  const [category, setCategory] = React.useState(
    initialJob?.category || FILTER_CATEGORIES[0]
  );
  const [jobType, setJobType] = React.useState<Job["job_type"]>(
    initialJob?.job_type || "Part-time"
  );
  const [workMode, setWorkMode] = React.useState<Job["work_mode"]>(
    initialJob?.work_mode || "Onsite"
  );
  const [salaryMin, setSalaryMin] = React.useState<string>(
    initialJob?.salary_min != null ? String(initialJob.salary_min) : "25000"
  );
  const [salaryMax, setSalaryMax] = React.useState<string>(
    initialJob?.salary_max != null ? String(initialJob.salary_max) : "35000"
  );
  const [salaryUnit, setSalaryUnit] = React.useState<Job["salary_unit"]>(
    initialJob?.salary_unit || "hour"
  );
  const [location, setLocation] = React.useState(
    initialJob?.location || LOCATIONS[0]
  );
  const [workingTime, setWorkingTime] = React.useState(
    initialJob?.working_time || "Ca tối (18h00–22h00)"
  );
  const [vacancies, setVacancies] = React.useState<string>(
    initialJob?.vacancies ? String(initialJob.vacancies) : "2"
  );
  const [deadline, setDeadline] = React.useState(
    initialJob?.deadline || "2027-03-31"
  );
  const [contactInfo, setContactInfo] = React.useState(
    initialJob?.contact_info || companyEmail
  );
  const [description, setDescription] = React.useState(
    initialJob?.description || ""
  );
  const [requirements, setRequirements] = React.useState(
    initialJob?.requirements || ""
  );
  const [benefits, setBenefits] = React.useState(initialJob?.benefits || "");

  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSave(intent: "draft" | "publish") {
    setLoading(true);
    const res = await saveJobAction({
      id: initialJob?.id,
      title,
      category,
      job_type: jobType,
      work_mode: workMode,
      salary_min: salaryMin ? Number(salaryMin) : null,
      salary_max: salaryMax ? Number(salaryMax) : null,
      salary_unit: salaryUnit,
      location,
      working_time: workingTime,
      vacancies: Math.max(1, Number(vacancies) || 1),
      deadline: deadline || null,
      contact_info: contactInfo,
      description,
      requirements,
      benefits,
      intent,
    });
    setLoading(false);

    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    toast.success(res.message);
    if (res.redirectTo) {
      router.push(res.redirectTo);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {!isVerifiedEmployer ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">
              Chế độ Bản nháp dành cho Nhà tuyển dụng chưa xác minh
            </p>
            <p className="mt-0.5">
              Theo quy định an toàn của STUWORK, bạn có thể lưu bản nháp và xem
              trước tin đăng ngay lúc này. Nút &ldquo;Xuất bản công khai&rdquo; sẽ mở
              ngay sau khi tài khoản được Admin xác minh.
            </p>
          </div>
        </div>
      ) : null}

      <Card className="p-6 md:p-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="job_title">Tên công việc tuyển dụng *</Label>
            <Input
              id="job_title"
              required
              placeholder="Ví dụ: Nhân viên phục vụ quán cafe ca tối"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label>Danh mục *</Label>
            <SelectNative
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {FILTER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </SelectNative>
          </div>

          <div>
            <Label>Loại hình làm việc *</Label>
            <SelectNative
              value={jobType}
              onChange={(e) => setJobType(e.target.value as Job["job_type"])}
            >
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </SelectNative>
          </div>

          <div>
            <Label>Hình thức làm việc *</Label>
            <SelectNative
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value as Job["work_mode"])}
            >
              <option value="Onsite">Onsite (Tại địa điểm)</option>
              <option value="Remote">Remote (Từ xa)</option>
              <option value="Hybrid">Hybrid (Linh hoạt kết hợp)</option>
            </SelectNative>
          </div>

          <div>
            <Label>Địa điểm làm việc *</Label>
            <Input
              placeholder="Ví dụ: Cầu Giấy, Hà Nội hoặc Làm việc từ xa"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Salary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <Label>Mức lương tối thiểu (Để trống nếu Thỏa thuận)</Label>
            <Input
              type="number"
              min={0}
              step={1000}
              placeholder="25000"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
            />
          </div>
          <div>
            <Label>Mức lương tối đa</Label>
            <Input
              type="number"
              min={0}
              step={1000}
              placeholder="35000"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
            />
          </div>
          <div>
            <Label>Đơn vị tính lương *</Label>
            <SelectNative
              value={salaryUnit}
              onChange={(e) =>
                setSalaryUnit(e.target.value as Job["salary_unit"])
              }
            >
              <option value="hour">Theo giờ (VNĐ/giờ)</option>
              <option value="day">Theo buổi / ngày (VNĐ/buổi)</option>
              <option value="month">Theo tháng (VNĐ/tháng)</option>
              <option value="project">Theo dự án / bài viết</option>
            </SelectNative>
          </div>
        </div>

        {/* Schedule & Vacancies */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Thời gian / Ca làm việc *</Label>
            <Input
              placeholder="VD: Ca sáng hoặc Ca tối"
              value={workingTime}
              onChange={(e) => setWorkingTime(e.target.value)}
            />
          </div>
          <div>
            <Label>Số lượng cần tuyển *</Label>
            <Input
              type="number"
              min={1}
              value={vacancies}
              onChange={(e) => setVacancies(e.target.value)}
            />
          </div>
          <div>
            <Label>Hạn nhận hồ sơ</Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Thông tin người phụ trách liên hệ</Label>
          <Input
            placeholder="VD: Phòng Nhân sự (email@donvi.vn)"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
          />
        </div>

        <div>
          <Label>Mô tả công việc chi tiết *</Label>
          <Textarea
            placeholder="Nêu rõ các đầu việc cụ thể sinh viên sẽ thực hiện trong ca làm..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div>
          <Label>Yêu cầu ứng viên *</Label>
          <Textarea
            placeholder="Kỹ năng cần thiết, thời gian cam kết tối thiểu, thái độ làm việc..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </div>

        <div>
          <Label>Quyền lợi được hưởng *</Label>
          <Textarea
            placeholder="Cách thức trả lương, phụ cấp ăn ca/gửi xe, hỗ trợ đào tạo..."
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
          />
        </div>

        {/* 3 Action Buttons: Draft, Preview, Publish */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-4 w-4" />
            Xem trước tin đăng
          </Button>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => handleSave("draft")}
            >
              <Save className="h-4 w-4" />
              Lưu bản nháp
            </Button>

            <Button
              type="button"
              variant="primary"
              disabled={loading || !isVerifiedEmployer}
              onClick={() => handleSave("publish")}
              title={
                !isVerifiedEmployer
                  ? "Cần hoàn tất xác minh nhà tuyển dụng để xuất bản"
                  : undefined
              }
            >
              <Send className="h-4 w-4" />
              {initialJob ? "Cập nhật & Xuất bản" : "Xuất bản tin tuyển dụng"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 md:p-8 shadow-elevated space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-semibold text-blue-700">
                  Bản xem trước tin tuyển dụng
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {title || "Chưa nhập tiêu đề công việc"}
                </h3>
                <p className="text-sm text-slate-600">
                  {location} • {jobType} ({workMode}) •{" "}
                  <strong className="text-blue-700">
                    {formatSalaryRange(
                      salaryMin ? Number(salaryMin) : null,
                      salaryMax ? Number(salaryMax) : null,
                      salaryUnit
                    )}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <strong className="text-slate-900">Thời gian làm việc:</strong>{" "}
                {workingTime} (Tuyển {vacancies} bạn)
              </div>
              <div>
                <strong className="text-slate-900 block mb-1">Mô tả:</strong>
                <p className="whitespace-pre-line">{description || "..."}</p>
              </div>
              <div>
                <strong className="text-slate-900 block mb-1">Yêu cầu:</strong>
                <p className="whitespace-pre-line">{requirements || "..."}</p>
              </div>
              <div>
                <strong className="text-slate-900 block mb-1">Quyền lợi:</strong>
                <p className="whitespace-pre-line">{benefits || "..."}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="primary" onClick={() => setPreviewOpen(false)}>
                Đóng xem trước
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
