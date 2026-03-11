"use client";

import { SCENARIOS } from "@/lib/utils/constants";
import {
  Shield,
  Leaf,
  Siren,
  Anchor,
  PawPrint,
  Droplets,
} from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Leaf,
  Siren,
  Anchor,
  PawPrint,
  Droplets,
};

export default function ScenariosPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-mono text-xs tracking-widest text-text-dim uppercase mb-2">
          Sector Demonstrations
        </h1>
        <p className="text-sm text-text-muted">
          Select a scenario to view live IoT data fused with satellite imagery.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCENARIOS.map((scenario) => {
          const Icon = iconMap[scenario.icon];
          return (
            <Link
              key={scenario.slug}
              href={`/scenarios/${scenario.slug}`}
              className="group p-6 rounded-lg border border-border bg-elevated hover:border-accent/40 hover:bg-accent/5 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                {Icon && (
                  <Icon className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                )}
                <span className="font-mono text-[10px] tracking-widest text-text-dim uppercase">
                  {scenario.sector}
                </span>
              </div>
              <h2 className="font-mono text-lg font-bold text-foreground mb-2 tracking-wide">
                {scenario.name}
              </h2>
              <p className="text-sm text-text-muted leading-relaxed mb-4">
                {scenario.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-text-dim">
                  {scenario.center[1].toFixed(2)}°N,{" "}
                  {Math.abs(scenario.center[0]).toFixed(2)}°
                  {scenario.center[0] >= 0 ? "E" : "W"}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-halo-pulse" />
                  <span className="font-mono text-[10px] text-accent">
                    LIVE
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
