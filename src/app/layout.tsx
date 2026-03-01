import "@/app/globals.css";
import { Inter } from "next/font/google";
import { AppLayout } from "@/components/layout/AppLayout";
import Providers from "@/components/layout/Providers"; // We'll create this next for React Query
import { AuthProvider } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Interviewer Platform",
  description: "AI-Powered Technical Interview Simulator with Skill Analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#fcfcfc] text-foreground antialiased`}>
        <Providers>
          <AuthProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
