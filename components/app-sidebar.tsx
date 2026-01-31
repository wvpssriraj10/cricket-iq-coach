"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Map,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Practice Planner", href: "/practice", icon: ListTodo },
  { name: "Players", href: "/players", icon: Users },
  { name: "Sessions", href: "/sessions", icon: CalendarCheck },
  { name: "Import Excel", href: "/import", icon: FileSpreadsheet },
  { name: "Match Scenarios", href: "/scenarios", icon: Target },
  { name: "Field Placement", href: "/field", icon: Map },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground shadow-lg">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border/80 px-6">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl shadow-md">
          <Image
            src="/logo.png"
            alt="Cricket IQ Coach"
            fill
            className="object-contain"
            priority
            sizes="40px"
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-semibold tracking-tight">Cricket IQ</h1>
          <p className="text-xs text-sidebar-foreground/70">Coach Analytics</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border/80 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/30 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Team Squad</p>
            <p className="text-xs text-sidebar-foreground/70">12 Players</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
