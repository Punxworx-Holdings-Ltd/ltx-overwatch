"use client";

import { motion } from "framer-motion";
import { Shield, Globe, Lock, Check, X } from "lucide-react";

const jurisdictions = [
  { code: "US", name: "United States", status: "granted" as const, patent: "US 10,951,814 B2", detail: "World's largest defence market" },
  { code: "CN", name: "China", status: "granted" as const, patent: "Granted", detail: "Largest IoT market (1.4B population)" },
  { code: "JP", name: "Japan", status: "granted" as const, patent: "Granted", detail: "Leading sensor & robotics market" },
  { code: "KR", name: "South Korea", status: "granted" as const, patent: "Granted", detail: "Samsung, LG, Hyundai IoT ecosystems" },
  { code: "EU", name: "European Union", status: "pending" as const, patent: "EP3900321A1", detail: "450M population, ESA partnerships" },
  { code: "CA", name: "Canada", status: "pending" as const, patent: "CA3122197A1", detail: "Five Eyes intelligence alliance" },
  { code: "WIPO", name: "International", status: "pending" as const, patent: "WO2020128440A1", detail: "Global protection framework" },
];

const competitors = [
  { name: "Planet", imagery: true, iotDisplay: "On map", fusion: false, identify: false, gpsPixel: false, canBuild: false },
  { name: "Maxar", imagery: true, iotDisplay: "On map", fusion: false, identify: false, gpsPixel: false, canBuild: false },
  { name: "BlackSky", imagery: true, iotDisplay: "On map", fusion: false, identify: false, gpsPixel: false, canBuild: false },
  { name: "Palantir", imagery: false, iotDisplay: "Dashboard", fusion: false, identify: false, gpsPixel: false, canBuild: false },
];

const patentClaims = [
  {
    title: "IoT Data at Precise Pixel Coordinates Within Satellite Imagery",
    description: "No competitor can merge IoT data INTO satellite images. Google, Maxar, Planet can show you a map with pins. They CANNOT composite IoT data at the exact pixel location within a satellite tile.",
  },
  {
    title: "Automated Satellite Capture Coordinated with Ground IoT Devices",
    description: "The patent covers scheduling a satellite capture while simultaneously collecting IoT data from ground devices during the same window, then compositing both together.",
  },
  {
    title: "Geofence Breach Detection Within Composited Imagery",
    description: "Drawing a boundary on satellite imagery and triggering alerts when IoT-tracked entities cross it within the composited view is protected.",
  },
  {
    title: "Methodology-Based Protection (Not Software-Based)",
    description: "The METHOD of doing this is protected regardless of tech stack. You cannot work around it by using different programming languages or cloud providers.",
  },
];

export function PatentFortress() {
  return (
    <section id="patent" className="py-24 px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-accent" />
            <span className="font-mono text-sm tracking-widest text-accent uppercase">
              Patent Protected
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            The Only Platform That Can Do This.{" "}
            <span className="text-accent">Legally.</span>
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Space Aye holds the world&apos;s only granted patents for merging IoT
            data with real-time satellite imagery. This isn&apos;t a feature
            competitors can copy &mdash; it&apos;s a protected methodology across
            the world&apos;s largest markets.
          </p>
        </motion.div>

        {/* Patent jurisdictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-4 h-4 text-intel" />
            <h3 className="font-mono text-sm tracking-widest text-text-muted uppercase">
              Global Patent Coverage
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {jurisdictions.map((j) => (
              <div
                key={j.code}
                className={`relative p-4 rounded-lg border ${
                  j.status === "granted"
                    ? "border-accent/30 bg-accent/5"
                    : "border-border bg-elevated"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold tracking-wider text-foreground">
                    {j.code}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      j.status === "granted"
                        ? "bg-accent/20 text-accent"
                        : "bg-warning/20 text-warning"
                    }`}
                  >
                    {j.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {j.name}
                </p>
                <p className="text-xs text-text-dim">{j.detail}</p>
                <p className="font-mono text-[10px] text-text-dim mt-2">
                  {j.patent}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Competitor comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-threat" />
            <h3 className="font-mono text-sm tracking-widest text-text-muted uppercase">
              What Competitors Cannot Do
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-mono text-xs text-text-dim uppercase tracking-wider">
                    Capability
                  </th>
                  {competitors.map((c) => (
                    <th
                      key={c.name}
                      className="text-center py-3 px-4 font-mono text-xs text-text-dim uppercase tracking-wider"
                    >
                      {c.name}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-mono text-xs text-accent uppercase tracking-wider">
                    LTx OVERWATCH
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">Satellite imagery</td>
                  {competitors.map((c) => (
                    <td key={c.name} className="text-center py-3 px-4">
                      {c.imagery ? (
                        <Check className="w-4 h-4 text-friendly mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-text-dim mx-auto" />
                      )}
                    </td>
                  ))}
                  <td className="text-center py-3 px-4">
                    <Check className="w-4 h-4 text-accent mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">IoT data display</td>
                  {competitors.map((c) => (
                    <td key={c.name} className="text-center py-3 px-4 text-text-dim">
                      {c.iotDisplay}
                    </td>
                  ))}
                  <td className="text-center py-3 px-4 text-accent font-bold">
                    IN the image
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">
                    Real-time IoT fusion
                  </td>
                  {competitors.map((c) => (
                    <td key={c.name} className="text-center py-3 px-4">
                      <X className="w-4 h-4 text-text-dim mx-auto" />
                    </td>
                  ))}
                  <td className="text-center py-3 px-4 text-accent font-bold">
                    PATENTED
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">
                    GPS-to-pixel compositing
                  </td>
                  {competitors.map((c) => (
                    <td key={c.name} className="text-center py-3 px-4">
                      <X className="w-4 h-4 text-text-dim mx-auto" />
                    </td>
                  ))}
                  <td className="text-center py-3 px-4 text-accent font-bold">
                    PATENTED
                  </td>
                </tr>
                <tr className="border-b border-border/50 bg-threat/5">
                  <td className="py-3 px-4 text-foreground font-bold">
                    Can legally build this?
                  </td>
                  {competitors.map((c) => (
                    <td key={c.name} className="text-center py-3 px-4">
                      <span className="text-threat font-bold">NO</span>
                    </td>
                  ))}
                  <td className="text-center py-3 px-4">
                    <span className="text-accent font-bold">
                      YES — PATENT HOLDER
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Patent claims in plain English */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-mono text-sm tracking-widest text-text-muted uppercase mb-6">
            What the Patent Protects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patentClaims.map((claim, i) => (
              <div
                key={i}
                className="p-5 rounded-lg border border-border bg-elevated hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded bg-accent/10 flex items-center justify-center mt-0.5">
                    <span className="font-mono text-xs text-accent font-bold">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-2">
                      {claim.title}
                    </h4>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {claim.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom callout */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="font-mono text-sm text-accent">
            10,000+ new EO satellites by 2030. 32 billion IoT devices. Only one
            patent connects them.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
