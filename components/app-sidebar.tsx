"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Map,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  ListTodo,
  Shield,
  BarChart,
  LogOut,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/auth-provider";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Profile", href: "/profile", icon: UserCircle },
  { name: "Practice Planner", href: "/practice", icon: ListTodo },
  { name: "Players", href: "/players", icon: Users },
  { name: "Teams", href: "/teams", icon: Shield },
  { name: "Compare", href: "/compare", icon: BarChart },
  { name: "Sessions", href: "/sessions", icon: CalendarCheck },
  { name: "Import Data", href: "/import", icon: FileSpreadsheet, coachOnly: true },
  { name: "Match Scenarios", href: "/scenarios", icon: Target },
  { name: "Field Placement", href: "/field", icon: Map },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const isPlayer = profile?.role === 'player';

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <aside className="flex h-full min-h-screen w-64 flex-col bg-sidebar shadow-2xl">
      <div className="relative px-5 pt-6 pb-4">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sidebar-primary/50 to-transparent" />
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sidebar-primary/30 to-sidebar-primary/10 shadow-lg ring-2 ring-sidebar-primary/30">
            <Image src="/logo.png" alt="" fill className="object-contain p-1.5" priority sizes="44px" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-sidebar-foreground">Cricket IQ</h1>
            <p className="text-[11px] text-sidebar-foreground/45 font-medium tracking-wide uppercase">{isPlayer ? 'Player Portal' : 'Coach Analytics'}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/30">Menu</p>
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            if (item.coachOnly && isPlayer) return null;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-sidebar-primary/20 to-sidebar-primary/5 text-sidebar-foreground shadow-sm ring-1 ring-sidebar-primary/20"
                      : "text-sidebar-foreground/55 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/30"
                      : "bg-sidebar-accent/40 text-sidebar-foreground/50 group-hover:bg-sidebar-accent group-hover:text-sidebar-foreground"
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary ring-2 ring-sidebar-primary/30" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border/40 px-4 py-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-sidebar-accent/50 px-3 py-2.5 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary/30 to-sidebar-primary/10 text-sidebar-primary shadow-inner">
            <UserCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.email || 'User'}</p>
            <p className="text-[11px] font-medium capitalize text-sidebar-foreground/50">{profile?.role || 'Guest'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/45 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
