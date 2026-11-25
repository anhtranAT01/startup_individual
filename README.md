# STUWORK – Nền tảng Kết nối Sinh viên với Việc làm thêm An toàn (MVP 1.0)

**STUWORK** là ứng dụng web chuẩn hóa thông tin tuyển dụng việc làm thêm, bán thời gian và freelance dành cho sinh viên Việt Nam, tập trung vào 3 trụ cột cốt lõi: **Kết nối phù hợp lịch học – Minh bạch lương thưởng – An toàn trước tin lừa đảo**.

---

## 1. Công nghệ & Kiến trúc Hệ thống

- **Frontend & Backend:** Next.js 15 (App Router) + React 19 + TypeScript + Server Actions
- **Giao diện (UI/UX):** Tailwind CSS + Custom Startup Design System (`Plus Jakarta Sans` & `Inter`) + `lucide-react` + `recharts`
- **Database, Auth & Storage:** Supabase PostgreSQL + Supabase Auth (`@supabase/ssr`) + Supabase Storage (4 Buckets) + Row Level Security (RLS)
- **Triển khai (Hosting):** GitHub + Vercel

### Cấu trúc thư mục chính
```text
stuwork/
├── public/logo/                      # Logo SVG thương hiệu STUWORK
├── src/
│   ├── app/                          # App Router (Public, Auth, Student, Employer, Admin, API)
│   ├── components/                   # UI System, Layout, Job Cards, Forms, Dashboards
│   ├── lib/supabase/                 # Supabase Browser / Server / Service Clients
│   ├── services/                     # Data Repository, Server Actions, Recommendation Engine, Seed
│   ├── types/                        # Định nghĩa kiểu dữ liệu TypeScript cho 11 bảng
│   └── middleware.ts                 # Làm mới session Supabase & bảo vệ route phân quyền
├── supabase/
│   ├── migrations/
│   │   ├── 20261125000001_initial_schema.sql   # 11 bảng, khóa ngoại, indexes, triggers
│   │   └── 20261125000002_rls_and_storage.sql  # RLS cho toàn bộ 11 bảng & 4 Storage Buckets
│   └── seed.sql                      # 32 công việc, 8 nhà tuyển dụng, 10 sinh viên, 16+ đơn demo
├── .env.example                      # Mẫu biến môi trường an toàn
└── README.md
```

---

## 2. Hướng dẫn Cài đặt & Chạy Local

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Cấu hình môi trường
Sao chép file `.env.example` thành `.env.local`:
```bash
cp .env.example .env.local
```
Điền các khóa từ **Supabase Dashboard -> Project Settings -> API**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-server-only
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Chế độ Local Sandbox tiện lợi khi chưa tạo Supabase Cloud:**  
> Nếu bạn chạy `npm run dev` ngay khi `.env.local` còn để trống, ứng dụng tự động khởi chạy ở **Chế độ Trình diễn Cục bộ (Local Sandbox)** với đầy đủ 32 công việc mẫu và hỗ trợ **Đăng ký/Đăng nhập/Tạo tin/Ứng tuyển/Duyệt xác minh/Xử lý báo cáo** lưu vào `.local-db/` (đã được `.gitignore` loại trừ). Ngay khi điền biến môi trường Supabase, hệ thống tự động chuyển 100% sang cơ sở dữ liệu Supabase PostgreSQL thực tế.

### Bước 3: Khởi chạy máy chủ phát triển
```bash
npm run dev
```
Truy cập tại: `http://localhost:3000`

---

## 3. Khởi tạo Cơ sở dữ liệu Supabase (Schema, RLS & Seed Data)

