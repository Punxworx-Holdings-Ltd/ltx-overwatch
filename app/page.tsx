import { Hero } from "@/components/landing/hero";
import { SplitComparison } from "@/components/landing/split-comparison";
import { PatentFortress } from "@/components/landing/patent-fortress";
import { SectorCards } from "@/components/landing/sector-cards";
import { ApiDemo } from "@/components/landing/api-demo";
import { Credibility } from "@/components/landing/credibility";
import LiveDemo from "@/components/landing/live-demo";
import BreachWalkthrough from "@/components/landing/breach-walkthrough";
import ROICalculator from "@/components/landing/roi-calculator";
import PatentLiveBadge from "@/components/landing/patent-live-badge";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <SplitComparison />
      <LiveDemo />
      <BreachWalkthrough />
      <PatentFortress />
      <SectorCards />
      <ROICalculator />
      <ApiDemo />
      <Credibility />
      <PatentLiveBadge />
    </main>
  );
}
