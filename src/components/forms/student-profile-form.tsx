"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  FileText,
  FileUp,
  Lock,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { LOCATIONS, WORKING_TIMES } from "@/lib/constants";
import type { Profile, StudentProfile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Input,
  Label,
  SelectNative,
  Textarea,
} from "@/components/ui/form-controls";
import {
  getAuthorizedFileUrlAction,
  updateStudentProfileAction,
  uploadStorageFileAction,
} from "@/services/actions";

const DAYS_OF_WEEK = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function StudentProfileForm({
  user,
  studentProfile,
}: {
  user: Profile;
  studentProfile: StudentProfile | null;
}) {
  const router = useRouter();
  const [fullName, setFullName] = React.useState(user.full_name || "");
  const [phone, setPhone] = React.useState(user.phone || "");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    user.avatar_url
  );
  const [university, setUniversity] = React.useState(
    studentProfile?.university || ""
  );
  const [major, setMajor] = React.useState(studentProfile?.major || "");
  const [yearOfStudy, setYearOfStudy] = React.useState<string>(
    studentProfile?.year_of_study ? String(studentProfile.year_of_study) : "2"
  );
  const [location, setLocation] = React.useState(
    studentProfile?.location || "Hà Nội"
  );
  const [bio, setBio] = React.useState(studentProfile?.bio || "");
  const [skills, setSkills] = React.useState<string[]>(
    studentProfile?.skills || []
  );
  const [skillInput, setSkillInput] = React.useState("");
  const [experience, setExperience] = React.useState(
    studentProfile?.experience || ""
  );
  const [desiredJobTitle, setDesiredJobTitle] = React.useState(
    studentProfile?.desired_job_title || ""
  );
  const [desiredSalary, setDesiredSalary] = React.useState<string>(
    studentProfile?.desired_salary ? String(studentProfile.desired_salary) : ""
  );
  const [shifts, setShifts] = React.useState<string[]>(
    studentProfile?.availability?.shifts || ["Ca tối"]
  );
  const [days, setDays] = React.useState<string[]>(
    studentProfile?.availability?.days || ["T2", "T4", "T6"]
  );
  const [cvUrl, setCvUrl] = React.useState<string | null>(
    studentProfile?.cv_url || null
  );
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  function addSkill() {
    const clean = skillInput.trim();
    if (!clean || skills.includes(clean)) return;
    setSkills((prev) => [...prev, clean]);
    setSkillInput("");
  }

  function toggleItem(
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    val: string
  ) {
    setter(list.includes(val) ? list.filter((i) => i !== val) : [...list, val]);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("bucket", "avatars");
    fd.set("file", file);
    const res = await uploadStorageFileAction(fd);
    setUploading(false);
    if (res.ok && res.data) {
      setAvatarUrl(res.data.url);
      toast.success("Đã tải ảnh đại diện lên!");
    } else {
      toast.error(res.message);
    }
  }

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("bucket", "student-cvs");
    fd.set("file", file);
    const res = await uploadStorageFileAction(fd);
    setUploading(false);
    if (res.ok && res.data) {
      setCvUrl(res.data.url);
      toast.success("Đã tải CV PDF lên kho lưu trữ riêng tư!");
    } else {
      toast.error(res.message);
    }
  }

  async function handleOpenCv() {
    if (!cvUrl) return;
    const res = await getAuthorizedFileUrlAction(cvUrl);
    if (res.ok && res.data?.signedUrl) {
      window.open(res.data.signedUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error(res.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await updateStudentProfileAction({
      full_name: fullName,
      phone,
      avatar_url: avatarUrl,
      university,
      major,
      year_of_study: yearOfStudy ? Number(yearOfStudy) : null,
      location,
      bio,
      skills,
      experience,
      desired_job_title: desiredJobTitle,
      desired_salary: desiredSalary ? Number(desiredSalary) : null,
      shifts,
      days,
      cv_url: cvUrl,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Privacy Notice */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-xs text-blue-900">
        <Lock className="h-4 w-4 text-blue-700 shrink-0" />
        <span>
          <strong>Bảo vệ quyền riêng tư:</strong> Email, số điện thoại và tệp CV
          của bạn được ẩn khỏi người xem công khai. Chỉ nhà tuyển dụng nhận được
          đơn ứng tuyển của bạn mới có quyền xem thông tin liên hệ.
        </span>
      </div>

      {/* Section 1: Basic Info & Avatar */}
      <Card className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-700 text-2xl font-bold text-white overflow-hidden shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              fullName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Ảnh đại diện</h2>
            <p className="text-xs text-slate-500">
              Hỗ trợ PNG, JPG hoặc WebP (Tối đa 3MB).
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Upload className="h-3.5 w-3.5 text-blue-600" />
              <span>{uploading ? "Đang tải..." : "Đổi ảnh đại diện"}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stu_name">Họ và tên *</Label>
            <Input
              id="stu_name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <Label>Email đăng nhập (Không công khai)</Label>
            <Input value={user.email} disabled />
          </div>
          <div>
            <Label htmlFor="stu_phone">Số điện thoại (Bảo mật)</Label>
            <Input
              id="stu_phone"
              placeholder="09xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="stu_loc">Khu vực hiện tại</Label>
            <SelectNative
              id="stu_loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </SelectNative>
          </div>
        </div>
      </Card>

      {/* Section 2: Education & Skills */}
      <Card className="p-6 md:p-8 space-y-5">
        <h2 className="text-lg font-bold text-slate-900">
          Học vấn, Kỹ năng & Định hướng việc làm
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="uni">Trường đại học / cao đẳng</Label>
            <Input
              id="uni"
              placeholder="VD: Đại học Kinh tế Quốc dân"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="major">Ngành học</Label>
            <Input
              id="major"
              placeholder="VD: Marketing / Công nghệ thông tin"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="year">Năm học hiện tại</Label>
            <SelectNative
              id="year"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6].map((y) => (
                <option key={y} value={y}>
                  Sinh viên năm {y}
                </option>
              ))}
            </SelectNative>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="desired_job">Công việc mong muốn</Label>
            <Input
              id="desired_job"
              placeholder="VD: CTV viết nội dung / Gia sư Tiếng Anh"
              value={desiredJobTitle}
              onChange={(e) => setDesiredJobTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="desired_salary">
              Mức lương mong muốn (VNĐ/giờ)
            </Label>
            <Input
              id="desired_salary"
              type="number"
              min={0}
              step={1000}
              placeholder="VD: 30000"
              value={desiredSalary}
              onChange={(e) => setDesiredSalary(e.target.value)}
            />
          </div>
        </div>

        {/* Skills Tag Input */}
        <div>
          <Label>Kỹ năng nổi bật (Giúp hệ thống gợi ý việc làm chính xác hơn)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Nhập kỹ năng (VD: Canva, Giao tiếp, React...) rồi nhấn Thêm"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addSkill}>
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          </div>
          {skills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-800"
                >
                  {sk}
                  <button
                    type="button"
                    onClick={() =>
                      setSkills((prev) => prev.filter((item) => item !== sk))
                    }
                    className="text-blue-500 hover:text-rose-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <Label htmlFor="stu_bio">Giới thiệu bản thân</Label>
          <Textarea
            id="stu_bio"
            placeholder="Mô tả ngắn gọn điểm mạnh, tính cách và mục tiêu làm thêm của bạn..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="stu_exp">Kinh nghiệm & Hoạt động ngoại khóa</Label>
          <Textarea
            id="stu_exp"
            placeholder="Các công việc bán thời gian, dự án môn học hoặc hoạt động câu lạc bộ bạn từng tham gia..."
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>
      </Card>

      {/* Section 3: Availability & CV Upload */}
      <Card className="p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            Lịch làm việc có thể đáp ứng
          </h2>
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500">Khung ca rảnh:</p>
            <div className="flex flex-wrap gap-2">
              {WORKING_TIMES.map((sh) => {
                const active = shifts.includes(sh);
                return (
                  <button
                    key={sh}
                    type="button"
                    onClick={() => toggleItem(shifts, setShifts, sh)}
                    className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {sh}
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-medium text-slate-500 pt-2">
              Ngày trong tuần:
            </p>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const active = days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleItem(days, setDays, day)}
                    className={`h-9 w-11 rounded-xl border text-xs font-bold transition-colors ${
                      active
                        ? "border-cyan-600 bg-cyan-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CV Manager */}
        <div className="pt-5 border-t border-slate-100 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            Quản lý CV cá nhân (PDF)
          </h2>
          <p className="text-xs text-slate-500">
            Lưu trữ trong Private Bucket `student-cvs` trên Supabase Storage (Tối đa 5MB).
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100">
              <FileUp className="h-4 w-4" />
              <span>
                {cvUrl ? "Thay thế CV PDF khác" : "Tải CV PDF lên"}
              </span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleCvUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {cvUrl ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenCv}
                >
                  <FileText className="h-4 w-4 text-blue-600" />
                  Xem CV đã tải lên
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCvUrl(null);
                    toast.info("Đã gỡ CV. Hãy nhấn 'Lưu hồ sơ' để áp dụng.");
                  }}
                  className="text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa CV
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={saving || uploading}
          >
            <Save className="h-4 w-4" />
            {saving ? "Đang lưu thông tin..." : "Lưu hồ sơ sinh viên"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
