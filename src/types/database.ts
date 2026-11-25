export type UserRole = "student" | "employer" | "admin";

export type VerificationStatus =
  | "not_submitted"
  | "pending"
  | "verified"
  | "rejected"
  | "suspended";

export type JobStatus = "draft" | "pending" | "active" | "closed" | "rejected";

export type SalaryUnit = "hour" | "day" | "month" | "project";

export type JobType =
  | "Part-time"
  | "Full-time"
  | "Freelance"
  | "Remote"
  | "Internship";

export type WorkMode = "Onsite" | "Remote" | "Hybrid";

export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type ReportStatus = "pending" | "reviewed" | "resolved" | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySchedule {
  shifts?: string[]; // ["Ca sáng", "Ca chiều", "Ca tối", "Cuối tuần", "Linh hoạt"]
  days?: string[]; // ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
  note?: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  university: string | null;
  major: string | null;
  year_of_study: number | null;
  location: string | null;
  bio: string | null;
  skills: string[];
  experience: string | null;
  desired_job_title?: string | null;
  desired_salary: number | null;
  availability: AvailabilitySchedule;
  cv_url: string | null;
}

export interface EmployerProfile {
  id: string;
  user_id: string;
  company_name: string;
  description: string | null;
  industry: string | null;
  address: string | null;
  website: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  founded_info?: string | null;
  logo_url: string | null;
  verification_status: VerificationStatus;
  is_demo?: boolean;
  created_at: string;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  benefits: string;
  category: string;
  job_type: JobType;
  salary_min: number | null;
  salary_max: number | null;
  salary_unit: SalaryUnit;
  location: string;
  work_mode: WorkMode;
  working_time: string;
  vacancies: number;
  deadline: string | null;
  contact_info?: string | null;
  views_count?: number;
  status: JobStatus;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations
  employer?: EmployerProfile;
  applications_count?: number;
  match_score?: number;
  match_reasons?: string[];
}

export interface Application {
  id: string;
  job_id: string;
  student_id: string;
  cover_letter: string;
  relevant_experience?: string | null;
  available_time?: string | null;
  cv_url: string | null;
  status: ApplicationStatus;
  employer_note: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  job?: Job;
  student?: Profile;
  student_profile?: StudentProfile;
}

export interface SavedJob {
  id: string;
  student_id: string;
  job_id: string;
  created_at: string;
  job?: Job;
}

export interface JobReport {
  id: string;
  job_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: ReportStatus;
  admin_note: string | null;
  created_at: string;
  job?: Job;
  reporter?: Profile;
}

export interface VerificationRequest {
  id: string;
  employer_id: string;
  business_name: string;
  representative_name: string;
  address?: string | null;
  tax_code?: string | null;
  website?: string | null;
  contact_email: string;
  contact_phone: string;
  document_url: string | null;
  status: "pending" | "verified" | "rejected";
  admin_note: string | null;
  reviewed_by: string | null;
  created_at: string;
  employer?: EmployerProfile;
}

export interface Review {
  id: string;
  job_id: string;
  student_id: string;
  employer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  student?: Pick<Profile, "id" | "full_name" | "avatar_url">;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type:
    | "application_submitted"
    | "new_applicant"
    | "application_status"
    | "job_approved"
    | "job_rejected"
    | "verification_approved"
    | "verification_rejected"
    | "report_update"
    | "system";
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: "user" | "employer" | "verification" | "job" | "report";
  target_id: string;
  note: string | null;
  created_at: string;
  admin?: Pick<Profile, "id" | "full_name" | "email">;
}

export interface JobFilterParams {
  q?: string;
  job_type?: string;
  category?: string;
  salary_range?: string; // "under_25k" | "25k_35k" | "35k_50k" | "over_50k" | "negotiable"
  location?: string;
  working_time?: string;
  verified_only?: boolean;
  sort?: "newest" | "salary_desc" | "best_match";
  page?: number;
  limit?: number;
}
