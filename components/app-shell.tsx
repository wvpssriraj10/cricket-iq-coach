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
      {/* Ambient background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
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
            </div>
          </div>
        </header>
        <div className="min-h-[calc(100vh-4rem)] p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
