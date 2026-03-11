"use client";

import { Satellite, Clock, MapPin } from "lucide-react";

export default function TaskingPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-2">
          Satellite Tasking
        </h1>
        <p className="text-sm text-text-muted">
          Schedule satellite image captures as easily as booking a rideshare.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking form */}
        <div className="p-6 rounded-lg border border-border bg-elevated">
          <h2 className="font-mono text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Satellite className="w-4 h-4 text-accent" />
            Book a Capture
          </h2>
          <div className="space-y-4">
            <div>
              <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider block mb-1">
                Target Location
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-background border border-border">
                <MapPin className="w-4 h-4 text-text-dim" />
                <span className="font-mono text-sm text-text-muted">
                  Click map to select or enter coordinates
                </span>
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider block mb-1">
                Capture Window
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-background border border-border">
                <Clock className="w-4 h-4 text-text-dim" />
                <span className="font-mono text-sm text-text-muted">
                  Next available: 2026-03-12 14:23 UTC
                </span>
              </div>
            </div>
            <button className="w-full py-3 bg-accent text-background font-mono text-sm font-bold rounded-lg hover:bg-accent-dim transition-colors">
              REQUEST CAPTURE
            </button>
          </div>
        </div>

        {/* Orbit tracker placeholder */}
        <div className="p-6 rounded-lg border border-border bg-elevated">
          <h2 className="font-mono text-sm font-bold text-foreground mb-4">
            Satellite Constellation
          </h2>
          <div className="h-64 rounded-lg bg-background border border-border flex items-center justify-center">
            <span className="font-mono text-xs text-text-dim">
              ORBIT TRACKER — Phase 8
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
