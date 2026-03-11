"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Scan, Flame, Monitor, Tv, ChevronDown } from "lucide-react";

export type VisualMode =
  | "standard"
  | "flir"
  | "nightvision"
  | "crt"
  | "enhanced";

interface VisualModeConfig {
  id: VisualMode;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  description: string;
  filter: string;
  overlay?: string;
}

export const VISUAL_MODES: VisualModeConfig[] = [
  {
    id: "standard",
    label: "STANDARD",
    shortLabel: "STD",
    icon: <Eye className="w-3.5 h-3.5" />,
    description: "Natural satellite imagery — no post-processing",
    filter: "none",
  },
  {
    id: "flir",
    label: "FLIR THERMAL",
    shortLabel: "FLIR",
    icon: <Flame className="w-3.5 h-3.5" />,
    description: "Forward-looking infrared — heat signature detection",
    filter:
      "saturate(0) contrast(1.4) brightness(0.9) sepia(1) hue-rotate(-30deg) saturate(2.5)",
    overlay: "flir",
  },
  {
    id: "nightvision",
    label: "NIGHT VISION",
    shortLabel: "NVG",
    icon: <Scan className="w-3.5 h-3.5" />,
    description: "Image intensifier — low-light amplification",
    filter: "saturate(0) brightness(1.5) contrast(1.3)",
    overlay: "nvg",
  },
  {
    id: "crt",
    label: "CRT DISPLAY",
    shortLabel: "CRT",
    icon: <Monitor className="w-3.5 h-3.5" />,
    description: "Cathode ray tube — legacy command centre display",
    filter: "saturate(0.6) contrast(1.1) brightness(0.95)",
    overlay: "crt",
  },
  {
    id: "enhanced",
    label: "ENHANCED IR",
    shortLabel: "EIR",
    icon: <Tv className="w-3.5 h-3.5" />,
    description: "Enhanced infrared composite — structural analysis",
    filter:
      "saturate(0) contrast(1.6) brightness(0.85) sepia(0.5) hue-rotate(180deg) saturate(1.5)",
    overlay: "enhanced",
  },
];

export function getVisualModeConfig(mode: VisualMode): VisualModeConfig {
  return VISUAL_MODES.find((m) => m.id === mode) ?? VISUAL_MODES[0];
}

/**
 * Visual mode selector component — military display mode picker
 */
