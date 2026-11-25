import type {
  AdminLog,
  AppNotification,
  Application,
  EmployerProfile,
  Job,
  JobReport,
  Profile,
  Review,
  SavedJob,
  StudentProfile,
  VerificationRequest,
} from "@/types/database";

// ==============================================================================
// DỮ LIỆU MINH HỌA (DEMO DATA) CHO STUWORK MVP
// Lưu ý: Toàn bộ tên đơn vị, email (@demo.stuwork.vn) và SĐT (0900xxxxxx) là giả lập
// phục vụ trình diễn sản phẩm học thuật / khởi nghiệp, gắn cờ is_demo = true.
// ==============================================================================

export const DEMO_ADMIN_ID = "00000000-0000-4000-8000-000000000001";

export const DEMO_EMPLOYER_USER_IDS = [
  "10000000-0000-4000-8000-000000000001",
  "10000000-0000-4000-8000-000000000002",
  "10000000-0000-4000-8000-000000000003",
  "10000000-0000-4000-8000-000000000004",
  "10000000-0000-4000-8000-000000000005",
  "10000000-0000-4000-8000-000000000006",
  "10000000-0000-4000-8000-000000000007",
  "10000000-0000-4000-8000-000000000008",
];

export const DEMO_EMPLOYER_IDS = [
  "11000000-0000-4000-8000-000000000001", // Cafe Mộc Demo
  "11000000-0000-4000-8000-000000000002", // Trung tâm Học Tốt Demo
  "11000000-0000-4000-8000-000000000003", // Media Lab Demo
  "11000000-0000-4000-8000-000000000004", // Local Store Demo
  "11000000-0000-4000-8000-000000000005", // EduPlus Demo
  "11000000-0000-4000-8000-000000000006", // TechStart Demo
  "11000000-0000-4000-8000-000000000007", // Fresh Food Demo
  "11000000-0000-4000-8000-000000000008", // Creative Studio Demo
];

export const DEMO_STUDENT_IDS = [
  "20000000-0000-4000-8000-000000000001", // Nguyễn Minh Anh
  "20000000-0000-4000-8000-000000000002", // Trần Đức Minh
  "20000000-0000-4000-8000-000000000003", // Lê Thu Hà
  "20000000-0000-4000-8000-000000000004", // Phạm Quang Huy
  "20000000-0000-4000-8000-000000000005", // Hoàng Ngọc Linh
  "20000000-0000-4000-8000-000000000006", // Vũ Hải Nam
  "20000000-0000-4000-8000-000000000007", // Đặng Phương Thảo
  "20000000-0000-4000-8000-000000000008", // Bùi Tuấn Kiệt
  "20000000-0000-4000-8000-000000000009", // Ngô Khánh Vy
  "20000000-0000-4000-8000-000000000010", // Đỗ Gia Bảo
];

