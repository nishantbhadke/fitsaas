"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "O" },
  { href: "/dashboard/workouts", label: "Workouts", icon: "W" },
  { href: "/dashboard/progress", label: "Progress", icon: "P" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <aside className="w-full md:w-64 bg-card border-r border-border p-6 flex flex-col gap-6 shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center font-bold text-sm">
            F
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-600"
                    : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-foreground/5 text-[10px] font-bold">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10 max-w-6xl w-full">{children}</main>
    </div>
  );
}
