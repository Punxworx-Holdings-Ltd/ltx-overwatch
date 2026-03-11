"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Leaf,
  Siren,
  Anchor,
  PawPrint,
  Droplets,
} from "lucide-react";
import Link from "next/link";
import { SCENARIOS } from "@/lib/utils/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Leaf,
  Siren,
  Anchor,
  PawPrint,
  Droplets,
};

export function SectorCards() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="font-mono text-sm tracking-widest text-accent uppercase block mb-4">
            Sector Demonstrations
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Six Industries. One Patent. Infinite Possibilities.
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Each scenario demonstrates the patent&apos;s value with real satellite
            imagery and live IoT data fusion. Select a sector to see the
            technology in action.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCENARIOS.map((scenario, i) => {
            const Icon = iconMap[scenario.icon];
            return (
              <motion.div
                key={scenario.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/scenarios/${scenario.slug}`}
                  className="group block p-6 rounded-lg border border-border bg-elevated hover:border-accent/40 hover:bg-accent/5 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {Icon && (
                      <Icon className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                    )}
                    <span className="font-mono text-[10px] tracking-widest text-text-dim uppercase">
                      {scenario.sector}
                    </span>
                  </div>
                  <h3 className="font-mono text-lg font-bold text-foreground mb-2 tracking-wide">
                    {scenario.name}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {scenario.description}
                  </p>
                  <div className="mt-4 font-mono text-[10px] text-text-dim">
                    {scenario.center[1].toFixed(2)}°N,{" "}
                    {scenario.center[0].toFixed(2)}°E
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
