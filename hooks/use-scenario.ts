// Hook for managing scenario state — loads scenario config, devices, and geofences
"use client";

import { useState, useCallback, useMemo } from "react";
import { SCENARIOS } from "@/lib/utils/constants";

type ScenarioConfig = (typeof SCENARIOS)[number];

interface UseScenarioOptions {
  initialSlug?: string;
}

export function useScenario(options: UseScenarioOptions = {}) {
  const [activeSlug, setActiveSlug] = useState<string>(
    options.initialSlug ?? SCENARIOS[0].slug
  );

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.slug === activeSlug) ?? SCENARIOS[0],
    [activeSlug]
  );

  const setScenario = useCallback((slug: string) => {
    const exists = SCENARIOS.find((s) => s.slug === slug);
    if (exists) setActiveSlug(slug);
  }, []);

  const nextScenario = useCallback(() => {
    const idx = SCENARIOS.findIndex((s) => s.slug === activeSlug);
    const next = SCENARIOS[(idx + 1) % SCENARIOS.length];
    setActiveSlug(next.slug);
  }, [activeSlug]);

  const prevScenario = useCallback(() => {
    const idx = SCENARIOS.findIndex((s) => s.slug === activeSlug);
    const prev = SCENARIOS[(idx - 1 + SCENARIOS.length) % SCENARIOS.length];
    setActiveSlug(prev.slug);
  }, [activeSlug]);

  return {
    scenario,
    scenarios: SCENARIOS as readonly ScenarioConfig[],
    activeSlug,
    setScenario,
    nextScenario,
    prevScenario,
  };
}
