"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter } from "lucide-react";

const productLinks = [
  { name: "Dashboard", href: "/" },
  { name: "Practice Planner", href: "/practice" },
  { name: "Players", href: "/players" },
  { name: "Sessions", href: "/sessions" },
  { name: "Import Excel", href: "/import" },
  { name: "Match Scenarios", href: "/scenarios" },
  { name: "Field Placement", href: "/field" },
];

const resourceLinks = [
  { name: "Documentation", href: "#" },
  { name: "Changelog", href: "#" },
  { name: "Examples", href: "#" },
];

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-sidebar-border/80 bg-sidebar text-sidebar-foreground">
      {/* Gradient bar */}
      <div
        className="h-1 w-full shrink-0"
        style={{
          background:
            "linear-gradient(90deg, #0f172a 0%, #1e3a2f 20%, #166534 40%, #22c55e 50%, #166534 60%, #1e3a2f 80%, #0f172a 100%)",
        }}
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Branding */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-2 ring-primary/40">
                <Image
                  src="/logo.png"
                  alt=""
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </span>
              <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
                Cricket IQ Coach
              </span>
            </Link>
            <p className="mt-3 text-sm text-sidebar-foreground/75">
              Smarter practice planning and analytics for cricket coaches and
              players.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-sidebar-foreground/75">
              Product
            </h3>
            <ul className="mt-4 space-y-2">
              {productLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-sidebar-foreground/90 transition hover:text-sidebar-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-sidebar-foreground/75">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              {resourceLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-sidebar-foreground/90 transition hover:text-sidebar-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-sidebar-foreground/75">
              Connect
            </h3>
            <div className="mt-4 flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground transition hover:border-sidebar-primary/50 hover:text-sidebar-primary"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground transition hover:border-sidebar-primary/50 hover:text-sidebar-primary"
                aria-label="Twitter / X"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-3 text-sm text-sidebar-foreground/75">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sidebar-foreground/90 hover:text-sidebar-primary"
              >
                Star us on GitHub
              </a>
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-sidebar-border/80 pt-8 text-center text-sm text-sidebar-foreground/75">
          © {new Date().getFullYear()} Cricket IQ Coach. Built for coaches and
          players.
        </div>
      </div>
    </footer>
  );
}
