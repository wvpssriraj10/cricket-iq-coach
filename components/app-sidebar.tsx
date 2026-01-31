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
  ChevronRight,
  Sparkles,
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
<<<<<<< HEAD
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl">
      <div className="relative flex h-16 items-center gap-3 border-b border-sidebar-border/80 px-6">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sidebar-primary to-sidebar-primary/60" aria-hidden />
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-2 ring-sidebar-primary/40 shadow-lg">
=======
    <aside className="flex h-screen w-72 flex-col bg-sidebar border-r border-sidebar-border/50">
      {/* Logo section with gradient accent */}
      <div className="relative flex h-20 items-center gap-3 px-6">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl ring-2 ring-primary/20 glow-sm">
>>>>>>> origin/website-enhancement
          <Image
            src="/logo.png"
            alt="Cricket IQ Coach"
            fill
            className="object-contain"
            priority
            sizes="48px"
          />
        </div>
        <div className="min-w-0">
<<<<<<< HEAD
          <h1 className="text-base font-bold tracking-tight">Cricket IQ</h1>
          <p className="text-xs text-sidebar-foreground/75">Coach Analytics</p>
=======
          <h1 className="text-lg font-bold tracking-tight text-gradient">Cricket IQ</h1>
          <p className="text-xs text-sidebar-foreground/60 font-medium">Coach Analytics</p>
>>>>>>> origin/website-enhancement
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-3 px-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Main Menu
          </span>
        </div>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300",
                    isActive
<<<<<<< HEAD
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md ring-1 ring-sidebar-border/50"
                      : "text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
=======
                      ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
>>>>>>> origin/website-enhancement
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary glow-sm" />
                  )}
                  <span className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "bg-sidebar-accent/30 text-sidebar-foreground/60 group-hover:bg-sidebar-accent/50 group-hover:text-sidebar-foreground"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">{item.name}</span>
                  <ChevronRight className={cn(
                    "h-4 w-4 opacity-0 transition-all duration-300",
                    isActive ? "opacity-100 text-primary" : "group-hover:opacity-50"
                  )} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

<<<<<<< HEAD
      <div className="border-t border-sidebar-border/80 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/40 px-3 py-2.5 ring-1 ring-sidebar-border/50 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-inner">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Team Squad</p>
            <p className="text-xs text-sidebar-foreground/75">12 Players</p>
=======
      {/* Pro upgrade card */}
      <div className="p-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 p-4">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Upgrade to Pro</h3>
            <p className="text-xs text-muted-foreground mb-3">Unlock advanced analytics and AI insights</p>
            <button className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* Team info */}
      <div className="border-t border-sidebar-border/50 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/30 px-3 py-3 transition-colors hover:bg-sidebar-accent/50 cursor-pointer">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Users className="h-5 w-5 text-primary-foreground" />
>>>>>>> origin/website-enhancement
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-sidebar-foreground">Team Squad</p>
            <p className="text-xs text-sidebar-foreground/60">12 Active Players</p>
          </div>
          <ChevronRight className="h-4 w-4 text-sidebar-foreground/40" />
        </div>
      </div>
    </aside>
  );
}
