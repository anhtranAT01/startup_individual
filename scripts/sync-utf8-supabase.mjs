import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { createClient } from "@supabase/supabase-js";

// 1. Load .env.local
const envPath = path.resolve(".env.local");
const envText = fs.readFileSync(envPath, "utf8");
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

// 2. Transpile and load src/services/demo-seed-data.ts in pure UTF-8
const seedTsPath = path.resolve("src/services/demo-seed-data.ts");
const seedTsCode = fs.readFileSync(seedTsPath, "utf8");
const transpiled = ts.transpileModule(seedTsCode, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});

const moduleExports = {};
const sandbox = {
  exports: moduleExports,
  module: { exports: moduleExports },
  require: () => ({}),
};
vm.runInNewContext(transpiled.outputText, sandbox);
const seed = sandbox.module.exports;

console.log(
  `Loaded UTF-8 seed data: ${seed.DEMO_PROFILES.length} profiles, ${seed.DEMO_EMPLOYER_PROFILES.length} employers, ${seed.DEMO_STUDENT_PROFILES.length} students, ${seed.DEMO_JOBS.length} jobs.`
);

// 3. Connect to live Supabase with Service Role Key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runSync() {
  // Update profiles (preserve admin@stuwork.vn if it exists on DEMO_ADMIN_ID)
  for (const p of seed.DEMO_PROFILES) {
    const payload = { ...p };
    if (p.id === seed.DEMO_ADMIN_ID) {
      delete payload.email; // keep admin@stuwork.vn or whatever email is set
      payload.full_name = "Quản Trị Viên STUWORK";
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: payload.full_name,
        phone: payload.phone,
      })
      .eq("id", p.id);
    if (error) console.warn("Profile update warning:", p.id, error.message);
  }
  console.log("✓ Updated profiles in UTF-8");

  // Update employer_profiles (do not overwrite id so foreign keys on jobs stay intact)
  for (const emp of seed.DEMO_EMPLOYER_PROFILES) {
    const { error } = await supabase
      .from("employer_profiles")
      .update({
        company_name: emp.company_name,
        description: emp.description,
        industry: emp.industry,
        address: emp.address,
        website: emp.website,
        contact_email: emp.contact_email,
        contact_phone: emp.contact_phone,
        founded_info: emp.founded_info,
        verification_status: emp.verification_status,
        is_demo: true,
      })
      .eq("user_id", emp.user_id);
    if (error) console.warn("Employer update warning:", emp.company_name, error.message);
  }
  console.log("✓ Updated employer_profiles in UTF-8");

  // Fetch live employer_profiles map (user_id -> id) in case DB generated different UUIDs
  const { data: liveEmployers } = await supabase
    .from("employer_profiles")
    .select("id, user_id");
  const empIdByUserId = new Map();
  for (const row of liveEmployers || []) {
    empIdByUserId.set(row.user_id, row.id);
  }

  // Map demo employer_id -> user_id
  const userIdByDemoEmpId = new Map();
  for (const emp of seed.DEMO_EMPLOYER_PROFILES) {
    userIdByDemoEmpId.set(emp.id, emp.user_id);
  }

  // Update student_profiles
  for (const stu of seed.DEMO_STUDENT_PROFILES) {
    const { error } = await supabase
      .from("student_profiles")
      .upsert(
        {
          user_id: stu.user_id,
          university: stu.university,
          major: stu.major,
          year_of_study: stu.year_of_study,
          location: stu.location,
          bio: stu.bio,
          skills: stu.skills,
          experience: stu.experience,
          desired_job_title: stu.desired_job_title,
          desired_salary: stu.desired_salary,
          availability: stu.availability,
        },
        { onConflict: "user_id" }
      );
    if (error) console.warn("Student upsert warning:", stu.user_id, error.message);
  }
  console.log("✓ Updated student_profiles in UTF-8");

  // Update jobs (all 32 jobs with clean Vietnamese title, description, requirements, benefits, category, location, working_time)
  for (const job of seed.DEMO_JOBS) {
    const ownerUserId = userIdByDemoEmpId.get(job.employer_id);
    const liveEmployerId = empIdByUserId.get(ownerUserId) || job.employer_id;
    const { error } = await supabase
      .from("jobs")
      .upsert(
        {
          id: job.id,
          employer_id: liveEmployerId,
          title: job.title,
          slug: job.slug,
          description: job.description,
          requirements: job.requirements,
          benefits: job.benefits,
          category: job.category,
          job_type: job.job_type,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          salary_unit: job.salary_unit,
          location: job.location,
          work_mode: job.work_mode,
          working_time: job.working_time,
          vacancies: job.vacancies,
          deadline: job.deadline,
          contact_info: job.contact_info,
          views_count: job.views_count,
          status: job.status,
          is_demo: true,
        },
        { onConflict: "id" }
      );
    if (error) console.warn("Job upsert warning:", job.slug, error.message);
  }
  console.log("✓ Updated all 32 jobs in UTF-8");

  // Update applications
  for (const app of seed.DEMO_APPLICATIONS) {
    const { error } = await supabase
      .from("applications")
      .upsert(
        {
          id: app.id,
          job_id: app.job_id,
          student_id: app.student_id,
          cover_letter: app.cover_letter,
          relevant_experience: app.relevant_experience,
          available_time: app.available_time,
          status: app.status,
          employer_note: app.employer_note,
        },
        { onConflict: "id" }
      );
    if (error) console.warn("Application upsert warning:", app.id, error.message);
  }
  console.log("✓ Updated applications in UTF-8");

  // Update verification_requests
  for (const vr of seed.DEMO_VERIFICATION_REQUESTS) {
    const ownerUserId = userIdByDemoEmpId.get(vr.employer_id);
    const liveEmployerId = empIdByUserId.get(ownerUserId) || vr.employer_id;
    const { error } = await supabase
      .from("verification_requests")
      .upsert(
        {
          id: vr.id,
          employer_id: liveEmployerId,
          business_name: vr.business_name,
          representative_name: vr.representative_name,
          address: vr.address,
          tax_code: vr.tax_code,
          website: vr.website,
          contact_email: vr.contact_email,
          contact_phone: vr.contact_phone,
          status: vr.status,
          admin_note: vr.admin_note,
        },
        { onConflict: "id" }
      );
    if (error) console.warn("Verification upsert warning:", vr.id, error.message);
  }
  console.log("✓ Updated verification_requests in UTF-8");

  // Update job_reports
  for (const rep of seed.DEMO_JOB_REPORTS) {
    const { error } = await supabase
      .from("job_reports")
      .upsert(
        {
          id: rep.id,
          job_id: rep.job_id,
          reporter_id: rep.reporter_id,
          reason: rep.reason,
          description: rep.description,
          status: rep.status,
          admin_note: rep.admin_note,
        },
        { onConflict: "id" }
      );
    if (error) console.warn("Report upsert warning:", rep.id, error.message);
  }
  console.log("✓ Updated job_reports in UTF-8");

  // Update reviews
  for (const rev of seed.DEMO_REVIEWS) {
    const ownerUserId = userIdByDemoEmpId.get(rev.employer_id);
    const liveEmployerId = empIdByUserId.get(ownerUserId) || rev.employer_id;
    const { error } = await supabase
      .from("reviews")
      .upsert(
        {
          id: rev.id,
          job_id: rev.job_id,
          student_id: rev.student_id,
          employer_id: liveEmployerId,
          rating: rev.rating,
          comment: rev.comment,
        },
        { onConflict: "id" }
      );
    if (error) console.warn("Review upsert warning:", rev.id, error.message);
  }
  console.log("✓ Updated reviews in UTF-8");

  // Update notifications
  for (const notif of seed.DEMO_NOTIFICATIONS) {
    const { error } = await supabase
      .from("notifications")
      .upsert(
        {
          id: notif.id,
          user_id: notif.user_id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          is_read: notif.is_read,
          link: notif.link,
        },
        { onConflict: "id" }
      );
    if (error) console.warn("Notification upsert warning:", notif.id, error.message);
  }
  console.log("✓ Updated notifications in UTF-8");

  // Verify sample jobs from Supabase
  const { data: verifyJobs } = await supabase
    .from("jobs")
    .select("title, location, working_time")
    .limit(5);
  console.log("Sample jobs now in Supabase:", verifyJobs);
}

// 4. Also regenerate supabase/all_in_one_setup.sql in 100% pure UTF-8
const m1 = fs.readFileSync("supabase/migrations/20261125000001_initial_schema.sql", "utf8");
const m2 = fs.readFileSync("supabase/migrations/20261125000002_rls_and_storage.sql", "utf8");
const s1 = fs.readFileSync("supabase/seed.sql", "utf8");
fs.writeFileSync(
  "supabase/all_in_one_setup.sql",
  [m1, m2, s1].join("\n\n"),
  "utf8"
);
console.log("✓ Regenerated supabase/all_in_one_setup.sql in pure UTF-8");

runSync().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
