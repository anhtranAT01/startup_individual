import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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
import {
  DEMO_ADMIN_LOGS,
  DEMO_APPLICATIONS,
  DEMO_EMPLOYER_PROFILES,
  DEMO_JOB_REPORTS,
  DEMO_JOBS,
  DEMO_NOTIFICATIONS,
  DEMO_PROFILES,
  DEMO_REVIEWS,
  DEMO_SAVED_JOBS,
  DEMO_STUDENT_PROFILES,
  DEMO_VERIFICATION_REQUESTS,
} from "./demo-seed-data";

export interface SandboxAccountSecret {
  user_id: string;
  email: string;
  password_hash: string; // scrypt salted hash - NEVER store plaintext passwords
}

export interface LocalSandboxState {
  profiles: Profile[];
  student_profiles: StudentProfile[];
  employer_profiles: EmployerProfile[];
  jobs: Job[];
  applications: Application[];
  saved_jobs: SavedJob[];
  job_reports: JobReport[];
  verification_requests: VerificationRequest[];
  reviews: Review[];
  notifications: AppNotification[];
  admin_logs: AdminLog[];
  auth_secrets: SandboxAccountSecret[];
}

const DB_DIR = path.join(process.cwd(), ".local-db");
const DB_FILE = path.join(DB_DIR, "stuwork-sandbox.json");

export function hashPasswordScrypt(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPasswordScrypt(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(derived, "hex"));
}

function buildInitialSandboxState(): LocalSandboxState {
  return {
    profiles: structuredClone(DEMO_PROFILES),
    student_profiles: structuredClone(DEMO_STUDENT_PROFILES),
    employer_profiles: structuredClone(DEMO_EMPLOYER_PROFILES),
    jobs: structuredClone(DEMO_JOBS).map(({ employer: _e, ...rest }) => rest),
    applications: structuredClone(DEMO_APPLICATIONS),
    saved_jobs: structuredClone(DEMO_SAVED_JOBS),
    job_reports: structuredClone(DEMO_JOB_REPORTS),
    verification_requests: structuredClone(DEMO_VERIFICATION_REQUESTS),
    reviews: structuredClone(DEMO_REVIEWS),
    notifications: structuredClone(DEMO_NOTIFICATIONS),
    admin_logs: structuredClone(DEMO_ADMIN_LOGS),
    auth_secrets: [],
  };
}

export function readSandboxDb(): LocalSandboxState {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = buildInitialSandboxState();
      writeSandboxDb(initial);
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw) as LocalSandboxState;
  } catch {
    return buildInitialSandboxState();
  }
}

export function writeSandboxDb(state: LocalSandboxState): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    // Trong môi trường serverless read-only (nếu quên cấu hình Supabase), vẫn trả dữ liệu in-memory an toàn
  }
}

export const SANDBOX_SESSION_COOKIE = "stuwork_sandbox_uid";
export const SANDBOX_ROLE_COOKIE = "stuwork_sandbox_role";

