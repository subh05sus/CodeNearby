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
import { Spotlight } from "./ui/spotlight-new";
import FeatureBigPreview from "./FeatureBigPreview";

function NotLoggedInView() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="absolute top-0 right-0 w-full -z-50">
        <div className="h-[40rem] w-full rounded-md -z-50 flex md:items-center md:justify-center antialiased dark:bg-transparent bg-dot-black/[0.5] relative overflow-hidden">
          <Spotlight />
          <div className="absolute bottom-0 left-0 w-full right-0 h-96 bg-gradient-to-t from-white to-transparent dark:bg-transparent dark:hidden" />
        </div>
      </div>
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