export const DEMO_PROFILES: Profile[] = [
  {
    id: DEMO_ADMIN_ID,
    full_name: "Ban Quản Trị STUWORK (Demo)",
    email: "admin@demo.stuwork.vn",
    phone: "0900000001",
    avatar_url: null,
    role: "admin",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  // 8 Employers
  {
    id: DEMO_EMPLOYER_USER_IDS[0],
    full_name: "Nguyễn Thành Trung",
    email: "hr.cafemoc@demo.stuwork.vn",
    phone: "0900100001",
    avatar_url: null,
    role: "employer",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-05T08:00:00Z",
    updated_at: "2026-10-05T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_USER_IDS[1],
    full_name: "Trần Thanh Hương",
    email: "tuyendung.hoctot@demo.stuwork.vn",
    phone: "0900100002",
    avatar_url: null,
    role: "employer",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-06T08:00:00Z",
    updated_at: "2026-10-06T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_USER_IDS[2],
    full_name: "Lê Hoàng Bách",
    email: "talent.medialab@demo.stuwork.vn",
    phone: "0900100003",
    avatar_url: null,
    role: "employer",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-07T08:00:00Z",
    updated_at: "2026-10-07T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_USER_IDS[3],
    full_name: "Phạm Mai Phương",
    email: "hr.localstore@demo.stuwork.vn",
    phone: "0900100004",
    avatar_url: null,
    role: "employer",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-08T08:00:00Z",
    updated_at: "2026-10-08T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_USER_IDS[4],
    full_name: "Đinh Quốc Việt",
    email: "careers.eduplus@demo.stuwork.vn",
    phone: "0900100005",
    avatar_url: null,
    role: "employer",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-09T08:00:00Z",
    updated_at: "2026-10-09T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_USER_IDS[5],
    full_name: "Võ Minh Khôi",
    email: "people.techstart@demo.stuwork.vn",
    phone: "0900100006",
    avatar_url: null,
    role: "employer",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-10T08:00:00Z",
    updated_at: "2026-10-10T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_USER_IDS[6],
    full_name: "Hoàng Thu Trang",
    email: "hr.freshfood@demo.stuwork.vn",
    phone: "0900100007",
    avatar_url: null,
    role: "employer",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-11T08:00:00Z",
    updated_at: "2026-10-11T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_USER_IDS[7],
    full_name: "Lý Gia Hân",
    email: "hello.creativestudio@demo.stuwork.vn",
    phone: "0900100008",
    avatar_url: null,
    role: "employer",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-12T08:00:00Z",
    updated_at: "2026-10-12T08:00:00Z",
  },
  // 10 Students
  {
    id: DEMO_STUDENT_IDS[0],
    full_name: "Nguyễn Minh Anh",
    email: "minhanh.sv@demo.stuwork.vn",
    phone: "0900200001",
    avatar_url: null,
    role: "student",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-15T09:00:00Z",
    updated_at: "2026-10-15T09:00:00Z",
  },
  {
    id: DEMO_STUDENT_IDS[1],
    full_name: "Trần Đức Minh",
    email: "ducminh.sv@demo.stuwork.vn",
    phone: "0900200002",
    avatar_url: null,
    role: "student",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-16T09:00:00Z",
    updated_at: "2026-10-16T09:00:00Z",
  },
  {
    id: DEMO_STUDENT_IDS[2],
    full_name: "Lê Thu Hà",
    email: "thuha.sv@demo.stuwork.vn",
    phone: "0900200003",
    avatar_url: null,
    role: "student",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-17T09:00:00Z",
    updated_at: "2026-10-17T09:00:00Z",
  },
  {
    id: DEMO_STUDENT_IDS[3],
    full_name: "Phạm Quang Huy",
    email: "quanghuy.sv@demo.stuwork.vn",
    phone: "0900200004",
    avatar_url: null,
    role: "student",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-18T09:00:00Z",
    updated_at: "2026-10-18T09:00:00Z",
  },
  {
    id: DEMO_STUDENT_IDS[4],
    full_name: "Hoàng Ngọc Linh",
    email: "ngoclinh.sv@demo.stuwork.vn",
    phone: "0900200005",
    avatar_url: null,
    role: "student",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-19T09:00:00Z",
    updated_at: "2026-10-19T09:00:00Z",
  },
  {
    id: DEMO_STUDENT_IDS[5],
    full_name: "Vũ Hải Nam",
    email: "hainam.sv@demo.stuwork.vn",
    phone: "0900200006",
    avatar_url: null,
    role: "student",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-20T09:00:00Z",
    updated_at: "2026-10-20T09:00:00Z",
  },
  {
    id: DEMO_STUDENT_IDS[6],
    full_name: "Đặng Phương Thảo",
    email: "phuongthao.sv@demo.stuwork.vn",
    phone: "0900200007",
    avatar_url: null,
    role: "student",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-21T09:00:00Z",
    updated_at: "2026-10-21T09:00:00Z",
  },
  {
    id: DEMO_STUDENT_IDS[7],
    full_name: "Bùi Tuấn Kiệt",
    email: "tuankiet.sv@demo.stuwork.vn",
    phone: "0900200008",
    avatar_url: null,
    role: "student",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-22T09:00:00Z",
    updated_at: "2026-10-22T09:00:00Z",
  },
  {
    id: DEMO_STUDENT_IDS[8],
    full_name: "Ngô Khánh Vy",
    email: "khanhvy.sv@demo.stuwork.vn",
    phone: "0900200009",
    avatar_url: null,
    role: "student",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-23T09:00:00Z",
    updated_at: "2026-10-23T09:00:00Z",
  },
  {
    id: DEMO_STUDENT_IDS[9],
    full_name: "Đỗ Gia Bảo",
    email: "giabao.sv@demo.stuwork.vn",
    phone: "0900200010",
    avatar_url: null,
    role: "student",
    is_active: true,
    is_demo: true,
    created_at: "2026-10-24T09:00:00Z",
    updated_at: "2026-10-24T09:00:00Z",
  },
];

export const DEMO_EMPLOYER_PROFILES: EmployerProfile[] = [
  {
    id: DEMO_EMPLOYER_IDS[0],
    user_id: DEMO_EMPLOYER_USER_IDS[0],
    company_name: "Cafe Mộc Demo",
    description:
      "Không gian cà phê sách và đồ uống thủ công dành cho giới trẻ tại Hà Nội. Môi trường thân thiện, linh hoạt xoay ca theo lịch học sinh viên.",
    industry: "F&B – Chuỗi đồ uống",
    address: "Số 42 Trần Thái Tông, Cầu Giấy, Hà Nội (Địa chỉ giả lập)",
    website: "https://cafemoc.demo.stuwork.vn",
    contact_email: "hr.cafemoc@demo.stuwork.vn",
    contact_phone: "0900100001",
    founded_info: "Hoạt động 3 năm (Mô hình Demo)",
    logo_url: null,
    verification_status: "verified",
    is_demo: true,
    created_at: "2026-10-05T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_IDS[1],
    user_id: DEMO_EMPLOYER_USER_IDS[1],
    company_name: "Trung tâm Học Tốt Demo",
    description:
      "Đơn vị bồi dưỡng kiến thức Toán – Tiếng Anh – Khoa học tự nhiên cho học sinh THCS & THPT, thường xuyên cộng tác cùng sinh viên giỏi các trường đại học.",
    industry: "Giáo dục & Đào tạo",
    address: "Số 118 Nguyễn Trãi, Thanh Xuân, Hà Nội (Địa chỉ giả lập)",
    website: "https://hoctot.demo.stuwork.vn",
    contact_email: "tuyendung.hoctot@demo.stuwork.vn",
    contact_phone: "0900100002",
    founded_info: "Hoạt động 5 năm (Mô hình Demo)",
    logo_url: null,
    verification_status: "verified",
    is_demo: true,
    created_at: "2026-10-06T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_IDS[2],
    user_id: DEMO_EMPLOYER_USER_IDS[2],
    company_name: "Media Lab Demo",
    description:
      "Agency sáng tạo nội dung số, sản xuất bài viết SEO, kịch bản video ngắn và chiến dịch truyền thông mạng xã hội cho thương hiệu trẻ.",
    industry: "Truyền thông & Nội dung số",
    address: "Tầng 5, Tòa nhà Sáng Tạo, Quận 3, TP. Hồ Chí Minh (Địa chỉ giả lập)",
    website: "https://medialab.demo.stuwork.vn",
    contact_email: "talent.medialab@demo.stuwork.vn",
    contact_phone: "0900100003",
    founded_info: "Hoạt động 4 năm (Mô hình Demo)",
    logo_url: null,
    verification_status: "verified",
    is_demo: true,
    created_at: "2026-10-07T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_IDS[3],
    user_id: DEMO_EMPLOYER_USER_IDS[3],
    company_name: "Local Store Demo",
    description:
      "Cửa hàng phụ kiện, văn phòng phẩm và quà tặng thiết kế tối giản dành cho học sinh – sinh viên tại khu vực Đống Đa và Cầu Giấy.",
    industry: "Bán lẻ & Thời trang",
    address: "Số 85 Chùa Bộc, Đống Đa, Hà Nội (Địa chỉ giả lập)",
    website: "https://localstore.demo.stuwork.vn",
    contact_email: "hr.localstore@demo.stuwork.vn",
    contact_phone: "0900100004",
    founded_info: "Hoạt động 2 năm (Mô hình Demo)",
    logo_url: null,
    verification_status: "verified",
    is_demo: true,
    created_at: "2026-10-08T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_IDS[4],
    user_id: DEMO_EMPLOYER_USER_IDS[4],
    company_name: "EduPlus Demo",
    description:
      "Nền tảng học tiếng Anh giao tiếp và luyện thi chứng chỉ quốc tế kết hợp lớp học trực tiếp và trực tuyến.",
    industry: "Công nghệ Giáo dục (EdTech)",
    address: "Số 210 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh (Địa chỉ giả lập)",
    website: "https://eduplus.demo.stuwork.vn",
    contact_email: "careers.eduplus@demo.stuwork.vn",
    contact_phone: "0900100005",
    founded_info: "Hoạt động 4 năm (Mô hình Demo)",
    logo_url: null,
    verification_status: "verified",
    is_demo: true,
    created_at: "2026-10-09T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_IDS[5],
    user_id: DEMO_EMPLOYER_USER_IDS[5],
    company_name: "TechStart Demo",
    description:
      "Startup phát triển phần mềm SaaS quản lý bán hàng và ứng dụng di động, tạo điều kiện thực tập và làm việc bán thời gian cho sinh viên CNTT.",
    industry: "Công nghệ thông tin & Phần mềm",
    address: "Khu Công nghệ Phần mềm, Hải Châu, Đà Nẵng (Địa chỉ giả lập)",
    website: "https://techstart.demo.stuwork.vn",
    contact_email: "people.techstart@demo.stuwork.vn",
    contact_phone: "0900100006",
    founded_info: "Hoạt động 3 năm (Mô hình Demo)",
    logo_url: null,
    verification_status: "verified",
    is_demo: true,
    created_at: "2026-10-10T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_IDS[6],
    user_id: DEMO_EMPLOYER_USER_IDS[6],
    company_name: "Fresh Food Demo",
    description:
      "Hệ thống cửa hàng thực phẩm sạch, salad và đồ ăn lành mạnh giao nhanh khu vực nội thành Hà Nội & TP. Hồ Chí Minh.",
    industry: "Thực phẩm sạch & Bán lẻ",
    address: "Số 56 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh (Địa chỉ giả lập)",
    website: "https://freshfood.demo.stuwork.vn",
    contact_email: "hr.freshfood@demo.stuwork.vn",
    contact_phone: "0900100007",
    founded_info: "Hoạt động 2 năm (Mô hình Demo)",
    logo_url: null,
    verification_status: "pending",
    is_demo: true,
    created_at: "2026-10-11T08:00:00Z",
  },
  {
    id: DEMO_EMPLOYER_IDS[7],
    user_id: DEMO_EMPLOYER_USER_IDS[7],
    company_name: "Creative Studio Demo",
    description:
      "Xưởng thiết kế nhận diện thương hiệu, minh họa 2D và sản xuất ấn phẩm sự kiện trẻ trung.",
    industry: "Thiết kế Sáng tạo",
    address: "Số 19 Tô Ngọc Vân, Tây Hồ, Hà Nội (Địa chỉ giả lập)",
    website: "https://creativestudio.demo.stuwork.vn",
    contact_email: "hello.creativestudio@demo.stuwork.vn",
    contact_phone: "0900100008",
    founded_info: "Hoạt động 3 năm (Mô hình Demo)",
    logo_url: null,
    verification_status: "verified",
    is_demo: true,
    created_at: "2026-10-12T08:00:00Z",
  },
];

export const DEMO_STUDENT_PROFILES: StudentProfile[] = [
  {
    id: "21000000-0000-4000-8000-000000000001",
    user_id: DEMO_STUDENT_IDS[0],
    university: "Trường Đại học Kinh tế Quốc dân (Demo)",
    major: "Marketing",
    year_of_study: 3,
    location: "Hà Nội",
    bio: "Sinh viên năm 3 chuyên ngành Marketing số, yêu thích viết lách, quản trị fanpage và lên kịch bản nội dung ngắn.",
    skills: ["Viết nội dung", "Canva", "Marketing", "Quản trị Fanpage", "Tiếng Anh giao tiếp"],
    experience: "6 tháng làm CTV nội dung cho CLB Truyền thông sinh viên.",
    desired_job_title: "Cộng tác viên Content Marketing",
    desired_salary: 35000,
    availability: { shifts: ["Ca tối", "Linh hoạt", "Cuối tuần"], days: ["T2", "T4", "T6", "T7", "CN"] },
    cv_url: null,
  },
  {
    id: "21000000-0000-4000-8000-000000000002",
    user_id: DEMO_STUDENT_IDS[1],
    university: "Đại học Bách khoa Hà Nội (Demo)",
    major: "Công nghệ thông tin",
    year_of_study: 3,
    location: "Hà Nội",
    bio: "Sinh viên CNTT nắm vững React, TypeScript, SQL và Toán THPT. Mong muốn tìm việc thực tập Frontend hoặc gia sư Toán.",
    skills: ["React", "TypeScript", "HTML/CSS", "Gia sư Toán", "Git"],
    experience: "Đã xây dựng 2 website dự án môn học và kèm Toán lớp 9 trong 1 năm.",
    desired_job_title: "Thực tập sinh Frontend / Gia sư Toán",
    desired_salary: 45000,
    availability: { shifts: ["Ca chiều", "Ca tối"], days: ["T3", "T5", "T7", "CN"] },
    cv_url: null,
  },
  {
    id: "21000000-0000-4000-8000-000000000003",
    user_id: DEMO_STUDENT_IDS[2],
    university: "Trường Đại học Ngoại ngữ (Demo)",
    major: "Ngôn ngữ Anh",
    year_of_study: 2,
    location: "Hà Nội",
    bio: "Năng động, phát âm chuẩn IELTS 7.5, yêu thích giảng dạy và hỗ trợ học viên nhỏ tuổi.",
    skills: ["Tiếng Anh IELTS 7.5", "Trợ giảng", "Giao tiếp", "Soạn giáo án"],
    experience: "Trợ giảng lớp giao tiếp thiếu nhi 4 tháng.",
    desired_job_title: "Trợ giảng Tiếng Anh / Gia sư",
    desired_salary: 40000,
    availability: { shifts: ["Ca tối", "Cuối tuần"], days: ["T2", "T4", "T7", "CN"] },
    cv_url: null,
  },
  {
    id: "21000000-0000-4000-8000-000000000004",
    user_id: DEMO_STUDENT_IDS[3],
    university: "Trường Đại học Thương mại (Demo)",
    major: "Kinh tế đối ngoại",
    year_of_study: 2,
    location: "Hà Nội",
    bio: "Nhanh nhẹn, trung thực, giao tiếp thân thiện, có kinh nghiệm bán hàng và thu ngân cửa hàng tiện lợi.",
    skills: ["Bán hàng", "Thu ngân", "Chăm sóc khách hàng", "Excel"],
    experience: "Nhân viên bán hàng part-time dịp hè 3 tháng.",
    desired_job_title: "Nhân viên bán hàng / CSKH",
    desired_salary: 30000,
    availability: { shifts: ["Ca sáng", "Cuối tuần"], days: ["T2", "T3", "T6", "T7", "CN"] },
    cv_url: null,
  },
  {
    id: "21000000-0000-4000-8000-000000000005",
    user_id: DEMO_STUDENT_IDS[4],
    university: "Trường Đại học Kiến trúc (Demo)",
    major: "Thiết kế đồ họa",
    year_of_study: 3,
    location: "TP. Hồ Chí Minh",
    bio: "Đam mê thiết kế banner mạng xã hội, poster sự kiện và bộ nhận diện thương hiệu trẻ trung.",
    skills: ["Photoshop", "Illustrator", "Figma", "Thiết kế đồ họa", "Canva"],
    experience: "Freelance thiết kế ấn phẩm cho 5 fanpage ẩm thực & giáo dục.",
    desired_job_title: "Thiết kế đồ họa Freelance / Part-time",
    desired_salary: 45000,
    availability: { shifts: ["Linh hoạt", "Ca tối"], days: ["T2", "T3", "T4", "T5", "T6"] },
    cv_url: null,
  },
  {
    id: "21000000-0000-4000-8000-000000000006",
    user_id: DEMO_STUDENT_IDS[5],
    university: "Trường Đại học Bách khoa Đà Nẵng (Demo)",
    major: "Kỹ thuật phần mềm",
    year_of_study: 4,
    location: "Đà Nẵng",
    bio: "Cẩn thận, tư duy logic tốt, yêu thích kiểm thử phần mềm (QA/Tester) và phát triển web.",
    skills: ["Kiểm thử phần mềm", "SQL", "JavaScript", "Viết tài liệu"],
    experience: "Thực tập QA nội bộ tại phòng lab trường 3 tháng.",
    desired_job_title: "Thực tập sinh Tester / Hỗ trợ kỹ thuật",
    desired_salary: 35000,
    availability: { shifts: ["Ca sáng", "Ca chiều"], days: ["T2", "T4", "T6"] },
    cv_url: null,
  },
  {
    id: "21000000-0000-4000-8000-000000000007",
    user_id: DEMO_STUDENT_IDS[6],
    university: "Trường Đại học Khoa học Xã hội & Nhân văn (Demo)",
    major: "Báo chí – Truyền thông",
    year_of_study: 2,
    location: "TP. Hồ Chí Minh",
    bio: "Khả năng biên tập tiếng Việt mạch lạc, bắt nhịp xu hướng mạng xã hội văn minh.",
    skills: ["Biên tập bài viết", "SEO cơ bản", "Kịch bản TikTok", "Giao tiếp"],
    experience: "Cộng tác viên bản tin sinh viên khoa Báo chí.",
    desired_job_title: "CTV Viết bài / Quản trị nội dung",
    desired_salary: 30000,
    availability: { shifts: ["Linh hoạt"], days: ["T2", "T3", "T5", "T7"] },
    cv_url: null,
  },
  {
    id: "21000000-0000-4000-8000-000000000008",
    user_id: DEMO_STUDENT_IDS[7],
    university: "Trường Đại học Ngân hàng TP.HCM (Demo)",
    major: "Tài chính – Ngân hàng",
    year_of_study: 1,
    location: "TP. Hồ Chí Minh",
    bio: "Sinh viên năm nhất chăm chỉ, đúng giờ, mong muốn trải nghiệm công việc phục vụ quán cafe hoặc thu ngân.",
    skills: ["Phục vụ", "Pha chế cơ bản", "Thu ngân", "Làm việc nhóm"],
    experience: "Tham gia hậu cần các ngày hội tân sinh viên.",
    desired_job_title: "Nhân viên phục vụ / Pha chế",
    desired_salary: 26000,
    availability: { shifts: ["Ca chiều", "Cuối tuần"], days: ["T4", "T6", "T7", "CN"] },
    cv_url: null,
  },
  {
    id: "21000000-0000-4000-8000-000000000009",
    user_id: DEMO_STUDENT_IDS[8],
    university: "Trường Đại học Sư phạm Đà Nẵng (Demo)",
    major: "Sư phạm Toán",
    year_of_study: 3,
    location: "Đà Nẵng",
    bio: "Kiên nhẫn, truyền đạt dễ hiểu, có phương pháp giúp học sinh mất gốc lấy lại căn bản môn Toán.",
    skills: ["Gia sư Toán", "Sư phạm", "Soạn đề ôn tập", "Tư vấn học tập"],
    experience: "Gia sư Toán lớp 7 và lớp 8 trong 1.5 năm.",
    desired_job_title: "Gia sư Toán THCS",
    desired_salary: 50000,
    availability: { shifts: ["Ca tối", "Cuối tuần"], days: ["T3", "T5", "T7", "CN"] },
    cv_url: null,
  },
  {
    id: "21000000-0000-4000-8000-000000000010",
    user_id: DEMO_STUDENT_IDS[9],
    university: "Học viện Công nghệ Bưu chính Viễn thông (Demo)",
    major: "Thương mại điện tử",
    year_of_study: 2,
    location: "Hà Nội",
    bio: "Thành thạo Google Sheets, xử lý đơn hàng TMĐT và trực tin nhắn chăm sóc khách hàng.",
    skills: ["Nhập liệu", "Google Sheets", "Chăm sóc khách hàng", "Vận hành gian hàng"],
    experience: "Hỗ trợ trực gian hàng sách trực tuyến 4 tháng.",
    desired_job_title: "CTV Nhập liệu / Trực Page",
    desired_salary: 28000,
    availability: { shifts: ["Ca tối", "Linh hoạt"], days: ["T2", "T3", "T4", "T5", "CN"] },
    cv_url: null,
  },
];

interface RawJobSeed {
  idx: number;
  empIdx: number;
  title: string;
  category: string;
  job_type: Job["job_type"];
  salary_min: number | null;
  salary_max: number | null;
  salary_unit: Job["salary_unit"];
  location: string;
  work_mode: Job["work_mode"];
  working_time: string;
  vacancies: number;
  description: string;
  requirements: string;
  benefits: string;
  status?: Job["status"];
}

const RAW_JOBS: RawJobSeed[] = [
  {
    idx: 1,
    empIdx: 0,
    title: "Nhân viên phục vụ quán cafe",
    category: "Phục vụ",
    job_type: "Part-time",
    salary_min: 25000,
    salary_max: 30000,
    salary_unit: "hour",
    location: "Cầu Giấy, Hà Nội",
    work_mode: "Onsite",
    working_time: "Ca sáng (7h30–12h00) hoặc Ca tối (18h00–22h30)",
    vacancies: 4,
    description:
      "Đón tiếp khách hàng, giới thiệu menu đồ uống, bưng bê phục vụ tại bàn và giữ gìn không gian quán sạch sẽ, ấm cúng.",
    requirements:
      "Sinh viên từ 18 tuổi, giao tiếp thân thiện, đúng giờ, có trách nhiệm. Đăng ký tối thiểu 4 ca/tuần.",
    benefits:
      "Được hướng dẫn công việc bài bản từ đầu, hỗ trợ 1 đồ uống mỗi ca, thưởng chuyên cần cuối tháng, xoay ca linh hoạt theo lịch thi.",
  },
  {
    idx: 2,
    empIdx: 1,
    title: "Gia sư Toán cấp 2",
    category: "Gia sư",
    job_type: "Part-time",
    salary_min: 120000,
    salary_max: 180000,
    salary_unit: "day",
    location: "Thanh Xuân, Hà Nội",
    work_mode: "Onsite",
    working_time: "Ca tối (18h30–20h30, 2–3 buổi/tuần)",
    vacancies: 3,
    description:
      "Kèm 1-1 hoặc nhóm nhỏ (3 học sinh) môn Toán lớp 7–9 theo khung chương trình chuẩn của trung tâm Học Tốt Demo.",
    requirements:
      "Nắm vững kiến thức Toán cấp 2, kiên nhẫn, diễn đạt mạch lạc. Ưu tiên sinh viên khối Kỹ thuật, Kinh tế hoặc Sư phạm.",
    benefits:
      "Chủ động đăng ký lịch dạy, có sẵn giáo án và tài liệu bài tập chuẩn hóa, thanh toán thù lao đúng hạn ngày 05 hàng tháng.",
  },
  {
    idx: 3,
    empIdx: 2,
    title: "Cộng tác viên viết nội dung chuẩn SEO",
    category: "Marketing",
    job_type: "Freelance",
    salary_min: 80000,
    salary_max: 150000,
    salary_unit: "project",
    location: "Làm việc từ xa",
    work_mode: "Remote",
    working_time: "Linh hoạt tại nhà",
    vacancies: 5,
    description:
      "Viết bài chia sẻ kiến thức học tập, đời sống sinh viên và giới thiệu sản phẩm công nghệ (800–1.200 từ/bài) theo dàn ý có sẵn.",
    requirements:
      "Viết tiếng Việt mạch lạc, không sao chép nội dung, biết tra cứu thông tin và đảm bảo deadline tuần (3–5 bài/tuần).",
    benefits:
      "Làm việc từ xa 100%, được biên tập viên hướng dẫn kỹ năng SEO thực chiến, xét tăng nhuận bút sau 15 bài đạt chuẩn.",
  },
  {
    idx: 4,
    empIdx: 3,
    title: "Nhân viên bán hàng cuối tuần",
    category: "Bán hàng",
    job_type: "Part-time",
    salary_min: 30000,
    salary_max: 35000,
    salary_unit: "hour",
    location: "Đống Đa, Hà Nội",
    work_mode: "Onsite",
    working_time: "Cuối tuần (Thứ 7 và Chủ nhật)",
    vacancies: 3,
    description:
      "Tư vấn khách chọn sổ tay, phụ kiện bàn học, gói quà tặng và sắp xếp quầy kệ trưng bày tại cửa hàng Local Store Demo.",
    requirements:
      "Giao tiếp tốt, trung thực, yêu thích sản phẩm văn phòng phẩm sáng tạo. Có thể làm trọn ngày hoặc theo ca cuối tuần.",
    benefits:
      "Thưởng doanh số cửa hàng theo tuần, ưu đãi giảm 25% khi mua sản phẩm tại hệ thống, môi trường trẻ trung văn minh.",
  },
  {
    idx: 5,
    empIdx: 4,
    title: "Trợ giảng Tiếng Anh giao tiếp thiếu nhi",
    category: "Gia sư",
    job_type: "Part-time",
    salary_min: 38000,
    salary_max: 50000,
    salary_unit: "hour",
    location: "Bình Thạnh, TP. Hồ Chí Minh",
    work_mode: "Onsite",
    working_time: "Ca tối (17h45–21h00) & Cuối tuần",
    vacancies: 4,
    description:
      "Hỗ trợ giảng viên nước ngoài quản lý lớp học 12–15 bé, hướng dẫn hoạt động nhóm và ghi nhận nhận xét sau buổi học.",
    requirements:
      "Tiếng Anh giao tiếp khá (tương đương IELTS 6.0+), yêu trẻ, năng động và đúng giờ.",
    benefits:
      "Rèn luyện phản xạ tiếng Anh mỗi ngày cùng giáo viên bản ngữ, cấp giấy chứng nhận thực tập/trợ giảng sau 6 tháng.",
  },
  {
    idx: 6,
    empIdx: 5,
    title: "Thực tập sinh Frontend Next.js / React",
    category: "Công nghệ",
    job_type: "Internship",
    salary_min: 3500000,
    salary_max: 5000000,
    salary_unit: "month",
    location: "Hải Châu, Đà Nẵng",
    work_mode: "Hybrid",
    working_time: "Ca sáng hoặc Ca chiều (Tối thiểu 5 buổi/tuần)",
    vacancies: 2,
    description:
      "Tham gia phát triển giao diện module báo cáo cho nền tảng SaaS bằng React, Next.js và Tailwind CSS dưới sự hướng dẫn của Senior Developer.",
    requirements:
      "Sinh viên năm 3–4 ngành CNTT, nắm vững HTML/CSS, TypeScript cơ bản và sử dụng được Git.",
    benefits:
      "Trợ cấp thực tập hàng tháng, review code 1-1 hàng tuần, hỗ trợ dấu mộc và số liệu làm báo cáo thực tập tốt nghiệp.",
  },
  {
    idx: 7,
    empIdx: 7,
    title: "Thiết kế đồ họa Social Media (Part-time)",
    category: "Thiết kế",
    job_type: "Freelance",
    salary_min: 40000,
    salary_max: 55000,
    salary_unit: "hour",
    location: "Tây Hồ, Hà Nội",
    work_mode: "Hybrid",
    working_time: "Linh hoạt (Họp định kỳ 1 buổi/tuần)",
    vacancies: 2,
    description:
      "Thiết kế bộ ảnh bài đăng Facebook/Instagram, banner chiến dịch khuyến mãi và standee sự kiện cho khách hàng trẻ.",
    requirements:
      "Sử dụng tốt Illustrator, Photoshop hoặc Figma; có gu thẩm mỹ hiện đại và gửi kèm link Portfolio các bài tập/dự án đã làm.",
    benefits:
      "Được Art Director góp ý nâng cao tư duy bố cục, trả lương theo giờ hoặc theo gói ấn phẩm rõ ràng.",
  },
  {
    idx: 8,
    empIdx: 0,
    title: "Nhân viên pha chế (Barista Part-time)",
    category: "Phục vụ",
    job_type: "Part-time",
    salary_min: 28000,
    salary_max: 35000,
    salary_unit: "hour",
    location: "Cầu Giấy, Hà Nội",
    work_mode: "Onsite",
    working_time: "Ca sáng (7h00–12h00) hoặc Ca chiều (12h30–17h30)",
    vacancies: 2,
    description:
      "Pha chế cà phê máy, trà trái cây theo công thức định lượng chuẩn của Cafe Mộc Demo, kiểm kê nguyên liệu quầy bar cuối ca.",
    requirements:
      "Sạch sẽ, tỉ mỉ, yêu thích pha chế đồ uống. Chưa có kinh nghiệm sẽ được đào tạo trong 5 buổi đầu vẫn hưởng phụ cấp.",
    benefits:
      "Đào tạo kỹ năng Barista chuyên nghiệp miễn phí, xét tăng bậc lương sau mỗi 3 tháng gắn bó.",
  },
  {
    idx: 9,
    empIdx: 4,
    title: "Chăm sóc học viên trực tuyến (CSKH Online)",
    category: "Chăm sóc khách hàng",
    job_type: "Remote",
    salary_min: 26000,
    salary_max: 32000,
    salary_unit: "hour",
    location: "Làm việc từ xa",
    work_mode: "Remote",
    working_time: "Ca tối (18h00–22h00)",
    vacancies: 4,
    description:
      "Giải đáp thắc mắc lịch học, hỗ trợ kỹ thuật vào phòng học Zoom và nhắc lịch kiểm tra định kỳ cho học viên của EduPlus Demo.",
    requirements:
      "Có máy tính cá nhân và kết nối mạng ổn định, gõ phím nhanh, giao tiếp lịch sự và kiên nhẫn.",
    benefits:
      "Làm việc tại nhà an toàn, không áp doanh số bán hàng (không telesales ép khách), quy trình kịch bản rõ ràng.",
  },
  {
    idx: 10,
    empIdx: 3,
    title: "Nhân viên đóng gói đơn hàng sách & quà tặng",
    category: "Bán hàng",
    job_type: "Part-time",
    salary_min: 26000,
    salary_max: 30000,
    salary_unit: "hour",
    location: "Đống Đa, Hà Nội",
    work_mode: "Onsite",
    working_time: "Ca chiều (13h30–17h30)",
    vacancies: 3,
    description:
      "Kiểm tra sản phẩm theo phiếu đơn TMĐT, bọc chống sốc cẩn thận, dán mã vận đơn và bàn giao cho đơn vị vận chuyển.",
    requirements:
      "Cẩn thận, trung thực, sức khỏe tốt. Không yêu cầu kinh nghiệm trước đó.",
    benefits:
      "Kho hàng điều hòa mát mẻ, công việc nhẹ nhàng rõ ràng, thanh toán lương 2 tuần/lần.",
  },
  {
    idx: 11,
    empIdx: 5,
    title: "Cộng tác viên nhập liệu & chuẩn hóa danh mục",
    category: "Cộng tác viên",
    job_type: "Remote",
    salary_min: 25000,
    salary_max: 30000,
    salary_unit: "hour",
    location: "Làm việc từ xa",
    work_mode: "Remote",
    working_time: "Linh hoạt (Cam kết 12 giờ/tuần)",
    vacancies: 6,
    description:
      "Kiểm tra chính tả, phân loại thẻ danh mục sản phẩm mẫu và chuẩn hóa bảng biểu trên hệ thống quản trị của TechStart Demo.",
    requirements:
      "Thành thạo Excel / Google Sheets cơ bản, tỉ mỉ, tuyệt đối bảo mật dữ liệu dự án.",
    benefits:
      "Hoàn toàn không đóng bất kỳ khoản phí hay tiền cọc nào, ký thỏa thuận cộng tác viên minh bạch, trả lương qua tài khoản ngân hàng.",
  },
  {
    idx: 12,
    empIdx: 2,
    title: "Thực tập sinh Marketing mạng xã hội",
    category: "Marketing",
    job_type: "Internship",
    salary_min: 3000000,
    salary_max: 4500000,
    salary_unit: "month",
    location: "Quận 3, TP. Hồ Chí Minh",
    work_mode: "Hybrid",
    working_time: "Ca sáng & Ca chiều linh hoạt (4 ngày/tuần)",
    vacancies: 3,
    description:
      "Lên lịch nội dung tuần, phối hợp cùng Designer sản xuất bài đăng tương tác và tổng hợp chỉ số reach/engagement cuối tháng.",
    requirements:
      "Sinh viên chuyên ngành Marketing, Truyền thông hoặc Quản trị kinh doanh; sáng tạo, chủ động học hỏi.",
    benefits:
      "Được tham gia brainstorm các dự án thực tế, hỗ trợ chi phí gửi xe và phụ cấp ăn trưa.",
  },
  {
    idx: 13,
    empIdx: 1,
    title: "Gia sư Tiếng Anh lớp 6 – lớp 8",
    category: "Gia sư",
    job_type: "Part-time",
    salary_min: 130000,
    salary_max: 190000,
    salary_unit: "day",
    location: "Cầu Giấy, Hà Nội",
    work_mode: "Onsite",
    working_time: "Ca tối (19h00–21h00)",
    vacancies: 3,
    description:
      "Hướng dẫn ngữ pháp trọng tâm và luyện phát âm cho học sinh THCS theo lộ trình cá nhân hóa của Trung tâm Học Tốt Demo.",
    requirements:
      "Phát âm chuẩn, nắm chắc ngữ pháp phổ thông, có tinh thần trách nhiệm với sự tiến bộ của học sinh.",
    benefits:
      "Không thu phí nhận lớp trung gian (nhận lớp trực tiếp từ trung tâm), hỗ trợ tài liệu giảng dạy trọn khóa.",
  },
  {
    idx: 14,
    empIdx: 3,
    title: "Nhân viên thu ngân ca tối",
    category: "Bán hàng",
    job_type: "Part-time",
    salary_min: 28000,
    salary_max: 34000,
    salary_unit: "hour",
    location: "Cầu Giấy, Hà Nội",
    work_mode: "Onsite",
    working_time: "Ca tối (17h30–22h00)",
    vacancies: 2,
    description:
      "Thực hiện thanh toán bằng phần mềm POS, xuất hóa đơn, đối soát tiền mặt và chuyển khoản cuối ca chính xác.",
    requirements:
      "Cẩn thận với con số, thái độ niềm nở với khách hàng, ưu tiên sinh viên khối Kinh tế – Kế toán.",
    benefits:
      "Phần mềm POS hiện đại dễ sử dụng, phụ cấp trách nhiệm quầy thu ngân hàng tháng.",
  },
  {
    idx: 15,
    empIdx: 2,
    title: "Cộng tác viên quay dựng video ngắn (CapCut)",
    category: "Marketing",
    job_type: "Freelance",
    salary_min: 150000,
    salary_max: 250000,
    salary_unit: "project",
    location: "TP. Hồ Chí Minh",
    work_mode: "Hybrid",
    working_time: "Cuối tuần hoặc Linh hoạt",
    vacancies: 3,
    description:
      "Quay bằng điện thoại và dựng clip ngắn 30–60 giây review góc học tập, sách hay và mẹo công nghệ theo kịch bản.",
    requirements:
      "Sử dụng thành thạo CapCut hoặc Premiere cơ bản, biết căn góc quay sáng sủa, bắt nhịp âm thanh tốt.",
    benefits:
      "Thanh toán theo từng video nghiệm thu, thưởng thêm cho video đạt trên 20.000 lượt xem tự nhiên.",
  },
  {
    idx: 16,
    empIdx: 5,
    title: "Thực tập sinh Kiểm thử phần mềm (QA/Tester)",
    category: "Công nghệ",
    job_type: "Internship",
    salary_min: 3000000,
    salary_max: 4200000,
    salary_unit: "month",
    location: "Đà Nẵng",
    work_mode: "Onsite",
    working_time: "Ca sáng (8h00–12h00) từ Thứ 2 – Thứ 6",
    vacancies: 2,
    description:
      "Viết test case, thực hiện kiểm thử chức năng giao diện web & mobile app, ghi nhận lỗi trên Jira cùng đội phát triển.",
    requirements:
      "Sinh viên ngành CNTT hoặc Hệ thống thông tin, tư duy tỉ mỉ, yêu thích định hướng QA/QC.",
    benefits:
      "Đào tạo quy trình Agile/Scrum thực tế, cơ hội trở thành nhân viên chính thức ngay khi ra trường.",
  },
  {
    idx: 17,
    empIdx: 7,
    title: "Cộng tác viên Minh họa 2D & Sticker bộ nhận diện",
    category: "Thiết kế",
    job_type: "Freelance",
    salary_min: 300000,
    salary_max: 600000,
    salary_unit: "project",
    location: "Làm việc từ xa",
    work_mode: "Remote",
    working_time: "Linh hoạt theo dự án",
    vacancies: 2,
    description:
      "Vẽ bộ mascot và sticker minh họa phong cách trẻ trung cho ứng dụng giáo dục và quà tặng sinh viên.",
    requirements:
      "Có bảng vẽ điện tử/iPad, sử dụng Procreate hoặc Illustrator, đúng tiến độ phác thảo & hoàn thiện.",
    benefits:
      "Được ghi tên tác giả trong hồ sơ dự án (Portfolio credit), hợp đồng cộng tác minh bạch từng hạng mục.",
  },
  {
    idx: 18,
    empIdx: 0,
    title: "Nhân viên đón khách & hỗ trợ sự kiện Acoustic cuối tuần",
    category: "Phục vụ",
    job_type: "Part-time",
    salary_min: 32000,
    salary_max: 40000,
    salary_unit: "hour",
    location: "Hà Nội",
    work_mode: "Onsite",
    working_time: "Cuối tuần (Tối Thứ 6 & Thứ 7, 18h30–22h30)",
    vacancies: 3,
    description:
      "Soát mã đặt bàn online, hướng dẫn chỗ ngồi cho khách tham dự đêm nhạc Acoustic sinh viên tại Cafe Mộc Demo.",
    requirements:
      "Nhanh nhẹn, giao tiếp lịch thiệp, xử lý tình huống linh hoạt khi đông khách.",
    benefits:
      "Mức lương giờ cao dịp cuối tuần, môi trường âm nhạc văn minh, hỗ trợ ăn nhẹ trước ca.",
  },
  {
    idx: 19,
    empIdx: 4,
    title: "Cộng tác viên Tư vấn khóa học (Không ép KPI)",
    category: "Chăm sóc khách hàng",
    job_type: "Part-time",
    salary_min: 30000,
    salary_max: 42000,
    salary_unit: "hour",
    location: "TP. Hồ Chí Minh",
    work_mode: "Onsite",
    working_time: "Ca chiều (13h30–17h30) hoặc Ca tối (17h30–21h00)",
    vacancies: 3,
    description:
      "Liên hệ học viên đã chủ động để lại form đăng ký học thử để sắp xếp lịch kiểm tra trình độ đầu vào phù hợp.",
    requirements:
      "Giọng nói rõ ràng, thân thiện, biết lắng nghe nhu cầu người học.",
    benefits:
      "Dữ liệu khách hàng có nhu cầu thật 100%, thưởng thêm khi học viên tham gia buổi test đầu vào.",
  },
  {
    idx: 20,
    empIdx: 1,
    title: "Cộng tác viên Soạn thảo tài liệu LaTeX / Word",
    category: "Cộng tác viên",
    job_type: "Remote",
    salary_min: 28000,
    salary_max: 38000,
    salary_unit: "hour",
    location: "Làm việc từ xa",
    work_mode: "Remote",
    working_time: "Linh hoạt",
    vacancies: 4,
    description:
      "Chuyển đổi phiếu bài tập Toán – Lý sang định dạng Word Mathtype hoặc LaTeX sạch đẹp, chuẩn hóa hình vẽ hình học.",
    requirements:
      "Biết gõ công thức toán học (Mathtype hoặc LaTeX), trình bày văn bản khoa học, không sai sót ký hiệu.",
    benefits:
      "Làm việc online hoàn toàn, nhận tài liệu theo tuần phù hợp lịch rảnh của sinh viên.",
  },
  {
    idx: 21,
    empIdx: 5,
    title: "Cộng tác viên Hỗ trợ kỹ thuật IT Helpdesk",
    category: "Công nghệ",
    job_type: "Part-time",
    salary_min: 35000,
    salary_max: 45000,
    salary_unit: "hour",
    location: "Đà Nẵng",
    work_mode: "Onsite",
    working_time: "Ca chiều (13h30–17h30)",
    vacancies: 2,
    description:
      "Hỗ trợ cài đặt phần mềm văn phòng, hướng dẫn khách hàng sử dụng máy in hóa đơn và cấu hình cơ bản qua UltraViewer.",
    requirements:
      "Sinh viên CNTT/Điện tử viễn thông, am hiểu hệ điều hành Windows/macOS và mạng nội bộ cơ bản.",
    benefits:
      "Rèn kỹ năng giao tiếp khách hàng doanh nghiệp, phụ cấp đi lại khi hỗ trợ nội thành.",
  },
  {
    idx: 22,
    empIdx: 2,
    title: "Quản trị Fanpage & Cộng đồng Học thuật",
    category: "Marketing",
    job_type: "Remote",
    salary_min: 25000,
    salary_max: 33000,
    salary_unit: "hour",
    location: "Làm việc từ xa",
    work_mode: "Remote",
    working_time: "Ca tối & Cuối tuần linh hoạt",
    vacancies: 2,
    description:
      "Duyệt bài viết thành viên theo bộ quy tắc cộng đồng, ghim thông báo học bổng và phản hồi bình luận trên Fanpage.",
    requirements:
      "Thường xuyên online, sử dụng ngôn từ chuẩn mực, khách quan khi kiểm duyệt nội dung.",
    benefits:
      "Công việc ổn định lâu dài, linh hoạt thời gian ôn thi học kỳ.",
  },
  {
    idx: 23,
    empIdx: 7,
    title: "Thiết kế Slide thuyết trình chuyên nghiệp (PowerPoint / Canva)",
    category: "Thiết kế",
    job_type: "Freelance",
    salary_min: 120000,
    salary_max: 250000,
    salary_unit: "project",
    location: "Làm việc từ xa",
    work_mode: "Remote",
    working_time: "Linh hoạt",
    vacancies: 4,
    description:
      "Chuẩn hóa bố cục, biểu đồ và hiệu ứng tinh tế cho bài giảng điện tử và hồ sơ giới thiệu dự án (15–25 slides/bộ).",
    requirements:
      "Thành thạo PowerPoint hoặc Canva Pro, tư duy trực quan hóa dữ liệu (infographic) mạch lạc.",
    benefits:
      "Kho template bản quyền được cấp sẵn, thanh toán ngay sau mỗi bộ slide hoàn tất.",
  },
  {
    idx: 24,
    empIdx: 3,
    title: "Nhân viên kiểm kho & trưng bày Visual Merchandising",
    category: "Bán hàng",
    job_type: "Part-time",
    salary_min: 28000,
    salary_max: 32000,
    salary_unit: "hour",
    location: "Hà Nội",
    work_mode: "Onsite",
    working_time: "Ca sáng (8h30–12h30)",
    vacancies: 2,
    description:
      "Kiểm đếm tồn kho đầu ngày bằng máy quét mã vạch và phối hợp sắp xếp góc trưng bày theo chủ đề mùa lễ hội.",
    requirements:
      "Gọn gàng, có mắt thẩm mỹ sắp xếp đồ vật ngăn nắp, trung thực.",
    benefits:
      "Không gian làm việc sáng tạo, nghỉ phép linh hoạt trong tuần thi.",
  },
  {
    idx: 25,
    empIdx: 4,
    title: "Gia sư Lập trình Scratch & Python cơ bản cho học sinh",
    category: "Gia sư",
    job_type: "Part-time",
    salary_min: 55000,
    salary_max: 75000,
    salary_unit: "hour",
    location: "TP. Hồ Chí Minh",
    work_mode: "Hybrid",
    working_time: "Cuối tuần (Sáng hoặc Chiều Thứ 7, CN)",
    vacancies: 3,
    description:
      "Hướng dẫn học sinh cấp 2 làm quen tư duy thuật toán qua dự án trò chơi nhỏ trên Scratch và Python căn bản.",
    requirements:
      "Sinh viên CNTT hoặc Sư phạm Tin học, truyền đạt sinh động, yêu thích giáo dục STEM.",
    benefits:
      "Mức thù lao hấp dẫn (>50.000đ/giờ), giáo trình dự án trực quan có sẵn.",
  },
  {
    idx: 26,
    empIdx: 0,
    title: "Nhân viên trực quầy bánh ngọt & trà chiều",
    category: "Phục vụ",
    job_type: "Part-time",
    salary_min: 23000,
    salary_max: 25000,
    salary_unit: "hour",
    location: "Thanh Xuân, Hà Nội",
    work_mode: "Onsite",
    working_time: "Ca chiều (13h00–17h00)",
    vacancies: 2,
    description:
      "Bảo quản tủ bánh ngọt, đóng hộp mang đi và giới thiệu combo trà bánh buổi chiều cho sinh viên học nhóm.",
    requirements:
      "Nhẹ nhàng, sạch sẽ, phù hợp sinh viên năm 1–2 muốn tìm công việc nhẹ nhàng gần trường.",
    benefits:
      "Hỗ trợ gửi xe miễn phí, thưởng doanh thu quầy bánh cuối tháng.",
  },
  {
    idx: 27,
    empIdx: 2,
    title: "Cộng tác viên Dịch thuật phụ đề Anh – Việt",
    category: "Cộng tác viên",
    job_type: "Freelance",
    salary_min: 45000,
    salary_max: 65000,
    salary_unit: "hour",
    location: "Làm việc từ xa",
    work_mode: "Remote",
    working_time: "Linh hoạt",
    vacancies: 3,
    description:
      "Dịch và căn chỉnh phụ đề (subtitle) các video khoa học thường thức, kỹ năng mềm dài 8–12 phút sang tiếng Việt tự nhiên.",
    requirements:
      "Đọc nghe tiếng Anh tốt (IELTS 6.5+ hoặc tương đương), diễn đạt tiếng Việt mượt mà, biết dùng Aegisub là điểm cộng.",
    benefits:
      "Làm việc tại nhà 100%, nâng cao vốn từ học thuật đa lĩnh vực.",
  },
  {
    idx: 28,
    empIdx: 5,
    title: "Thực tập sinh Phân tích dữ liệu kinh doanh (Data Analyst Intern)",
    category: "Công nghệ",
    job_type: "Full-time",
    salary_min: null,
    salary_max: null,
    salary_unit: "month",
    location: "Hà Nội",
    work_mode: "Hybrid",
    working_time: "Giờ hành chính linh hoạt cho sinh viên năm cuối",
    vacancies: 1,
    description:
      "Xây dựng dashboard theo dõi chỉ số vận hành bằng SQL và Power BI / Metabase cùng đội ngũ Product.",
    requirements:
      "Sinh viên năm cuối ngành Hệ thống thông tin quản lý, Kinh tế lượng hoặc Khoa học dữ liệu; nắm vững SQL.",
    benefits:
      "Mức lương thỏa thuận theo năng lực (4.5–6.5 triệu/tháng), mentor trực tiếp từ trưởng nhóm dữ liệu.",
  },
  {
    idx: 29,
    empIdx: 4,
    title: "Điều phối viên Câu lạc bộ Tiếng Anh cuối tuần",
    category: "Cộng tác viên",
    job_type: "Part-time",
    salary_min: 35000,
    salary_max: 45000,
    salary_unit: "hour",
    location: "Đà Nẵng",
    work_mode: "Onsite",
    working_time: "Cuối tuần (Sáng Chủ nhật 8h30–11h30)",
    vacancies: 2,
    description:
      "Dẫn dắt trò chơi ice-breaking, chia nhóm thảo luận chủ đề tiếng Anh và tổng kết từ vựng cho CLB sinh viên.",
    requirements:
      "Tự tin đứng trước đám đông, tiếng Anh giao tiếp trôi chảy, nhiệt huyết kết nối mọi người.",
    benefits:
      "Mở rộng mạng lưới bạn bè quốc tế, chứng nhận điều phối viên hoạt động ngoại khóa.",
  },
  {
    idx: 30,
    empIdx: 7,
    title: "Trợ lý Chụp ảnh sản phẩm Lifestyle",
    category: "Thiết kế",
    job_type: "Part-time",
    salary_min: 35000,
    salary_max: 50000,
    salary_unit: "hour",
    location: "TP. Hồ Chí Minh",
    work_mode: "Onsite",
    working_time: "Ca sáng hoặc Ca chiều theo lịch buổi chụp",
    vacancies: 2,
    description:
      "Hỗ trợ chuẩn bị đạo cụ (props), set ánh sáng cơ bản và chụp hậu trường (behind-the-scenes) tại studio.",
    requirements:
      "Yêu thích nhiếp ảnh và styling sản phẩm, nhanh nhẹn, ham học hỏi.",
    benefits:
      "Học thực chiến kỹ thuật ánh sáng studio miễn phí, bao ăn trưa trong ngày chụp.",
  },
  {
    idx: 31,
    empIdx: 3,
    title: "Chăm sóc khách hàng Gian hàng Shopee / Lazada",
    category: "Chăm sóc khách hàng",
    job_type: "Part-time",
    salary_min: 24000,
    salary_max: 28000,
    salary_unit: "hour",
    location: "Các tỉnh thành khác",
    work_mode: "Remote",
    working_time: "Ca sáng (8h00–12h00) hoặc Ca tối (18h00–22h00)",
    vacancies: 3,
    description:
      "Tư vấn kích thước sản phẩm, hỗ trợ đổi trả minh bạch và giải đáp tình trạng đơn hàng trên khung chat sàn TMĐT.",
    requirements:
      "Phản hồi tin nhắn nhanh, thái độ cầu thị, có laptop cá nhân.",
    benefits:
      "Phù hợp sinh viên tại mọi tỉnh thành, hướng dẫn quy trình xử lý đơn sàn TMĐT chuyên nghiệp.",
  },
  {
    idx: 32,
    empIdx: 6,
    title: "Nhân viên chuẩn bị phần ăn Salad buổi sáng (Bản nháp chờ xác minh)",
    category: "Phục vụ",
    job_type: "Part-time",
    salary_min: 28000,
    salary_max: 33000,
    salary_unit: "hour",
    location: "Quận 1, TP. Hồ Chí Minh",
    work_mode: "Onsite",
    working_time: "Ca sáng (6h30–10h30)",
    vacancies: 3,
    description:
      "Sơ chế rau củ sạch, định lượng khẩu phần salad hộp theo thực đơn dinh dưỡng buổi sáng của Fresh Food Demo.",
    requirements:
      "Đúng giờ, đảm bảo vệ sinh an toàn thực phẩm.",
    benefits:
      "Tặng 1 phần ăn healthy mỗi ca làm việc.",
    status: "pending",
  },
];

export const DEMO_JOBS: Job[] = RAW_JOBS.map((item) => {
  const padded = String(item.idx).padStart(12, "0");
  const employer = DEMO_EMPLOYER_PROFILES[item.empIdx];
  const createdDay = String(((item.idx - 1) % 24) + 1).padStart(2, "0");
  return {
    id: `30000000-0000-4000-8000-${padded}`,
    employer_id: employer.id,
    title: item.title,
    slug: `demo-viec-lam-${item.idx}`,
    description: item.description,
    requirements: item.requirements,
    benefits: item.benefits,
    category: item.category,
    job_type: item.job_type,
    salary_min: item.salary_min,
    salary_max: item.salary_max,
    salary_unit: item.salary_unit,
    location: item.location,
    work_mode: item.work_mode,
    working_time: item.working_time,
    vacancies: item.vacancies,
    deadline: "2027-03-31",
    contact_info: `Phòng Nhân sự ${employer.company_name} (${employer.contact_email})`,
    views_count: 45 + item.idx * 13,
    status: item.status ?? "active",
    is_demo: true,
    created_at: `2026-11-${createdDay}T09:00:00Z`,
    updated_at: `2026-11-${createdDay}T09:00:00Z`,
    employer,
  };
});

const APP_SEEDS: Array<{
  idx: number;
  jobIdx: number;
  stuIdx: number;
  status: Application["status"];
  cover: string;
  note: string | null;
}> = [
  {
    idx: 1,
    jobIdx: 2,
    stuIdx: 0,
    status: "accepted",
    cover: "Em là Nguyễn Minh Anh, sinh viên năm 3 ngành Marketing. Em đã có 6 tháng viết bài fanpage và rất mong được đồng hành cùng Media Lab Demo.",
    note: "Bài viết thử mạch lạc, thái độ chuyên nghiệp. Đã nhận cộng tác.",
  },
  {
    idx: 2,
    jobIdx: 11,
    stuIdx: 0,
    status: "shortlisted",
    cover: "Em mong muốn thực tập vị trí Marketing mạng xã hội để phát triển kỹ năng lập kế hoạch nội dung đa kênh.",
    note: "Hồ sơ ấn tượng, hẹn phỏng vấn online chiều Thứ 5.",
  },
  {
    idx: 3,
    jobIdx: 1,
    stuIdx: 1,
    status: "accepted",
    cover: "Em là Trần Đức Minh, sinh viên CNTT Bách khoa, từng kèm học sinh lớp 9 đạt 8.5 điểm Toán học kỳ.",
    note: "Kiến thức vững, truyền đạt rõ ràng.",
  },
  {
    idx: 4,
    jobIdx: 5,
    stuIdx: 1,
    status: "reviewed",
    cover: "Em gửi hồ sơ ứng tuyển Thực tập sinh Frontend Next.js/React cùng các dự án TypeScript cá nhân.",
    note: "Đã xem GitHub demo, chờ trưởng nhóm kỹ thuật đánh giá thêm.",
  },
  {
    idx: 5,
    jobIdx: 4,
    stuIdx: 2,
    status: "accepted",
    cover: "Em có chứng chỉ IELTS 7.5 và 4 tháng trợ giảng lớp thiếu nhi, rất yêu thích môi trường EduPlus Demo.",
    note: "Phát âm rất tốt, phù hợp lớp giao tiếp cuối tuần.",
  },
  {
    idx: 6,
    jobIdx: 12,
    stuIdx: 2,
    status: "pending",
    cover: "Em có thể nhận lớp Gia sư Tiếng Anh tối Thứ 2 và Thứ 4 tại khu vực Cầu Giấy.",
    note: null,
  },
  {
    idx: 7,
    jobIdx: 0,
    stuIdx: 3,
    status: "shortlisted",
    cover: "Em có thể đi làm đều đặn ca sáng các ngày trong tuần và cả ngày cuối tuần tại Cafe Mộc Demo.",
    note: "Lịch rảnh phù hợp ca sáng, mời qua quán trao đổi.",
  },
  {
    idx: 8,
    jobIdx: 3,
    stuIdx: 3,
    status: "accepted",
    cover: "Em từng làm bán hàng dịp hè, giao tiếp thân thiện và sử dụng tốt phần mềm bán hàng.",
    note: "Đã nhận thử việc cuối tuần này.",
  },
  {
    idx: 9,
    jobIdx: 6,
    stuIdx: 4,
    status: "accepted",
    cover: "Em gửi kèm link Behance các dự án thiết kế social post và standee đã thực hiện.",
    note: "Gu thẩm mỹ hiện đại, đúng tinh thần Creative Studio Demo.",
  },
  {
    idx: 10,
    jobIdx: 16,
    stuIdx: 4,
    status: "pending",
    cover: "Em rất hào hứng với dự án vẽ bộ sticker linh vật sinh viên trên iPad Procreate.",
    note: null,
  },
  {
    idx: 11,
    jobIdx: 15,
    stuIdx: 5,
    status: "shortlisted",
    cover: "Em là sinh viên năm 4 Kỹ thuật phần mềm tại Đà Nẵng, đã có kinh nghiệm viết test case và SQL.",
    note: "Mời phỏng vấn trực tiếp sáng Thứ 3.",
  },
  {
    idx: 12,
    jobIdx: 20,
    stuIdx: 5,
    status: "reviewed",
    cover: "Em có thể hỗ trợ kỹ thuật ca chiều Thứ 2 – Thứ 6 tại khu vực Hải Châu.",
    note: "Đang cân nhắc lịch ca chiều.",
  },
  {
    idx: 13,
    jobIdx: 2,
    stuIdx: 6,
    status: "pending",
    cover: "Em là sinh viên Báo chí năm 2, mong muốn cộng tác viết bài chuyên mục đời sống sinh viên.",
    note: null,
  },
  {
    idx: 14,
    jobIdx: 14,
    stuIdx: 6,
    status: "rejected",
    cover: "Em ứng tuyển vị trí quay dựng clip ngắn cuối tuần.",
    note: "Hiện tại đợt tuyển ưu tiên ứng viên có sẵn thiết bị thu âm rời.",
  },
  {
    idx: 15,
    jobIdx: 7,
    stuIdx: 7,
    status: "pending",
    cover: "Em rất yêu thích pha chế đồ uống và mong được học nghề Barista tại Cafe Mộc Demo.",
    note: null,
  },
  {
    idx: 16,
    jobIdx: 8,
    stuIdx: 9,
    status: "reviewed",
    cover: "Em có sẵn laptop, mạng ổn định và kinh nghiệm trực tin nhắn hỗ trợ khách hàng buổi tối.",
    note: "Hồ sơ phù hợp ca tối.",
  },
  {
    idx: 17,
    jobIdx: 10,
    stuIdx: 9,
    status: "accepted",
    cover: "Em thành thạo Google Sheets và cam kết bảo mật dữ liệu nhập liệu 12 giờ/tuần.",
    note: "Làm bài test nhập liệu đạt 99% độ chính xác.",
  },
  {
    idx: 18,
    jobIdx: 28,
    stuIdx: 8,
    status: "pending",
    cover: "Em mong muốn tham gia điều phối CLB Tiếng Anh sáng Chủ nhật tại Đà Nẵng.",
    note: null,
  },
  {
    idx: 19,
    jobIdx: 0,
    stuIdx: 0,
    status: "pending",
    cover: "Em đăng ký ứng tuyển ca tối và cuối tuần tại Cafe Mộc Demo, có thể bắt đầu ngay tuần này.",
    note: null,
  },
  {
    idx: 20,
    jobIdx: 6,
    stuIdx: 0,
    status: "pending",
    cover: "Em sử dụng thành thạo Canva Pro và Illustrator cơ bản, mong muốn hỗ trợ thiết kế bài đăng Social Media.",
    note: null,
  },
  {
    idx: 21,
    jobIdx: 21,
    stuIdx: 0,
    status: "reviewed",
    cover: "Em đã có kinh nghiệm quản trị fanpage CLB sinh viên với hơn 15.000 thành viên.",
    note: "Hồ sơ phù hợp, bộ phận Nhân sự đang xếp lịch trao đổi.",
  },
  {
    idx: 22,
    jobIdx: 22,
    stuIdx: 0,
    status: "rejected",
    cover: "Em gửi hồ sơ ứng tuyển vị trí thiết kế Slide thuyết trình.",
    note: "Đợt tuyển này đã đủ số lượng cộng tác viên, hẹn bạn đợt sau.",
  },
];

export const DEMO_APPLICATIONS: Application[] = APP_SEEDS.map((a) => {
  const padded = String(a.idx).padStart(12, "0");
  const day = String(Math.min(24, a.idx + 5)).padStart(2, "0");
  return {
    id: `40000000-0000-4000-8000-${padded}`,
    job_id: DEMO_JOBS[a.jobIdx].id,
    student_id: DEMO_STUDENT_IDS[a.stuIdx],
    cover_letter: a.cover,
    relevant_experience: DEMO_STUDENT_PROFILES[a.stuIdx].experience,
    available_time: (DEMO_STUDENT_PROFILES[a.stuIdx].availability.shifts || []).join(", "),
    cv_url: null,
    status: a.status,
    employer_note: a.note,
    created_at: `2026-11-${day}T10:30:00Z`,
    updated_at: `2026-11-${day}T14:00:00Z`,
  };
});

export const DEMO_SAVED_JOBS: SavedJob[] = [
  {
    id: "50000000-0000-4000-8000-000000000001",
    student_id: DEMO_STUDENT_IDS[0],
    job_id: DEMO_JOBS[0].id,
    created_at: "2026-11-18T09:00:00Z",
  },
  {
    id: "50000000-0000-4000-8000-000000000002",
    student_id: DEMO_STUDENT_IDS[0],
    job_id: DEMO_JOBS[6].id,
    created_at: "2026-11-19T09:00:00Z",
  },
  {
    id: "50000000-0000-4000-8000-000000000003",
    student_id: DEMO_STUDENT_IDS[0],
    job_id: DEMO_JOBS[21].id,
    created_at: "2026-11-20T09:00:00Z",
  },
  {
    id: "50000000-0000-4000-8000-000000000004",
    student_id: DEMO_STUDENT_IDS[1],
    job_id: DEMO_JOBS[24].id,
    created_at: "2026-11-20T11:00:00Z",
  },
];

export const DEMO_VERIFICATION_REQUESTS: VerificationRequest[] = [
  {
    id: "60000000-0000-4000-8000-000000000001",
    employer_id: DEMO_EMPLOYER_IDS[6], // Fresh Food Demo
    business_name: "Hệ thống Thực phẩm sạch Fresh Food Demo",
    representative_name: "Hoàng Thu Trang",
    address: "Số 56 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh (Địa chỉ giả lập)",
    tax_code: "0319998887-DEMO",
    website: "https://freshfood.demo.stuwork.vn",
    contact_email: "hr.freshfood@demo.stuwork.vn",
    contact_phone: "0900100007",
    document_url: null,
    status: "pending",
    admin_note: null,
    reviewed_by: null,
    created_at: "2026-11-23T08:30:00Z",
  },
  {
    id: "60000000-0000-4000-8000-000000000002",
    employer_id: DEMO_EMPLOYER_IDS[0], // Cafe Mộc Demo
    business_name: "Hộ kinh doanh Cafe Mộc Demo",
    representative_name: "Nguyễn Thành Trung",
    address: "Số 42 Trần Thái Tông, Cầu Giấy, Hà Nội (Địa chỉ giả lập)",
    tax_code: "0108887776-DEMO",
    website: "https://cafemoc.demo.stuwork.vn",
    contact_email: "hr.cafemoc@demo.stuwork.vn",
    contact_phone: "0900100001",
    document_url: null,
    status: "verified",
    admin_note: "Đã đối chiếu thông tin đăng ký hộ kinh doanh minh họa hợp lệ.",
    reviewed_by: DEMO_ADMIN_ID,
    created_at: "2026-10-06T09:00:00Z",
  },
];

export const DEMO_JOB_REPORTS: JobReport[] = [
  {
    id: "70000000-0000-4000-8000-000000000001",
    job_id: DEMO_JOBS[30].id,
    reporter_id: DEMO_STUDENT_IDS[3],
    reason: "Mô tả công việc không đúng thực tế",
    description:
      "(Báo cáo minh họa Demo) Đề nghị ban quản trị kiểm tra lại khung giờ ca tối để sinh viên nắm rõ thời gian bàn giao ca.",
    status: "pending",
    admin_note: null,
    created_at: "2026-11-24T09:15:00Z",
  },
  {
    id: "70000000-0000-4000-8000-000000000002",
    job_id: DEMO_JOBS[10].id,
    reporter_id: DEMO_STUDENT_IDS[6],
    reason: "Thông tin nhà tuyển dụng đáng ngờ",
    description:
      "(Báo cáo minh họa Demo) Em muốn xác nhận xem công việc nhập liệu từ xa có cần ký biên bản bảo mật online không.",
    status: "resolved",
    admin_note: "Đã xác minh với TechStart Demo: hoàn toàn không thu phí và có thỏa thuận cộng tác rõ ràng.",
    created_at: "2026-11-18T15:20:00Z",
  },
];

export const DEMO_REVIEWS: Review[] = [
  {
    id: "80000000-0000-4000-8000-000000000001",
    job_id: DEMO_JOBS[2].id,
    student_id: DEMO_STUDENT_IDS[0],
    employer_id: DEMO_EMPLOYER_IDS[2],
    rating: 5,
    comment:
      "Anh chị biên tập tại Media Lab Demo hướng dẫn rất tận tình, trả nhuận bút đúng hẹn và linh hoạt tuần thi cử.",
    created_at: "2026-11-22T10:00:00Z",
  },
  {
    id: "80000000-0000-4000-8000-000000000002",
    job_id: DEMO_JOBS[1].id,
    student_id: DEMO_STUDENT_IDS[1],
    employer_id: DEMO_EMPLOYER_IDS[1],
    rating: 5,
    comment:
      "Trung tâm Học Tốt Demo chuẩn bị sẵn tài liệu bài bản, không thu bất kỳ khoản phí nhận lớp nào.",
    created_at: "2026-11-21T16:00:00Z",
  },
];

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: "90000000-0000-4000-8000-000000000001",
    user_id: DEMO_STUDENT_IDS[0],
    title: "Hồ sơ được chấp nhận!",
    message:
      "Media Lab Demo đã chấp nhận đơn ứng tuyển vị trí Cộng tác viên viết nội dung chuẩn SEO của bạn.",
    type: "application_status",
    is_read: false,
    link: "/student/applications",
    created_at: "2026-11-23T14:00:00Z",
  },
  {
    id: "90000000-0000-4000-8000-000000000002",
    user_id: DEMO_STUDENT_IDS[0],
    title: "Bạn được đưa vào danh sách tiềm năng",
    message:
      "Media Lab Demo đã chuyển hồ sơ Thực tập sinh Marketing mạng xã hội sang trạng thái Danh sách tiềm năng.",
    type: "application_status",
    is_read: false,
    link: "/student/applications",
    created_at: "2026-11-24T09:30:00Z",
  },
  {
    id: "90000000-0000-4000-8000-000000000003",
    user_id: DEMO_EMPLOYER_USER_IDS[0],
    title: "Có ứng viên mới ứng tuyển",
    message:
      "Bùi Tuấn Kiệt vừa gửi hồ sơ ứng tuyển vào vị trí Nhân viên pha chế (Barista Part-time).",
    type: "new_applicant",
    is_read: false,
    link: "/employer/applications",
    created_at: "2026-11-24T10:15:00Z",
  },
  {
    id: "90000000-0000-4000-8000-000000000004",
    user_id: DEMO_ADMIN_ID,
    title: "Yêu cầu xác minh nhà tuyển dụng mới",
    message:
      "Fresh Food Demo vừa gửi hồ sơ yêu cầu xác minh đơn vị tuyển dụng cần xét duyệt.",
    type: "verification_approved",
    is_read: false,
    link: "/admin/verifications",
    created_at: "2026-11-24T11:00:00Z",
  },
];

export const DEMO_ADMIN_LOGS: AdminLog[] = [
  {
    id: "95000000-0000-4000-8000-000000000001",
    admin_id: DEMO_ADMIN_ID,
    action: "approve_verification",
    target_type: "verification",
    target_id: DEMO_EMPLOYER_IDS[0],
    note: "Xác minh hồ sơ demo Cafe Mộc Demo đủ điều kiện đăng tuyển.",
    created_at: "2026-10-06T09:05:00Z",
  },
  {
    id: "95000000-0000-4000-8000-000000000002",
    admin_id: DEMO_ADMIN_ID,
    action: "resolve_report",
    target_type: "report",
    target_id: "70000000-0000-4000-8000-000000000002",
    note: "Kiểm tra tin CTV nhập liệu TechStart Demo minh bạch, giữ nguyên hiển thị.",
    created_at: "2026-11-19T10:00:00Z",
  },
];