export function VisualModeSelector({
  activeMode,
  onModeChange,
  compact = false,
}: {
  activeMode: VisualMode;
  onModeChange: (mode: VisualMode) => void;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const current = getVisualModeConfig(activeMode);

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border hover:border-accent/30 transition-all"
        >
          <span
            className={`${activeMode === "flir" ? "text-orange-400" : activeMode === "nightvision" ? "text-green-400" : activeMode === "crt" ? "text-amber-400" : activeMode === "enhanced" ? "text-cyan-400" : "text-accent"}`}
          >
            {current.icon}
          </span>
          <span className="font-mono text-[10px] text-foreground tracking-wider">
            {current.shortLabel}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-text-dim transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute top-full mt-1 right-0 z-50 w-56 rounded-lg bg-background/95 backdrop-blur-md border border-border shadow-2xl overflow-hidden"
            >
              {VISUAL_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    onModeChange(mode.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all ${
                    activeMode === mode.id
                      ? "bg-accent/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`${mode.id === "flir" ? "text-orange-400" : mode.id === "nightvision" ? "text-green-400" : mode.id === "crt" ? "text-amber-400" : mode.id === "enhanced" ? "text-cyan-400" : "text-accent"}`}
                  >
                    {mode.icon}
                  </span>
                  <div>
                    <div className="font-mono text-[10px] font-bold text-foreground tracking-wider">
                      {mode.label}
                    </div>
                    <div className="font-mono text-[9px] text-text-dim">
                      {mode.description}
                    </div>
                  </div>
                  {activeMode === mode.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full layout — horizontal button row
  return (
    <div className="flex items-center gap-1">
      {VISUAL_MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          title={mode.description}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all ${
            activeMode === mode.id
              ? "bg-accent/10 border border-accent/30 text-accent"
              : "bg-white/5 border border-white/5 text-text-dim hover:text-foreground hover:border-white/10"
          }`}
        >
          <span
            className={`${mode.id === "flir" ? "text-orange-400" : mode.id === "nightvision" ? "text-green-400" : mode.id === "crt" ? "text-amber-400" : mode.id === "enhanced" ? "text-cyan-400" : ""}`}
          >
            {mode.icon}
          </span>
          {mode.shortLabel}
        </button>
      ))}
    </div>
  );
}

/**
 * Visual mode overlay — renders CSS filters + SVG overlays on a map container
 * Wrap your map in this component for post-processing effects
 */
export function VisualModeOverlay({
  mode,
  children,
}: {
  mode: VisualMode;
  children: React.ReactNode;
}) {
  const config = getVisualModeConfig(mode);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* SVG filter definitions */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          {/* Night vision green phosphor effect */}
          <filter id="nvg-filter">
            <feColorMatrix
              type="matrix"
              values="0.1 0.5 0.1 0 0
                      0.1 0.8 0.1 0 0.05
                      0.0 0.2 0.0 0 0
                      0   0   0   1 0"
            />
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.2" />
              <feFuncG type="linear" slope="1.5" />
              <feFuncB type="linear" slope="0.6" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* Map content with CSS filter applied */}
      <div
        className="w-full h-full"
        style={{
          filter:
            mode === "nightvision"
              ? "url(#nvg-filter) contrast(1.2)"
              : config.filter,
        }}
      >
        {children}
      </div>

      {/* FLIR targeting overlay */}
      {mode === "flir" && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Corner brackets */}
          <div className="absolute top-[10%] left-[10%] w-12 h-12 border-l-2 border-t-2 border-orange-400/60" />
          <div className="absolute top-[10%] right-[10%] w-12 h-12 border-r-2 border-t-2 border-orange-400/60" />
          <div className="absolute bottom-[10%] left-[10%] w-12 h-12 border-l-2 border-b-2 border-orange-400/60" />
          <div className="absolute bottom-[10%] right-[10%] w-12 h-12 border-r-2 border-b-2 border-orange-400/60" />
          {/* Centre crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-px h-8 bg-orange-400/40 absolute left-1/2 -top-10" />
            <div className="w-px h-8 bg-orange-400/40 absolute left-1/2 top-2" />
            <div className="h-px w-8 bg-orange-400/40 absolute top-1/2 -left-10" />
            <div className="h-px w-8 bg-orange-400/40 absolute top-1/2 left-2" />
            <div className="w-4 h-4 rounded-full border border-orange-400/50 absolute -top-2 -left-2" />
          </div>
          {/* FLIR readout */}
          <div className="absolute top-3 right-3 font-mono text-[10px] text-orange-400/80 text-right">
            <div>FLIR MODE</div>
            <div className="text-[9px] opacity-60">WFOV 40° x 30°</div>
            <div className="text-[9px] opacity-60">8-14μm LWIR</div>
          </div>
          {/* Temperature scale */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            <span className="font-mono text-[8px] text-orange-200/60">
              45°C
            </span>
            <div
              className="w-2 h-32 rounded-full"
              style={{
                background:
                  "linear-gradient(to bottom, #fff, #ff8c00, #ff4500, #8b0000, #1a0a0a)",
              }}
            />
            <span className="font-mono text-[8px] text-orange-200/40">
              -10°C
            </span>
          </div>
          {/* Subtle vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
            }}
          />
        </div>
      )}

      {/* Night Vision overlay */}
      {mode === "nightvision" && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Green phosphor vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(0,20,0,0.6) 100%)",
            }}
          />
          {/* Noise grain */}
          <div
            className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
            }}
          />
          {/* NVG readout */}
          <div className="absolute top-3 left-3 font-mono text-[10px] text-green-400/80">
            <div>NVG GEN III</div>
            <div className="text-[9px] opacity-60">GAIN: AUTO</div>
            <div className="text-[9px] opacity-60">FOM: 2000+</div>
          </div>
          {/* Circular vignette (tube effect) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, transparent 35%, rgba(0,10,0,0.3) 60%, rgba(0,5,0,0.8) 90%)",
            }}
          />
        </div>
      )}

      {/* CRT scan lines overlay */}
      {mode === "crt" && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Horizontal scan lines */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)",
              backgroundSize: "100% 4px",
            }}
          />
          {/* Slight RGB offset */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,0,0,0.3) 0px, rgba(0,255,0,0.3) 1px, rgba(0,100,255,0.3) 2px, transparent 3px)",
              backgroundSize: "3px 100%",
            }}
          />
          {/* CRT curvature vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)",
            }}
          />
          {/* Phosphor glow */}
          <div className="absolute inset-0 bg-amber-500/[0.02]" />
          {/* CRT label */}
          <div className="absolute bottom-3 right-3 font-mono text-[10px] text-amber-400/60">
            <div>CRT-2600 DISPLAY</div>
            <div className="text-[9px] opacity-60">1280x1024 @ 60Hz</div>
          </div>
          {/* Animated scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-white/[0.03]"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Enhanced IR overlay */}
      {mode === "enhanced" && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Cool-tone vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 50%, rgba(0,10,30,0.4) 100%)",
            }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,200,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.4) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          {/* EIR label */}
          <div className="absolute top-3 right-3 font-mono text-[10px] text-cyan-400/80 text-right">
            <div>ENHANCED IR</div>
            <div className="text-[9px] opacity-60">3-5μm MWIR</div>
            <div className="text-[9px] opacity-60">COMPOSITE VIEW</div>
          </div>
        </div>
      )}
    </div>
  );
}
