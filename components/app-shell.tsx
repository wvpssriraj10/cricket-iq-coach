"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AppSidebar } from "@/components/app-sidebar";
import { Menu } from "lucide-react";
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

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gradient-to-b from-muted/30 to-background">
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex h-16 items-center gap-4 px-6 lg:px-8">
            <div className="lg:hidden w-10 shrink-0" />
            <Link href="/" className="block h-9 w-9 shrink-0 rounded-lg overflow-hidden" aria-label="Cricket IQ Coach home">
              <span className="relative block h-full w-full">
                <Image src="/logo.png" alt="" fill className="object-contain" priority sizes="36px" />
              </span>
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </header>
        <div className="min-h-[calc(100vh-4rem)] p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
