"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppSidebar } from "@/components/app-sidebar";
import { AppFooter } from "@/components/app-footer";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden lg:flex">
        <AppSidebar />
      </div>

      {mounted ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <AppSidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40 lg:hidden" aria-label="Open menu" type="button">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      )}

      <main className="flex min-h-screen w-full flex-1 flex-col overflow-auto lg:ml-64">
        <header
          className={cn(
            "sticky top-0 z-20 transition-all duration-300",
            scrolled
              ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm"
              : "bg-transparent"
          )}
        >
          <div className="flex h-16 items-center gap-4 px-6 lg:px-8">
            <div className="lg:hidden w-10 shrink-0" />
            <Link href="/" className="block h-9 w-9 shrink-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-border/50 transition-all hover:scale-105 hover:shadow-md hover:ring-primary/40" aria-label="Cricket IQ Coach home">
              <span className="relative block h-full w-full">
                <Image src="/logo.png" alt="" fill className="object-contain" priority sizes="36px" />
              </span>
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
              {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 lg:p-8">{children}</div>
        <AppFooter />
      </main>
    </div>
  );
}
