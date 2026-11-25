import type { Job, StudentProfile } from "@/types/database";

/**
 * Thuật toán tính điểm gợi ý công việc theo quy tắc trọng số (Rule-based Scoring - Phần X.3 PRD)
 * Trọng số chuẩn:
 * - Kỹ năng & Danh mục: 30%
 * - Địa điểm: 20%
 * - Mức lương: 20%
 * - Thời gian làm việc: 20%
 * - Loại công việc: 10%
 * Lưu ý: Đây là thuật toán điểm theo quy tắc minh bạch, không quảng cáo là mô hình AI huấn luyện.
 */
export function computeJobMatch(
  job: Job,
  student?: StudentProfile | null
): { score: number; reasons: string[] } {
  if (!student) {
    // Khi chưa đăng nhập hoặc chưa hoàn thiện hồ sơ: ưu tiên NTD đã xác minh & tin mới đầy đủ
    const verifiedBonus = job.employer?.verification_status === "verified" ? 78 : 60;
    return {
      score: verifiedBonus,
      reasons:
        job.employer?.verification_status === "verified"
          ? ["Đơn vị đã xác minh"]
          : ["Tin tuyển dụng mới"],
    };
  }

  let totalScore = 0;
  const reasons: string[] = [];

  // 1. Kỹ năng & Ngành học / Danh mục (Tối đa 30 điểm)
  const jobText = `${job.title} ${job.category} ${job.description} ${job.requirements}`.toLowerCase();
  const skills = (student.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const major = (student.major || "").toLowerCase();
  const desiredTitle = (student.desired_job_title || "").toLowerCase();

  let skillPoints = 0;
  const matchedSkills = skills.filter((sk) => jobText.includes(sk));
  if (matchedSkills.length >= 2) {
    skillPoints = 30;
    reasons.push(`Khớp kỹ năng (${matchedSkills.slice(0, 2).join(", ")})`);
  } else if (matchedSkills.length === 1) {
    skillPoints = 22;
    reasons.push(`Khớp kỹ năng ${matchedSkills[0]}`);
  } else if (
    (major && jobText.includes(major)) ||
    (desiredTitle && jobText.includes(desiredTitle.split(" ")[0] || "___"))
  ) {
    skillPoints = 18;
    reasons.push("Phù hợp định hướng ngành học");
  } else {
    skillPoints = 8;
  }
  totalScore += skillPoints;

  // 2. Địa điểm làm việc (Tối đa 20 điểm)
  const studentLoc = (student.location || "").toLowerCase();
  const jobLoc = job.location.toLowerCase();
  if (job.work_mode === "Remote" || jobLoc.includes("từ xa") || jobLoc.includes("remote")) {
    totalScore += 20;
    reasons.push("Làm việc từ xa linh hoạt");
  } else if (studentLoc && jobLoc.includes(studentLoc)) {
    totalScore += 20;
    reasons.push(`Đúng khu vực ${student.location}`);
  } else if (!studentLoc) {
    totalScore += 12;
  } else {
    totalScore += 4;
  }

  // 3. Mức lương kỳ vọng (Tối đa 20 điểm)
  const desired = student.desired_salary ? Number(student.desired_salary) : null;
  if (!desired) {
    totalScore += 14;
  } else {
    // Quy đổi ước tính mức lương của tin tuyển dụng về đơn vị giờ để so sánh tương đối
    const normalizedHourly = normalizeJobHourlyRate(job);
    if (normalizedHourly === null) {
      totalScore += 14; // Lương thỏa thuận
    } else if (normalizedHourly >= desired) {
      totalScore += 20;
      reasons.push("Đạt mức lương mong muốn");
    } else if (normalizedHourly >= desired * 0.8) {
      totalScore += 14;
    } else {
      totalScore += 6;
    }
  }

  // 4. Thời gian làm việc (Tối đa 20 điểm)
  const shifts = student.availability?.shifts || [];
  const jobTimeLower = job.working_time.toLowerCase();
  if (jobTimeLower.includes("linh hoạt")) {
    totalScore += 20;
    reasons.push("Giờ giấc linh hoạt");
  } else if (shifts.length > 0) {
    const matchedShift = shifts.find((sh) => jobTimeLower.includes(sh.toLowerCase()));
    if (matchedShift) {
      totalScore += 20;
      reasons.push(`Phù hợp ${matchedShift.toLowerCase()}`);
    } else {
      totalScore += 7;
    }
  } else {
    totalScore += 12;
  }

  // 5. Loại hình công việc (Tối đa 10 điểm)
  if (
    desiredTitle.includes("thực tập") &&
    job.job_type === "Internship"
  ) {
    totalScore += 10;
  } else if (
    desiredTitle.includes("freelance") &&
    job.job_type === "Freelance"
  ) {
    totalScore += 10;
  } else if (job.job_type === "Part-time" || job.job_type === "Remote") {
    totalScore += 9;
  } else {
    totalScore += 7;
  }

  return {
    score: Math.min(99, Math.max(25, Math.round(totalScore))),
    reasons: reasons.slice(0, 3),
  };
}

export function normalizeJobHourlyRate(job: Job): number | null {
  const ref = job.salary_max ?? job.salary_min;
  if (ref == null) return null;
  const val = Number(ref);
  switch (job.salary_unit) {
    case "hour":
      return val;
    case "day":
      // Trung bình 1 buổi dạy / ca ngắn ~ 2.5 - 3 giờ
      return Math.round(val / 3);
    case "month":
      // Trung bình bán thời gian / thực tập ~ 100 giờ/tháng
      return Math.round(val / 100);
    case "project":
      // Ước lượng trung bình 1 bài viết / gói nhỏ ~ 3 giờ
      return Math.round(val / 3);
    default:
      return val;
  }
}
