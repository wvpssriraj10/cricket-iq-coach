"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppSidebar } from "@/components/app-sidebar";
import { AppFooter } from "@/components/app-footer";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar — fixed to viewport so it never moves when scrolling */}
      <div className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col overflow-hidden lg:flex">
        <AppSidebar />
      </div>

      {/* Mobile sidebar — only render Sheet after mount to avoid Radix ID hydration mismatch */}
      {mounted ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-40"
            >
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
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-40 lg:hidden"
          aria-label="Open menu"
          type="button"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      )}

      {/* Main content — offset by sidebar width on desktop so it doesn't sit under the fixed sidebar */}
      <main className="flex min-h-screen w-full flex-1 flex-col overflow-auto bg-gradient-to-b from-primary/[0.04] via-background to-background lg:ml-64">
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/85">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" aria-hidden />
          <div className="relative flex h-16 items-center gap-4 px-6 lg:px-8">
            <div className="lg:hidden w-10 shrink-0" />
            <Link href="/" className="block h-9 w-9 shrink-0 rounded-xl overflow-hidden ring-1 ring-border/50 shadow-sm transition hover:ring-primary/30 hover:shadow" aria-label="Cricket IQ Coach home">
              <span className="relative block h-full w-full">
                <Image src="/logo.png" alt="" fill className="object-contain" priority sizes="36px" />
              </span>
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </header>
        <div className="min-h-[calc(100vh-4rem)] flex-1 p-6 lg:p-8">{children}</div>
        <AppFooter />
      </main>
    </div>
  );
}
