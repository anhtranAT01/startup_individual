import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { getCurrentAuthContext } from "@/services/data-service";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "STUWORK – Nền tảng kết nối sinh viên với việc làm thêm an toàn",
    template: "%s | STUWORK",
  },
  description:
    "STUWORK giúp sinh viên tiếp cận những cơ hội việc làm thêm, bán thời gian và freelance minh bạch, linh hoạt và phù hợp với lịch học.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await getCurrentAuthContext();

  return (
    <html lang="vi" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <Navbar
          user={auth.user}
          unreadNotifications={auth.unreadNotifications}
          isCloudMode={auth.isCloudMode}
        />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
