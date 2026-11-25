import { redirect } from "next/navigation";
import {
  getCurrentAuthContext,
  getStudentPortalData,
} from "@/services/data-service";
import { StudentWorkspaceShell } from "@/components/layout/student-workspace-nav";

export default async function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getCurrentAuthContext();
  if (!auth.user) {
    redirect("/login?next=/student/dashboard");
  }
  if (auth.user.role === "employer") {
    redirect("/employer/dashboard");
  }
  if (auth.user.role === "admin") {
    redirect("/admin");
  }

  const portalData = await getStudentPortalData(auth.user.id);

  return (
    <StudentWorkspaceShell
      user={auth.user}
      applicationsCount={portalData?.applications.length || 0}
      savedCount={portalData?.savedJobs.length || 0}
    >
      {children}
    </StudentWorkspaceShell>
  );
}
