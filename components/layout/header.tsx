"use client";

import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-12 bg-surface/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs tracking-[0.2em] text-text-muted uppercase">
          LTx OVERWATCH
        </span>
        <div className="h-4 w-px bg-border" />
        <span className="font-mono text-[10px] text-text-dim">
          DEMO // UNCLASSIFIED
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-elevated border border-border text-text-dim hover:text-foreground hover:border-border-hover transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span className="font-mono text-xs hidden sm:inline">Search</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background border border-border hidden sm:inline">
            ⌘K
          </kbd>
        </button>

        {/* Alerts */}
        <button className="relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-elevated transition-colors">
          <Bell className="w-4 h-4 text-text-dim" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-threat rounded-full animate-halo-pulse" />
        </button>

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent/5 border border-accent/20">
          <div className="w-2 h-2 rounded-full bg-accent animate-halo-pulse" />
          <span className="font-mono text-[10px] text-accent">LIVE</span>
        </div>
      </div>
    </header>
  );
}
