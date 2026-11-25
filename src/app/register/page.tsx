import { redirect } from "next/navigation";
import { getCurrentAuthContext } from "@/services/data-service";
import { RegisterClientWrapper } from "@/components/forms/register-client";

export const metadata = {
  title: "Đăng ký tài khoản",
};

export default async function RegisterPage() {
  const ctx = await getCurrentAuthContext();
  if (ctx.user) {
    if (ctx.user.role === "admin") redirect("/admin");
    if (ctx.user.role === "employer") redirect("/employer/dashboard");
    redirect("/student/dashboard");
  }

  return <RegisterClientWrapper />;
}
