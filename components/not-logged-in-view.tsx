import FeaturedTitle from "./FeaturedTitle";
import { CodeNearbyText } from "./home/CodeNearbyText";
import { CTASection } from "./home/CTASection";
import Details from "./home/Details";
import FAQSection from "./home/FAQSection";
import Features from "./home/Features";
import { HowItWorks } from "./home/HowItWorks";
import { OpenSourceSection } from "./home/OpenSourceSection";
import { Quote } from "./home/Quote";
import { StatsSection } from "./home/StatsSection";
import { TestimonialsSection } from "./home/TestimonialsSection";
import { TextRotatePreview } from "./home/TextRotation";
import { Why } from "./home/Why";
import LatestChangelog from "./latest-changelog";
// import ProductHunt from "./ProductHunt";
import AnimatedNetworkBackground from "./ui/animated-network-background";
import FeatureBigPreview from "./FeatureBigPreview";
import { TechStackMarquee } from "./home/TechStackMarquee";
import { CompareSection } from "./home/CompareSection";

function NotLoggedInView() {
  return (
    <div className="relative max-w-7xl mx-auto p-4">
      <AnimatedNetworkBackground />
      <div>
        <TextRotatePreview />
      </div>

      <div className="max-w-4xl mx-auto p-4 text-center mt-40 mb-56">
        <p className="text-base lowercase italic  ">Welcome to</p>
        <CodeNearbyText />
        {/* <ProductHunt /> */}
        <FeaturedTitle />
      </div>

      <StatsSection />

      <TechStackMarquee />

      <Features />

      <HowItWorks />

      <OpenSourceSection />

      <CompareSection />

      <Why />
      <div className="mb-16">
        <FeatureBigPreview />
      </div>

      <TestimonialsSection />

      <Details />
      <Quote />

      <LatestChangelog />

      <CTASection />

      <FAQSection />
    </div>
  );
}

export default NotLoggedInView;
