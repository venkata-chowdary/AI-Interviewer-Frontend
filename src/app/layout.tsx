import "@/app/globals.css";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import Providers from "@/components/layout/Providers"; // We'll create this next for React Query

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
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-8 py-10 selection:bg-primary/20">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
