import FeaturedTitle from "./FeaturedTitle";
import { CodeNearbyText } from "./home/CodeNearbyText";
import Details from "./home/Details";
import FAQSection from "./home/FAQSection";
import Features from "./home/Features";
import { Quote } from "./home/Quote";
import { TextRotatePreview } from "./home/TextRotation";
import { Why } from "./home/Why";
import LatestChangelog from "./latest-changelog";
// import ProductHunt from "./ProductHunt";
import AnimatedNetworkBackground from "./ui/animated-network-background";
import FeatureBigPreview from "./FeatureBigPreview";

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

      <Features />

      <Why />
      <div className="mb-16">
        <FeatureBigPreview />
      </div>

      <Details />
      <Quote />

      <LatestChangelog />

      <FAQSection />
    </div>
  );
}

export default NotLoggedInView;
