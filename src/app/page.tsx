import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import {
  FaqSection,
  FeatureCarousel,
  FinalCta,
  InteractiveDemo,
  LandingFooter,
  ProblemSection,
  SolutionSection,
  TestimonialsSection,
} from "@/components/landing/sections";
import { PricingSection } from "@/components/landing/pricing-section";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-kyber-black">
      <LandingNavbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <FeatureCarousel />
      <InteractiveDemo />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
