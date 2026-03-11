"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Shield,
  AlertTriangle,
  Radio,
  MapPin,
  Eye,
  Zap,
} from "lucide-react";

interface WalkthroughStep {
  id: number;
  time: number; // seconds into the walkthrough
  title: string;
  description: string;
  patentClaim: string;
  icon: React.ReactNode;
  mapState: {
    entityX: number; // % position on map
    entityY: number;
    geofenceVisible: boolean;
    breached: boolean;
    alertFired: boolean;
    haloColor: string;
  };
}

const STEPS: WalkthroughStep[] = [
  {
    id: 1,
    time: 0,
    title: "Satellite imagery loads",
    description:
      "Real Sentinel-2 satellite tiles rendered via Mapbox. This is the base layer — what the world sees.",
    patentClaim: "Tier 1: Satellite Base Layer",
    icon: <Eye className="w-4 h-4" />,
    mapState: {
      entityX: 20,
      entityY: 70,
      geofenceVisible: false,
      breached: false,
      alertFired: false,
      haloColor: "#00E5A0",
    },
  },
  {
    id: 2,
    time: 4,
    title: "IoT device detected",
    description:
      "GPS tracker transmits coordinates. Our engine converts GPS to exact pixel position WITHIN the satellite tile.",
    patentClaim: "Patent Claim: GPS-to-pixel coordinate conversion",
    icon: <Radio className="w-4 h-4" />,
    mapState: {
      entityX: 20,
      entityY: 70,
      geofenceVisible: false,
      breached: false,
      alertFired: false,
      haloColor: "#00E5A0",
    },
  },
  {
    id: 3,
    time: 8,
    title: "Entity fused INTO imagery",
    description:
      "The entity appears at its exact position IN the satellite image with a pulsing halo. Not a pin on a map — fused data.",
    patentClaim:
      "Patent Claim: Hybrid image generation — compositing IoT INTO imagery",
    icon: <Zap className="w-4 h-4" />,
    mapState: {
      entityX: 30,
      entityY: 60,
      geofenceVisible: false,
      breached: false,
      alertFired: false,
      haloColor: "#00E5A0",
    },
  },
  {
    id: 4,
    time: 12,
    title: "Geofence drawn from space",
    description:
      "An exclusion zone is defined on the satellite imagery. The geofence boundary renders as a protective perimeter.",
    patentClaim:
      "Patent Claim: Geofence breach detection within composited imagery",
    icon: <Shield className="w-4 h-4" />,
    mapState: {
      entityX: 40,
      entityY: 50,
      geofenceVisible: true,
      breached: false,
      alertFired: false,
      haloColor: "#00E5A0",
    },
  },
  {
    id: 5,
    time: 16,
    title: "Entity approaches perimeter",
    description:
      "Real-time tracking shows the entity moving toward the exclusion zone. Movement trail renders behind it.",
    patentClaim: "Patent Claim: Real-time IoT data fusion",
    icon: <MapPin className="w-4 h-4" />,
    mapState: {
      entityX: 55,
      entityY: 45,
      geofenceVisible: true,
      breached: false,
      alertFired: false,
      haloColor: "#F59E0B",
    },
  },
  {
    id: 6,
    time: 20,
    title: "BREACH DETECTED",
    description:
      "Entity crosses the geofence boundary. Point-in-polygon detection triggers instantly. Halo turns red. Alert cascades.",
    patentClaim:
      "Patent Claim: Geofence breach detection from space with IoT verification",
    icon: <AlertTriangle className="w-4 h-4" />,
    mapState: {
      entityX: 65,
      entityY: 42,
      geofenceVisible: true,
      breached: true,
      alertFired: true,
      haloColor: "#EF4444",
    },
  },
];

