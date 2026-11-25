import { redirect } from "next/navigation";
import {
  getCurrentAuthContext,
  getEmployerPortalData,
} from "@/services/data-service";
import { EmployerWorkspaceShell } from "@/components/layout/employer-workspace-nav";

export default async function EmployerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getCurrentAuthContext();
  if (!auth.user) {
    redirect("/login?next=/employer/dashboard");
  }
  if (auth.user.role === "student") {
    redirect("/student/dashboard");
  }
  if (auth.user.role === "admin") {
    redirect("/admin");
  }

  const portalData = await getEmployerPortalData(auth.user.id);

  return (
    <EmployerWorkspaceShell
      user={auth.user}
      employerProfile={auth.employerProfile}
      jobsCount={portalData?.stats.totalJobs || 0}
      pendingApplicantsCount={portalData?.stats.pendingApplicants || 0}
      totalApplicantsCount={portalData?.stats.totalApplicants || 0}
    >
      {children}
    </EmployerWorkspaceShell>
  );
}
