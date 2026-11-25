import { redirect } from "next/navigation";
import { getCurrentAuthContext } from "@/services/data-service";
import { LoginClientWrapper } from "@/components/forms/login-client";

export const metadata = {
  title: "Đăng nhập",
};

export default async function LoginPage() {
  const ctx = await getCurrentAuthContext();
  if (ctx.user) {
    if (ctx.user.role === "admin") redirect("/admin");
    if (ctx.user.role === "employer") redirect("/employer/dashboard");
    redirect("/student/dashboard");
  }

  return <LoginClientWrapper isCloudMode={ctx.isCloudMode} />;
}