1. Đăng nhập [Supabase Dashboard](https://supabase.com/dashboard) và tạo một Project mới.
2. Mở mục **SQL Editor** và chạy lần lượt 3 tệp SQL theo đúng thứ tự:
   - **Bước 3.1:** Chạy nội dung file `supabase/migrations/20261125000001_initial_schema.sql` (tạo 11 bảng `profiles`, `student_profiles`, `employer_profiles`, `jobs`, `applications`, `saved_jobs`, `job_reports`, `verification_requests`, `reviews`, `notifications`, `admin_logs` và trigger đồng bộ tài khoản chống giả mạo quyền `admin`).
   - **Bước 3.2:** Chạy nội dung file `supabase/migrations/20261125000002_rls_and_storage.sql` (bật RLS trên toàn bộ 11 bảng và tạo 4 Storage Buckets: `avatars`, `company-logos`, `student-cvs`, `verification-documents`).
   - **Bước 3.3:** Chạy nội dung file `supabase/seed.sql` (chèn 32 công việc demo, 8 nhà tuyển dụng demo, 10 sinh viên demo, 16 đơn ứng tuyển đa trạng thái; có thể chạy lại nhiều lần không trùng lặp và **không tạo mật khẩu cố định công khai**).

### Cách cấp quyền tài khoản Quản trị viên (Admin) an toàn trên Supabase
Vì lý do bảo mật, giao diện `/register` và Database Trigger **không cho phép người dùng tự chọn vai trò `admin`**. Để tạo tài khoản Admin phục vụ trình diễn trên Supabase thực tế:
1. Đăng ký một tài khoản bình thường tại `/register` bằng email của bạn (ví dụ `giangvien@stuwork.vn`).
2. Vào **Supabase Dashboard -> SQL Editor** và chạy câu lệnh phía máy chủ:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'giangvien@stuwork.vn';
```
3. Đăng nhập lại để truy cập toàn quyền tại `/admin`.

---

## 4. Hướng dẫn Triển khai lên GitHub & Vercel (Phần XIV PRD)

1. **Đẩy mã nguồn lên GitHub:**
   - Kiểm tra `git status` để chắc chắn không có tệp `.env.local` hay khóa bí mật.
   - Đẩy repository lên tài khoản GitHub cá nhân.
2. **Triển khai trên Vercel:**
   - Truy cập [Vercel Dashboard](https://vercel.com/new) -> **Import Git Repository** dự án `stuwork`.
   - Framework Preset: **Next.js**.
   - Khai báo **Environment Variables** trên Vercel:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` *(Chỉ đọc ở phía Server, tuyệt đối không có tiền tố `NEXT_PUBLIC_`)*
     - `NEXT_PUBLIC_SITE_URL` = `https://ten-du-an.vercel.app`
   - Nhấn **Deploy**.
3. **Cấu hình Supabase Authentication URLs:**
   - Vào **Supabase Dashboard -> Authentication -> URL Configuration**:
     - **Site URL:** `https://ten-du-an.vercel.app`
     - **Redirect URLs:**
       - `https://ten-du-an.vercel.app/auth/callback`
       - `http://localhost:3000/auth/callback`

---

## 5. Hướng dẫn Sử dụng theo 3 Vai trò

### A. Sinh viên (`Student`)
- Truy cập `/jobs` để tìm kiếm theo từ khóa và kết hợp 6 bộ lọc (Loại việc, Danh mục, Mức lương, Địa điểm, Khung giờ ca làm, Chỉ nhà tuyển dụng đã xác minh).
- Hoàn thiện học vấn, kỹ năng, lịch rảnh và tải CV PDF riêng tư tại `/student/profile`.
- Nhấn **Ứng tuyển ngay** tại `/jobs/[id]/apply`, theo dõi tiến độ xét duyệt hoặc rút hồ sơ tại `/student/applications`, xem việc yêu thích tại `/student/saved-jobs`.
- Gửi báo cáo tin đáng ngờ tại `/jobs/[id]/report` và đánh giá sao sau khi đơn ứng tuyển được chấp nhận (`Accepted`).

### B. Nhà tuyển dụng (`Employer`)
- Cập nhật thông tin đơn vị & logo tại `/employer/profile`.
- Gửi yêu cầu xác minh kèm giấy tờ chứng minh tại `/employer/verification`.
- Tạo tin mới tại `/employer/jobs/create`: khi chưa xác minh có thể **Lưu bản nháp** và **Xem trước**; sau khi được Admin duyệt xác minh có thể **Xuất bản công khai**.
- Xem danh sách ứng viên, đọc CV qua Signed URL, ghi chú nội bộ và chuyển trạng thái hồ sơ tại `/employer/applications` (hệ thống tự động gửi thông báo cho sinh viên).

### C. Quản trị viên (`Admin`)
- Truy cập `/admin` để xem thống kê toàn nền tảng và biểu đồ trực quan.
- Thẩm định **Duyệt / Từ chối xác minh** nhà tuyển dụng tại `/admin/verifications`.
- Xử lý báo cáo tin lừa đảo & ẩn ngay tin vi phạm tại `/admin/reports`.
- Khóa/mở khóa tài khoản tại `/admin/users` và tra cứu lịch sử thao tác trong `admin_logs` tại `/admin/analytics`.

---

## 6. Trạng thái Bàn giao MVP & Phạm vi Giới hạn

### Các chức năng đã hoàn thành
- [x] Đầy đủ 15+ trang giao diện tiếng Việt hiện đại, responsive trên Desktop/Tablet/Mobile.
- [x] Schema PostgreSQL 11 bảng, Indexes, Triggers, chính sách RLS bảo mật và 4 Storage Buckets.
- [x] Dữ liệu mẫu phong phú (`seed.sql`): 32 công việc, 8 nhà tuyển dụng, 10 sinh viên, 16+ đơn ứng tuyển gắn nhãn `Dữ liệu minh họa`.
- [x] Hệ thống đăng ký, đăng nhập, quên mật khẩu, phân quyền 3 vai trò chặt chẽ ở cả Middleware và Server Actions.
- [x] Thuật toán gợi ý công việc theo quy tắc trọng số (Kỹ năng 30%, Địa điểm 20%, Lương 20%, Thời gian 20%, Loại hình 10%).
- [x] Hệ thống thông báo trong ứng dụng (`notifications`) và nhật ký quản trị (`admin_logs`).

### Giới hạn chủ đích trong phiên bản MVP
- Không tích hợp cổng thanh toán trực tuyến, ví điện tử hay dịch vụ giữ tiền trung gian (tuân thủ nghiêm ngặt quy định của PRD).
- Thông báo hoạt động trực tiếp trong ứng dụng (In-app Notifications); chưa gửi email marketing tự động bên ngoài luồng Auth của Supabase.
- Trạng thái triển khai Cloud: Mã nguồn, migration và cấu hình đã sẵn sàng 100% để kết nối Supabase Project và deploy lên Vercel ngay sau khi đẩy lên GitHub.
