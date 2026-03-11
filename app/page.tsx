import { Hero } from "@/components/landing/hero";
import { PatentFortress } from "@/components/landing/patent-fortress";
import { SectorCards } from "@/components/landing/sector-cards";
import { ApiDemo } from "@/components/landing/api-demo";
import { Credibility } from "@/components/landing/credibility";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <PatentFortress />
      <SectorCards />
      <ApiDemo />
      <Credibility />
    </main>
  );
}
