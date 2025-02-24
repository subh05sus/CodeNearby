/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Spotlight } from "./ui/spotlight-new";

function LoggedInView({ user }: { user: any }) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="absolute top-0 right-0 w-full -z-50">
        <div className="h-[40rem] w-full rounded-md -z-50 flex md:items-center md:justify-center antialiased dark:bg-transparent bg-dot-black/[0.25] relative overflow-hidden">
          <Spotlight />
          <div className="absolute bottom-0 left-0 w-full right-0 h-96 bg-gradient-to-t from-white to-transparent dark:bg-transparent dark:hidden" />
        </div>
      </div>
      <Hello name={user.name} picture={user.image} />

      <div className="xl:grid-cols-3 sm:grid-cols-2 grid gap-4 grid-cols-1">
        <GitHubReceivedEvents username={user.githubUsername} />
        <NewPeopleToConnect />
      </div>
      <div className="grid grid-cols-1 gap-4 my-4 sm:grid-cols-2">
        <GitHubEvents username={user.githubUsername} />
        <CurrentGatherings />
      </div>
      <ReceivedFriendRequests />
      <div className="mt-20">
        <Details />
        <div className="w-fit">
          <ProductHunt />
        </div>
        <Quote />
      </div>
      <LatestChangelog />
      <FAQSection />
    </div>
  );
}

export default LoggedInView;
