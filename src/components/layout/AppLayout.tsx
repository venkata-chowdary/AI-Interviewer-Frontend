"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    // Determine if the current route is an auth route
    const isAuthRoute = pathname === "/login" || pathname === "/register";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isLoading && isMounted) {
            if (!user && !isAuthRoute) {
                // If not logged in and not on an auth page, redirect to login
                router.push("/login");
            } else if (user && isAuthRoute) {
                // If logged in and on an auth page, redirect to dashboard
                router.push("/dashboard");
            }
        }
    }, [user, isLoading, isAuthRoute, router, isMounted]);

    // Prevent hydration mismatch and hide content until client is ready
    if (!isMounted || isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // If we are on an auth route and not logged in, render without sidebar
    if (isAuthRoute && !user) {
        return (
            <main className="flex min-h-screen w-full flex-col bg-[#fcfcfc]">
                {children}
            </main>
        );
    }

    // If we are logged in, render with sidebar
    if (user) {
        return (
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto px-8 py-10 selection:bg-primary/20">
                    {children}
                </main>
            </div>
        );
    }

    // Fallback (should be caught by the router.push above)
    return null;
}