const TOTAL_DURATION = 24;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function BreachWalkthrough() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= TOTAL_DURATION) {
          setIsPlaying(false);
          return TOTAL_DURATION;
        }
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Determine current step from elapsed time
  useEffect(() => {
    for (let i = STEPS.length - 1; i >= 0; i--) {
      if (elapsed >= STEPS[i].time) {
        setCurrentStep(i);
        break;
      }
    }
  }, [elapsed]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setElapsed(0);
    setCurrentStep(0);
  }, []);

  const step = STEPS[currentStep];
  const ms = step.mapState;

  return (
    <section className="py-24 px-4 bg-[#0A0A0A] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/5 text-red-400 text-xs font-mono mb-4">
            <Shield className="w-3 h-3" />
            BREACH DETECTION DEMO
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Watch a Geofence Breach.{" "}
            <span className="text-red-400">From Space.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A 24-second walkthrough of the full patent in action — from
            satellite imagery to IoT fusion to breach detection. Every step is
            protected IP.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Animated map */}
          <div className="relative">
            <div
              className={`relative w-full aspect-[16/10] rounded-xl overflow-hidden border transition-colors duration-500 ${
                ms.breached
                  ? "border-red-500/50"
                  : ms.geofenceVisible
                  ? "border-[#F59E0B]/30"
                  : "border-white/10"
              }`}
              style={{
                backgroundImage:
                  `url(https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/44.3,33.3,14,0/800x500@2x?access_token=${MAPBOX_TOKEN})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Geofence zone */}
              <AnimatePresence>
                {ms.geofenceVisible && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute"
                    style={{
                      left: "45%",
                      top: "30%",
                      width: "35%",
                      height: "40%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className={`w-full h-full rounded-full border-2 border-dashed transition-colors duration-500 ${
                        ms.breached
                          ? "border-red-500 bg-red-500/10"
                          : "border-[#F59E0B] bg-[#F59E0B]/5"
                      }`}
                    />
                    <div
                      className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap ${
                        ms.breached
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                      }`}
                    >
                      EXCLUSION ZONE ALPHA
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Entity with halo */}
              <motion.div
                className="absolute z-10"
                animate={{
                  left: `${ms.entityX}%`,
                  top: `${ms.entityY}%`,
                }}
                transition={{ duration: 3, ease: "easeInOut" }}
                style={{ transform: "translate(-50%, -50%)" }}
              >
                {/* Pulsing halo */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: ms.breached ? 80 : 50,
                    height: ms.breached ? 80 : 50,
                    left: ms.breached ? -40 : -25,
                    top: ms.breached ? -40 : -25,
                    background: `radial-gradient(circle, ${ms.haloColor}50 0%, transparent 70%)`,
                  }}
                  animate={{
                    scale: [1, 1.6, 1],
                    opacity: [0.8, 0.2, 0.8],
                  }}
                  transition={{
                    duration: ms.breached ? 0.8 : 2,
                    repeat: Infinity,
                  }}
                />

                {/* Core */}
                <motion.div
                  className="w-3 h-3 rounded-full border-2 border-white relative z-10"
                  style={{ backgroundColor: ms.haloColor }}
                  animate={
                    ms.breached ? { scale: [1, 1.3, 1] } : { scale: 1 }
                  }
                  transition={
                    ms.breached
                      ? { duration: 0.5, repeat: Infinity }
                      : undefined
                  }
                />

                {/* Label */}
                <div
                  className="absolute left-5 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-[10px] font-mono border whitespace-nowrap z-10"
                  style={{
                    backgroundColor: `${ms.haloColor}15`,
                    borderColor: `${ms.haloColor}40`,
                    color: ms.haloColor,
                  }}
                >
                  <div className="font-bold">UNKNOWN-1</div>
                  <div className="text-[9px] opacity-70">
                    {ms.breached ? "BREACH" : "TRACKING"} — HR: 112 bpm
                  </div>
                </div>
              </motion.div>

              {/* Alert ripple on breach */}
              <AnimatePresence>
                {ms.alertFired && (
                  <>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={`ripple-${i}`}
                        className="absolute rounded-full border-2 border-red-500"
                        style={{
                          left: `${ms.entityX}%`,
                          top: `${ms.entityY}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        initial={{ width: 10, height: 10, opacity: 0.8 }}
                        animate={{
                          width: 200,
                          height: 200,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.6,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Classification banner */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/70 backdrop-blur flex items-center justify-center text-[10px] font-mono text-gray-400 tracking-widest">
                DEMO // UNCLASSIFIED // IRON CURTAIN // LTx OVERWATCH
              </div>
            </div>

            {/* Transport controls */}
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm font-mono hover:bg-white/15 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isPlaying
                  ? "PAUSE"
                  : elapsed > 0
                  ? "RESUME"
                  : "PLAY DEMO"}
              </button>

              <button
                onClick={reset}
                className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Progress bar */}
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: ms.breached ? "#EF4444" : "#00E5A0",
                    width: `${(elapsed / TOTAL_DURATION) * 100}%`,
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              <span className="text-xs font-mono text-gray-500 w-12 text-right">
                {Math.floor(elapsed)}s / {TOTAL_DURATION}s
              </span>
            </div>
          </div>

          {/* Step narrative */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-4">
              Step-by-Step Narrative
            </h3>

            {STEPS.map((s, i) => {
              const isActive = i === currentStep;
              const isPast = i < currentStep;

              return (
                <motion.div
                  key={s.id}
                  className={`rounded-lg border p-3 transition-all cursor-pointer ${
                    isActive
                      ? "border-[#00E5A0]/40 bg-[#00E5A0]/5"
                      : isPast
                      ? "border-white/5 bg-white/[0.02] opacity-50"
                      : "border-white/5 bg-white/[0.01] opacity-30"
                  }`}
                  onClick={() => {
                    setElapsed(s.time);
                    setCurrentStep(i);
                  }}
                  animate={isActive ? { x: 0 } : { x: 0 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`p-1 rounded ${
                        isActive
                          ? "bg-[#00E5A0]/20 text-[#00E5A0]"
                          : "bg-white/5 text-gray-500"
                      }`}
                    >
                      {s.icon}
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        isActive ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {s.title}
                    </span>
                    {s.id === 6 && isActive && (
                      <span className="ml-auto text-[10px] font-mono text-red-400 animate-pulse">
                        ALERT
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                    >
                      <p className="text-xs text-gray-400 leading-relaxed mt-1">
                        {s.description}
                      </p>
                      <div className="mt-2 px-2 py-1 rounded bg-white/5 text-[10px] font-mono text-[#00E5A0]">
                        {s.patentClaim}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
