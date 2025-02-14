import { CodeNearbyText } from "./home/CodeNearbyText";
import Details from "./home/Details";
import FAQSection from "./home/FAQSection";
import Features from "./home/Features";
import { TextRotatePreview } from "./home/TextRotation";
import { Why } from "./home/Why";
import { Spotlight } from "./ui/spotlight-new";

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

      <div className="max-w-4xl mx-auto p-4 text-center my-40 mb-56">
        <p className="text-sm lowercase italic  ">Welcome to</p>
        <CodeNearbyText />
      </div>

      <Features />

      <Why />

      <Details />

      <FAQSection />
    </div>
  );
}

export default NotLoggedInView;
