import {
   Briefcase,
  Coffee,
  ShoppingBag,
  GraduationCap,
  Globe,
  Megaphone,
  Code2,
  Headphones,
  Sparkles,
} from "lucide-react";

export const JOB_CATEGORIES = [
  {
    id: "Phục vụ",
    label: "Phục vụ – Nhà hàng – Cafe",
    shortLabel: "Phục vụ",
    description: "Pha chế, phục vụ bàn, lễ tân nhà hàng & chuỗi đồ uống",
    icon: Coffee,
    color: "bg-amber-50 text-amber-700 border-amber-200/70",
  },
  {
    id: "Bán hàng",
    label: "Bán hàng – Thu ngân",
    shortLabel: "Bán hàng",
    description: "Tư vấn cửa hàng thời trang, nhà sách, siêu thị mini",
    icon: ShoppingBag,
    color: "bg-blue-50 text-blue-700 border-blue-200/70",
  },
  {
    id: "Gia sư",
    label: "Gia sư – Trợ giảng",
    shortLabel: "Gia sư",
    description: "Gia sư Toán, Tiếng Anh, Lập trình & trợ giảng trung tâm",
    icon: GraduationCap,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
  },
  {
    id: "Cộng tác viên",
    label: "Cộng tác viên online",
    shortLabel: "Cộng tác viên",
    description: "Nhập liệu, kiểm duyệt nội dung, điều phối sự kiện từ xa",
    icon: Globe,
    color: "bg-cyan-50 text-cyan-700 border-cyan-200/70",
  },
  {
    id: "Marketing",
    label: "Content – Marketing",
    shortLabel: "Marketing",
    description: "Viết bài chuẩn SEO, quản trị fanpage, quay dựng TikTok",
    icon: Megaphone,
    color: "bg-purple-50 text-purple-700 border-purple-200/70",
  },
  {
    id: "Công nghệ",
    label: "Thiết kế – Công nghệ",
    shortLabel: "Công nghệ & Thiết kế",
    description: "Thiết kế ấn phẩm, UI/UX, kiểm thử phần mềm, hỗ trợ IT",
    icon: Code2,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
  },
  {
    id: "Chăm sóc khách hàng",
    label: "Chăm sóc khách hàng",
    shortLabel: "CSKH",
    description: "Trực fanpage, giải đáp thắc mắc học viên & khách hàng",
    icon: Headphones,
    color: "bg-teal-50 text-teal-700 border-teal-200/70",
  },
  {
    id: "Thiết kế",
    label: "Công việc freelance",
    shortLabel: " Thiết kế / Freelance",
    description: "Dự án ngắn hạn linh hoạt theo kỹ năng chuyên môn",
    icon: Sparkles,
    color: "bg-rose-50 text-rose-700 border-rose-200/70",
  },
] as const;

export const FILTER_CATEGORIES = [
  "Bán hàng",
  "Phục vụ",
  "Gia sư",
  "Marketing",
  "Công nghệ",
  "Thiết kế",
  "Cộng tác viên",
  "Chăm sóc khách hàng",
] as const;

export const JOB_TYPES = [
  { value: "Part-time", label: "Part-time (Bán thời gian)" },
  { value: "Full-time", label: "Full-time (Toàn thời gian)" },
  { value: "Freelance", label: "Freelance (Theo dự án/bài)" },
  { value: "Remote", label: "Remote (Từ xa)" },
  { value: "Internship", label: "Internship (Thực tập)" },
] as const;

export const SALARY_RANGES = [
  { value: "under_25k", label: "Dưới 25.000đ/giờ" },
  { value: "25k_35k", label: "25.000 – 35.000đ/giờ" },
  { value: "35k_50k", label: "35.000 – 50.000đ/giờ" },
  { value: "over_50k", label: "Trên 50.000đ/giờ (hoặc quy đổi tương đương)" },
  { value: "negotiable", label: "Thỏa thuận" },
] as const;

export const LOCATIONS = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Làm việc từ xa",
  "Các tỉnh thành khác",
] as const;

export const WORKING_TIMES = [
  "Ca sáng",
  "Ca chiều",
  "Ca tối",
  "Cuối tuần",
  "Linh hoạt",
] as const;

