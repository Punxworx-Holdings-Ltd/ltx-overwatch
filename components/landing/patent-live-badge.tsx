"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, X } from "lucide-react";

interface PatentClaim {
  id: number;
  shortTitle: string;
  fullClaim: string;
  feature: string;
}

const PATENT_CLAIMS: PatentClaim[] = [
  {
    id: 1,
    shortTitle: "GPS-to-Pixel Conversion",
    fullClaim:
      "The method of converting GPS coordinates to pixel positions within satellite imagery tiles using Web Mercator projection.",
    feature: "Entity appears at exact pixel position in satellite image",
  },
  {
    id: 2,
    shortTitle: "IoT-Satellite Compositing",
    fullClaim:
      "The method of compositing remote sensing images with IoT sensor data based on geolocation to create hybrid images.",
    feature: "IoT data rendered IN the imagery, not ON a map",
  },
  {
    id: 3,
    shortTitle: "Automated Satellite Tasking",
    fullClaim:
      "Automated satellite capture scheduling coordinated with ground IoT device data collection during the same time window.",
    feature: "Book a satellite capture synced with ground sensors",
  },
  {
    id: 4,
    shortTitle: "Geofence Breach Detection",
    fullClaim:
      "Geofence boundary monitoring and breach detection within composited satellite-IoT imagery using point-in-polygon analysis.",
    feature: "Security perimeters on satellite imagery with IoT alerts",
  },
];

/**
 * Floating patent badge — appears in bottom-right corner of the landing page.
 * Shows which patent claim protects what the user is currently seeing.
 * Expandable to reveal all 4 claims.
 */
export default function PatentLiveBadge() {
  const [expanded, setExpanded] = useState(false);
  const [activeClaim, setActiveClaim] = useState(0);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ width: 48, height: 48, borderRadius: 24 }}
            animate={{ width: 380, height: "auto", borderRadius: 16 }}
            exit={{ width: 48, height: 48, borderRadius: 24 }}
            className="bg-[#0A0A0A]/95 backdrop-blur-xl border border-[#00E5A0]/20 shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-[#00E5A0]" />
                  <span className="text-xs font-mono text-[#00E5A0] font-bold">
                    PATENT PROTECTED
                  </span>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="p-1 rounded hover:bg-white/10 text-gray-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="text-[10px] font-mono text-gray-500 mb-3">
                US 10,951,814 B2 — Every feature on this page is protected IP
              </div>

              {/* Claims */}
              <div className="space-y-2">
                {PATENT_CLAIMS.map((claim, i) => (
                  <button
                    key={claim.id}
                    onClick={() => setActiveClaim(i)}
                    className={`w-full text-left rounded-lg border p-3 transition-all ${
                      activeClaim === i
                        ? "border-[#00E5A0]/30 bg-[#00E5A0]/5"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                          activeClaim === i
                            ? "bg-[#00E5A0]/20 text-[#00E5A0]"
                            : "bg-white/5 text-gray-600"
                        }`}
                      >
                        {claim.id}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          activeClaim === i ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {claim.shortTitle}
                      </span>
                    </div>
                    {activeClaim === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                      >
                        <p className="text-[10px] text-gray-400 leading-relaxed mt-1 pl-7">
                          {claim.fullClaim}
                        </p>
                        <div className="mt-2 pl-7 text-[10px] font-mono text-[#00E5A0]/70">
                          Feature: {claim.feature}
                        </div>
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-3 text-[10px] text-gray-600 text-center font-mono">
                Granted: US, CN, JP, KR — Pending: EU, CA
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setExpanded(true)}
            className="w-12 h-12 rounded-full bg-[#0A0A0A]/90 backdrop-blur-xl border border-[#00E5A0]/30 flex items-center justify-center hover:border-[#00E5A0]/60 transition-all group shadow-lg shadow-black/50"
          >
            <Fingerprint className="w-5 h-5 text-[#00E5A0] group-hover:scale-110 transition-transform" />
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border border-[#00E5A0]/40"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
