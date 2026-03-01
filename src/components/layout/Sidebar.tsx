"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Sparkles,
  LogOut,
  LogIn,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Upload Resume", href: "/upload", icon: FileText },
  { name: "Mock Interview", href: "/interview/start", icon: MessageSquare },
  { name: "Analytics", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border/50 bg-white shadow-[1px_0_12px_rgb(0,0,0,0.02)]">
      {/* Brand area */}
      <div className="flex h-16 items-center flex-shrink-0 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            InterviewAI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 pt-6">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/5 text-primary shadow-[inset_0_1px_0_rgb(255,255,255,0.5),0_1px_2px_rgb(0,0,0,0.02)]"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Settings */}
      <div className="flex flex-col flex-shrink-0 border-t border-border/50 p-4 gap-2">
        {user ? (
          <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground bg-primary/5 border border-primary/10">
            <UserCircle className="h-6 w-6 text-primary" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold truncate text-xs">{user.email}</span>
            </div>
          </div>
        ) : null}

        <Link
          href="/settings"
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/50 hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        {user ? (
          <button
            onClick={logout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive text-left"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
