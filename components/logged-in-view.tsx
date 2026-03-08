/* eslint-disable @typescript-eslint/no-explicit-any */
import FeatureBigPreview from "./FeatureBigPreview";
import { CurrentGatherings } from "./home/current-gatherings";
import Details from "./home/Details";
import FAQSection from "./home/FAQSection";
import { GitHubEvents } from "./home/github-events";
import { GitHubReceivedEvents } from "./home/github-received-events";
import Hello from "./home/hello";
import { NewPeopleToConnect } from "./home/new-people-to-connect";
import { Quote } from "./home/Quote";
import { ReceivedFriendRequests } from "./home/received-friend-requests";
import LatestChangelog from "./latest-changelog";
import ProductHunt from "./ProductHunt";
import SwissSection from "./swiss/SwissSection";

function LoggedInView({ user }: { user: any }) {
  return (
    <div className="bg-white dark:bg-black min-h-screen swiss-noise transition-colors duration-300">
      <SwissSection variant="white" pattern="grid" className="py-12">
        <Hello name={user.name} picture={user.image} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 my-12">
          <div className="md:col-span-8">
            <GitHubReceivedEvents username={user.githubUsername} />
          </div>
          <div className="md:col-span-4">
            <NewPeopleToConnect />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 my-12">
          <div className="md:col-span-6">
            <GitHubEvents username={user.githubUsername} />
          </div>
          <div className="md:col-span-6">
            <CurrentGatherings />
          </div>
        </div>

        <ReceivedFriendRequests />
      </SwissSection>

      <SwissSection number="01" title="Innovation" variant="muted" pattern="dots">
        <FeatureBigPreview />
      </SwissSection>

      <SwissSection number="02" title="Platform" variant="white">
        <Details />
        <div className="mt-12">
          <ProductHunt />
        </div>
        <Quote />
      </SwissSection>

      <SwissSection number="03" title="Updates" variant="muted" pattern="grid">
        <LatestChangelog />
      </SwissSection>

      <SwissSection number="04" title="Questions" variant="white">
        <FAQSection />
      </SwissSection>
    </div>
  );
}

export default LoggedInView;
