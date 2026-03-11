"use client";

import { motion } from "framer-motion";
import { ArrowRight, Satellite, Radio } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-background">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,229,160,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Classification banner */}
      <div className="classification-banner fixed top-0 left-0 right-0 z-50">
        DEMO // UNCLASSIFIED // LTx OVERWATCH // SPACE AYE
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-16">
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="relative">
            <Satellite className="w-8 h-8 text-accent" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-halo-pulse" />
          </div>
          <span className="font-mono text-sm tracking-[0.3em] text-text-muted uppercase">
            LTx OVERWATCH
          </span>
        </motion.div>

        {/* Main tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
        >
          <span className="text-foreground">Seeing Earth is Easy.</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent to-intel animate-gradient">
            Identifying everything on it
          </span>
          <br />
          <span className="text-foreground">...is power.</span>
        </motion.h1>

        {/* Sub tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-4"
        >
          The world&apos;s only patented platform for merging IoT data with
          real-time satellite imagery.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="font-mono text-sm text-accent mb-10"
        >
          AI classifies. Space Aye identifies.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/command"
            className="group flex items-center gap-2 px-8 py-4 bg-accent text-background font-semibold rounded-lg hover:bg-accent-dim transition-colors"
          >
            <Radio className="w-5 h-5" />
            Launch OVERWATCH
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#patent"
            className="flex items-center gap-2 px-8 py-4 border border-border text-foreground font-medium rounded-lg hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            View Patent Portfolio
          </Link>
        </motion.div>

        {/* Live data indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex items-center justify-center gap-6 font-mono text-xs text-text-dim"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-halo-pulse" />
            LIVE DATA FUSION
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-intel" />
            SENTINEL-2 IMAGERY
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-friendly" />6 SECTOR DEMOS
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