export const APPLICATION_STATUS_MAP: Record<
  string,
  { label: string; badgeClass: string; description: string }
> = {
  pending: {
    label: "Chờ nhà tuyển dụng xem",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Hồ sơ đã được gửi và đang chờ nhà tuyển dụng mở xem.",
  },
  reviewed: {
    label: "Đã xem hồ sơ",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Nhà tuyển dụng đã xem thông tin ứng tuyển của bạn.",
  },
  shortlisted: {
    label: "Danh sách tiềm năng",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
    description: "Hồ sơ phù hợp và được đưa vào vòng trao đổi tiếp theo.",
  },
  accepted: {
    label: "Được chấp nhận",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Chúc mừng! Nhà tuyển dụng đã chấp nhận hồ sơ của bạn.",
  },
  rejected: {
    label: "Chưa phù hợp",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Rất tiếc hồ sơ chưa phù hợp với đợt tuyển này.",
  },
  withdrawn: {
    label: "Đã rút hồ sơ",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    description: "Bạn đã chủ động hủy đơn ứng tuyển này.",
  },
};

export const VERIFICATION_STATUS_MAP: Record<
  string,
  { label: string; badgeClass: string }
> = {
  not_submitted: {
    label: "Chưa gửi xác minh",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
  },
  pending: {
    label: "Chờ xác minh",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  verified: {
    label: "Đã xác minh",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Bị từ chối",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  suspended: {
    label: "Tạm ngừng xác minh",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
  },
};

export const REPORT_REASONS = [
  "Yêu cầu chuyển tiền đặt cọc",
  "Yêu cầu đóng phí nhận việc",
  "Mô tả công việc không đúng thực tế",
  "Thông tin nhà tuyển dụng đáng ngờ",
  "Có dấu hiệu lừa đảo",
  "Nội dung không phù hợp",
  "Lý do khác",
] as const;

export const SAFETY_PRINCIPLES = [
  {
    title: "Không nộp phí để được nhận việc",
    description:
      "Mọi tin tuyển dụng hợp pháp trên STUWORK hoàn toàn miễn phí ứng tuyển. Tuyệt đối từ chối đóng phí hồ sơ, phí đồng phục hay phí giữ chỗ trước khi đi làm.",
  },
  {
    title: "Không chuyển tiền đặt cọc cho nhà tuyển dụng",
    description:
      "Cảnh giác với các công việc cộng tác viên online yêu cầu nạp tiền làm nhiệm vụ, đặt đơn ảo hưởng hoa hồng hoặc đặt cọc nhận hàng gia công tại nhà.",
  },
  {
    title: "Không cung cấp mật khẩu hoặc mã OTP",
    description:
      "Không bao giờ chia sẻ mã OTP ngân hàng, mật khẩu ví điện tử, tài khoản mạng xã hội hoặc đăng nhập vào đường link lạ ngoài nền tảng.",
  },
  {
    title: "Kiểm tra thông tin nhà tuyển dụng trước khi ứng tuyển",
    description:
      "Ưu tiên các đơn vị có nhãn 'Đã xác minh', kiểm tra địa chỉ cửa hàng/văn phòng công khai và hẹn phỏng vấn tại địa điểm minh bạch vào ban ngày.",
  },
  {
    title: "Không gửi giấy tờ cá nhân gốc cho nguồn chưa tin cậy",
    description:
      "Không giao bản gốc CCCD/Thẻ sinh viên hoặc chụp ảnh chân dung cầm giấy tờ để mở tài khoản ngân hàng/vay tín dụng hộ người khác.",
  },
  {
    title: "Trao đổi rõ ràng về tiền lương và thời gian làm việc",
    description:
      "Xác nhận rõ mức lương theo giờ/buổi, lịch trả lương, quy định thử việc và phạm vi công việc bằng văn bản hoặc tin nhắn xác thực trước khi nhận ca.",
  },
  {
    title: "Báo cáo ngay khi phát hiện dấu hiệu đáng ngờ",
    description:
      "Nhấn nút 'Báo cáo tin tuyển dụng' ngay trên trang công việc để đội ngũ quản trị STUWORK kiểm tra, ẩn tin vi phạm và bảo vệ cộng đồng sinh viên.",
  },
] as const;

export { Briefcase };
