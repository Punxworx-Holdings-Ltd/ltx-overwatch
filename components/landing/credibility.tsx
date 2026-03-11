"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "4th", label: "Most Influential Space Entrepreneur Globally (2021)" },
  { value: "4", label: "Countries with Granted Patents (US, CN, JP, KR)" },
  { value: "2039", label: "Patent Protection Active Until" },
  { value: "32B", label: "IoT Devices by 2030 — Only One Patent Connects Them to Space" },
];

const memberships = [
  "UKspace Member",
  "ADS Group Member",
  "The Washington Compact",
  "Airbus Partnership",
  "Computing Top 100 IT Leaders",
];

export function Credibility() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-lg border border-border bg-elevated"
            >
              <div className="font-mono text-3xl sm:text-4xl font-bold text-accent mb-2">
                {stat.value}
              </div>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Memberships */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {memberships.map((m) => (
            <span
              key={m}
              className="px-4 py-2 rounded-full border border-border font-mono text-xs text-text-dim"
            >
              {m}
            </span>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="font-mono text-xs text-text-dim mb-1">
            Founded by Chris Newlands &middot; Glasgow, Scotland
          </p>
          <p className="font-mono text-xs text-text-dim">
            From Spelfie (2017) &rarr; US Patent (2021) &rarr; Global Grants
            (2022-24) &rarr; LTx OVERWATCH (2026)
          </p>
        </motion.div>
      </div>

      {/* Bottom classification banner */}
      <div className="classification-banner mt-24">
        DEMO // UNCLASSIFIED // LTx OVERWATCH // SPACE AYE
      </div>
    </section>
  );
}
