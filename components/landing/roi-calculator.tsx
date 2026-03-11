"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  TrendingUp,
  Clock,
  Shield,
  DollarSign,
  ChevronRight,
} from "lucide-react";

const SECTORS = [
  {
    id: "defence",
    label: "Defence & Security",
    icon: "🎖️",
    costPerIncident: 250000,
    incidentReduction: 0.73,
    responseTimeReduction: 0.64,
    baseOpsCost: 2400000,
    opsReduction: 0.35,
  },
  {
    id: "agriculture",
    label: "Precision Agriculture",
    icon: "🌾",
    costPerIncident: 45000,
    incidentReduction: 0.42,
    responseTimeReduction: 0.58,
    baseOpsCost: 180000,
    opsReduction: 0.28,
  },
  {
    id: "maritime",
    label: "Maritime & Ports",
    icon: "🚢",
    costPerIncident: 380000,
    incidentReduction: 0.61,
    responseTimeReduction: 0.71,
    baseOpsCost: 1800000,
    opsReduction: 0.32,
  },
  {
    id: "oil-gas",
    label: "Oil & Gas",
    icon: "🛢️",
    costPerIncident: 1200000,
    incidentReduction: 0.56,
    responseTimeReduction: 0.68,
    baseOpsCost: 3200000,
    opsReduction: 0.41,
  },
  {
    id: "wildlife",
    label: "Wildlife Conservation",
    icon: "🦏",
    costPerIncident: 85000,
    incidentReduction: 0.65,
    responseTimeReduction: 0.52,
    baseOpsCost: 420000,
    opsReduction: 0.3,
  },
  {
    id: "disaster",
    label: "Disaster Response",
    icon: "🚨",
    costPerIncident: 150000,
    incidentReduction: 0.48,
    responseTimeReduction: 0.76,
    baseOpsCost: 900000,
    opsReduction: 0.38,
  },
];

export default function ROICalculator() {
  const [sectorIndex, setSectorIndex] = useState(0);
  const [assetCount, setAssetCount] = useState(50);
  const [incidentsPerYear, setIncidentsPerYear] = useState(12);

  const sector = SECTORS[sectorIndex];

  const roi = useMemo(() => {
    const incidentSavings =
      incidentsPerYear *
      sector.costPerIncident *
      sector.incidentReduction;

    const opsSavings = sector.baseOpsCost * sector.opsReduction;

    const responseTimeSaved = sector.responseTimeReduction * 100;

    const totalSavings = incidentSavings + opsSavings;

    const platformCost = 120000 + assetCount * 200; // Base + per device
    const netROI = totalSavings - platformCost;
    const roiPercentage = ((netROI / platformCost) * 100).toFixed(0);

    return {
      incidentSavings,
      opsSavings,
      totalSavings,
      platformCost,
      netROI,
      roiPercentage,
      responseTimeSaved,
      incidentsAvoided: Math.round(
        incidentsPerYear * sector.incidentReduction
      ),
    };
  }, [sectorIndex, assetCount, incidentsPerYear, sector]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <section className="py-24 px-4 bg-[#050505] border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/5 text-[#3B82F6] text-xs font-mono mb-4">
            <Calculator className="w-3 h-3" />
            ROI CALCULATOR
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            What&apos;s Your{" "}
            <span className="text-[#3B82F6]">Return on Intelligence?</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Configure your sector, asset count, and incident rate. See the
            projected annual impact of satellite-IoT fusion.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
          {/* Input panel */}
          <div className="space-y-6">
            {/* Sector selector */}
            <div>
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3 block">
                Your Sector
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SECTORS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setSectorIndex(i)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      sectorIndex === i
                        ? "bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-white"
                        : "bg-white/[0.03] border border-white/5 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <span className="text-base">{s.icon}</span>
                    <span className="text-xs leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Asset count slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                  Monitored Assets
                </label>
                <span className="text-sm font-mono text-white font-bold">
                  {assetCount}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={assetCount}
                onChange={(e) => setAssetCount(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-white/10 accent-[#3B82F6] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-600 mt-1">
                <span>10</span>
                <span>250</span>
                <span>500</span>
              </div>
            </div>

            {/* Incidents slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                  Annual Incidents
                </label>
                <span className="text-sm font-mono text-white font-bold">
                  {incidentsPerYear}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={incidentsPerYear}
                onChange={(e) =>
                  setIncidentsPerYear(parseInt(e.target.value))
                }
                className="w-full h-2 rounded-full appearance-none bg-white/10 accent-[#3B82F6] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-600 mt-1">
                <span>1</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* Assumptions */}
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[10px] font-mono text-gray-500 leading-relaxed">
                Projections based on industry benchmarks for{" "}
                {sector.label.toLowerCase()}. Cost per incident:{" "}
                {fmt(sector.costPerIncident)}. Incident reduction:{" "}
                {(sector.incidentReduction * 100).toFixed(0)}%. Operational
                savings: {(sector.opsReduction * 100).toFixed(0)}% of{" "}
                {fmt(sector.baseOpsCost)} base. Platform cost: {fmt(120000)}{" "}
                base + {fmt(200)}/asset/yr.
              </p>
            </div>
          </div>

          {/* Results panel */}
          <div className="space-y-4">
            {/* Big number — total annual savings */}
            <motion.div
              key={`${sectorIndex}-${assetCount}-${incidentsPerYear}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-xl border border-[#00E5A0]/20 bg-gradient-to-br from-[#00E5A0]/5 to-transparent p-6"
            >
              <div className="text-xs font-mono text-[#00E5A0] mb-1">
                PROJECTED ANNUAL SAVINGS
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white font-mono">
                {fmt(roi.totalSavings)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Net ROI:{" "}
                <span className="text-[#00E5A0] font-bold">
                  {roi.roiPercentage}%
                </span>{" "}
                after platform costs
              </div>
            </motion.div>

            {/* Breakdown cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <Shield className="w-4 h-4 text-[#3B82F6] mb-2" />
                <div className="text-lg font-bold text-white font-mono">
                  {roi.incidentsAvoided}
                </div>
                <div className="text-[10px] text-gray-400 font-mono uppercase">
                  Incidents Avoided
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {fmt(roi.incidentSavings)} saved
                </div>
              </div>

              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <Clock className="w-4 h-4 text-[#F59E0B] mb-2" />
                <div className="text-lg font-bold text-white font-mono">
                  {roi.responseTimeSaved.toFixed(0)}%
                </div>
                <div className="text-[10px] text-gray-400 font-mono uppercase">
                  Faster Response
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Real-time detection
                </div>
              </div>

              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <TrendingUp className="w-4 h-4 text-[#00E5A0] mb-2" />
                <div className="text-lg font-bold text-white font-mono">
                  {fmt(roi.opsSavings)}
                </div>
                <div className="text-[10px] text-gray-400 font-mono uppercase">
                  Ops Cost Reduction
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(sector.opsReduction * 100).toFixed(0)}% efficiency gain
                </div>
              </div>

              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <DollarSign className="w-4 h-4 text-white/50 mb-2" />
                <div className="text-lg font-bold text-white font-mono">
                  {fmt(roi.platformCost)}
                </div>
                <div className="text-[10px] text-gray-400 font-mono uppercase">
                  Platform Cost
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {assetCount} assets monitored
                </div>
              </div>
            </div>

            {/* CTA */}
            <a
              href="#enterprise-cta"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-[#3B82F6]/90 transition-all"
            >
              Request Custom ROI Analysis
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
