"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "O" },
  { href: "/dashboard/workouts", label: "Workouts", icon: "W" },
  { href: "/dashboard/progress", label: "Progress", icon: "P" },
  { href: "/dashboard/profile", label: "Profile", icon: "U" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Mobile Top Navigation Header */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-card border-b border-border z-40 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            F
          </div>
          <span className="font-bold text-base text-foreground tracking-tight">Training</span>
        </Link>
        <nav className="flex gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
                  isActive ? "text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400" : "text-foreground/60 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {item.icon}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Desktop Hover-Collapsible Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-20 hover:w-64 bg-card border-r border-border p-4 flex-col gap-6 shrink-0 transition-all duration-300 z-50 group shadow-sm overflow-x-hidden">
        <Link href="/" className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            F
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap">
            Training
          </span>
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-foreground/5 text-[10px] font-bold text-foreground">
                  {item.icon}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="flex-1" />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left w-full"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-[10px] font-bold">
            L
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap">
            Logout
          </span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-20 relative min-h-screen flex flex-col">
        {/* Persistent Static Upper Right Logout Button */}
        <div className="absolute top-6 right-6 md:top-10 md:right-10 z-30">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 text-xs md:text-sm font-semibold border border-border bg-card text-foreground rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shadow-sm hover:shadow-md"
          >
            Logout
          </button>
        </div>
        <main className="flex-1 p-6 md:p-10 max-w-6xl w-full">{children}</main>
      </div>
    </div>
  );
}
