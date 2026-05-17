import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { Problem } from "@/components/home/Problem";
import { Services } from "@/components/home/Services";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AudioDemo } from "@/components/home/AudioDemo";
import { VideoDemo } from "@/components/home/VideoDemo";
import { Agents } from "@/components/home/Agents";
import { ROICalculator } from "@/components/home/ROICalculator";
import { ContactCTA } from "@/components/home/ContactCTA";
import { FAQ } from "@/components/home/FAQ";
import { CTAFinal } from "@/components/home/CTAFinal";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Problem />
      <Services />
      <HowItWorks />
      <AudioDemo />
      <VideoDemo />
      <Agents />
      <ROICalculator />
      <ContactCTA />
      <FAQ />
      <CTAFinal />
    </>
  );
}
