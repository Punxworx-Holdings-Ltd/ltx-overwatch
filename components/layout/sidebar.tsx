"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Satellite,
  Monitor,
  Map,
  Radio,
  Layers,
  Bell,
  Brain,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/command", label: "Command", icon: Monitor },
  { href: "/scenarios", label: "Scenarios", icon: Map },
  { href: "/tasking", label: "Tasking", icon: Radio },
  { href: "/spectrum", label: "Spectrum", icon: Layers },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/ltm", label: "LTM", icon: Brain },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-[22px] bottom-[22px] w-16 bg-surface border-r border-border flex flex-col items-center py-4 z-40">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors mb-6"
      >
        <Satellite className="w-5 h-5 text-accent" />
      </Link>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors group",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-text-dim hover:text-foreground hover:bg-elevated"
              )}
            >
              <item.icon className="w-5 h-5" />
              {/* Tooltip */}
              <div className="absolute left-14 px-2 py-1 bg-elevated border border-border rounded text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                {item.label}
              </div>
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[1px] w-[2px] h-5 bg-accent rounded-r" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Home link */}
      <Link
        href="/"
        className="flex items-center justify-center w-10 h-10 rounded-lg text-text-dim hover:text-foreground hover:bg-elevated transition-colors"
      >
        <Home className="w-5 h-5" />
      </Link>
    </aside>
  );
}
