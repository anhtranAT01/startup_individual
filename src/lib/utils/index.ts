import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyVND(amount?: number | null): string {
  if (amount == null || Number.isNaN(Number(amount))) return "Thỏa thuận";
  return new Intl.NumberFormat("vi-VN").format(Number(amount)) + "đ";
}

export function formatSalaryRange(
  min?: number | null,
  max?: number | null,
  unit?: string | null
): string {
  const unitMap: Record<string, string> = {
    hour: "giờ",
    day: "buổi/ngày",
    month: "tháng",
    project: "dự án/bài",
  };
  const suffix = unit ? `/${unitMap[unit] || unit}` : "";

  if (!min && !max) return "Thỏa thuận";
  if (min && max) {
    if (Number(min) === Number(max)) {
      return `${formatCurrencyVND(min)}${suffix}`;
    }
    return `${new Intl.NumberFormat("vi-VN").format(Number(min))} – ${new Intl.NumberFormat(
      "vi-VN"
    ).format(Number(max))}đ${suffix}`;
  }
  if (min) return `Từ ${formatCurrencyVND(min)}${suffix}`;
  return `Đến ${formatCurrencyVND(max)}${suffix}`;
}

export function formatDateVN(dateStr?: string | null): string {
  if (!dateStr) return "Không giới hạn";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatRelativeTimeVN(dateStr?: string | null): string {
  if (!dateStr) return "Vừa xong";
  const now = Date.now();
  const target = new Date(dateStr).getTime();
  if (Number.isNaN(target)) return "Gần đây";
  const diffMinutes = Math.floor((now - target) / 60000);
  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return formatDateVN(dateStr);
}

export function slugifyVN(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function isJobExpired(deadline?: string | null): boolean {
  if (!deadline) return false;
  const end = new Date(deadline);
  end.setHours(23, 59, 59, 999);
  return end.getTime() < Date.now();
}
