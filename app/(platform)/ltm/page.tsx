"use client";

import { Brain } from "lucide-react";

export default function LtmPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-2 flex items-center gap-2">
          <Brain className="w-4 h-4 text-accent" />
          Large Terrestrial Model
        </h1>
        <p className="text-sm text-text-muted">
          AI-powered analysis combining verified satellite and IoT data for
          decision intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border border-border bg-elevated">
          <h2 className="font-mono text-sm font-bold text-foreground mb-4">
            Object Detection
          </h2>
          <div className="h-48 rounded-lg bg-background border border-border flex items-center justify-center">
            <span className="font-mono text-xs text-text-dim">
              AI DETECTION OVERLAY — Phase 8
            </span>
          </div>
        </div>
        <div className="p-6 rounded-lg border border-border bg-elevated">
          <h2 className="font-mono text-sm font-bold text-foreground mb-4">
            Change Detection
          </h2>
          <div className="h-48 rounded-lg bg-background border border-border flex items-center justify-center">
            <span className="font-mono text-xs text-text-dim">
              TEMPORAL COMPARISON — Phase 8
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
