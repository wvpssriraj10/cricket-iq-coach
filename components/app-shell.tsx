"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AppSidebar } from "@/components/app-sidebar";
import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
<<<<<<< HEAD
      {/* Desktop sidebar — fixed so it stays in place when scrolling */}
      <div className="fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col lg:flex">
=======
      {/* Ambient background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
>>>>>>> origin/website-enhancement
        <AppSidebar />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 glass rounded-xl"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 border-r border-border/50 bg-sidebar">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <AppSidebar />
        </SheetContent>
      </Sheet>

<<<<<<< HEAD
      {/* Main content — offset by sidebar width on desktop so it doesn't sit under the fixed sidebar */}
      <main className="min-h-screen w-full flex-1 overflow-auto bg-gradient-to-b from-primary/[0.04] via-background to-background lg:ml-64">
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
=======
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 glass border-b border-border/50">
          <div className="flex h-16 items-center justify-between gap-4 px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="lg:hidden w-10 shrink-0" />
              <Link 
                href="/" 
                className="group relative block h-10 w-10 shrink-0 rounded-xl overflow-hidden ring-2 ring-primary/20 transition-all hover:ring-primary/40 hover:scale-105" 
                aria-label="Cricket IQ Coach home"
              >
                <span className="relative block h-full w-full">
                  <Image src="/logo.png" alt="" fill className="object-contain" priority sizes="40px" />
                </span>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
            
            {/* Header actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="sr-only">Notifications</span>
              </Button>
              <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-sm">
                CC
              </div>
>>>>>>> origin/website-enhancement
            </div>
          </div>
        </header>
        <div className="min-h-[calc(100vh-4rem)] p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
