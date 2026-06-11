"use client";

import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";

const GITHUB_REPO_URL = "https://github.com/wvpssriraj10/cricket-iq-coach";

const productLinks = [
  { name: "Dashboard", href: "/" },
  { name: "Practice Planner", href: "/practice" },
  { name: "Players", href: "/players" },
  { name: "Sessions", href: "/sessions" },
  { name: "Import Excel", href: "/import" },
  { name: "Match Scenarios", href: "/scenarios" },
  { name: "Field Placement", href: "/field" },
];

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-sidebar text-sidebar-foreground">
      <div className="h-1 w-full bg-gradient-to-r from-sidebar via-sidebar-primary/60 to-sidebar" />
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-sidebar-primary/30 to-sidebar-primary/10 ring-2 ring-sidebar-primary/30">
                <Image src="/logo.png" alt="" fill className="object-contain p-1" sizes="40px" />
              </span>
              <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
                Cricket IQ Coach
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/50">
              Smarter practice planning and analytics for cricket coaches and players.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/40">Product</h3>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-primary">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/40">Resources</h3>
            <ul className="mt-4 space-y-2.5">
              {["Documentation", "Changelog", "Examples"].map((name) => (
                <li key={name} className="text-sm text-sidebar-foreground/40">
                  {name} <span className="text-xs text-sidebar-foreground/30">(Soon)</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/40">Connect</h3>
            <div className="mt-4 flex gap-3">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground/60 shadow-sm transition-all hover:border-sidebar-primary/50 hover:bg-sidebar-primary/10 hover:text-sidebar-primary hover:shadow-md"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-sm text-sidebar-foreground/50">
              <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-sidebar-foreground/70 transition-colors hover:text-sidebar-primary">
                Star us on GitHub
              </a>
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-sidebar-border/40 pt-8 text-center text-sm text-sidebar-foreground/40">
          &copy; {new Date().getFullYear()} Cricket IQ Coach
        </div>
      </div>
    </footer>
  );
}
