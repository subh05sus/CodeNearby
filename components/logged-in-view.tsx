/* eslint-disable @typescript-eslint/no-explicit-any */
import { CurrentGatherings } from "./home/current-gatherings";
import { GitHubEvents } from "./home/github-events";
import { GitHubReceivedEvents } from "./home/github-received-events";
import Hello from "./home/hello";
import { NewPeopleToConnect } from "./home/new-people-to-connect";
import { QuickActions } from "./home/QuickActions";
import { ReceivedFriendRequests } from "./home/received-friend-requests";
import { Quote } from "./home/Quote";
import LatestChangelog from "./latest-changelog";
import { Spotlight } from "./ui/spotlight-new";
import FeatureBigPreview from "./FeatureBigPreview";
import Details from "./home/Details";

function LoggedInView({ user }: { user: any }) {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-full -z-50">
        <div className="h-[40rem] w-full rounded-md -z-50 dark:flex hidden md:items-center md:justify-center antialiased dark:bg-transparent bg-dot-black/[0.25] relative overflow-hidden">
          <Spotlight />
        </div>
        <div className="h-[40rem] w-full rounded-md -z-50 flex dark:hidden md:items-center md:justify-center antialiased bg-dot-black/[0.25] relative overflow-hidden" />
        <div className="absolute bottom-0 left-0 w-full right-0 h-96 bg-gradient-to-t from-background to-transparent dark:bg-transparent dark:hidden" />
      </div>

      {/* Header */}
      <Hello name={user.name} picture={user.image} />

      {/* Quick action tiles */}
      <QuickActions />

      {/* Friend requests — only shows if pending */}
      <ReceivedFriendRequests />

      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 h-[360px]">
          <GitHubReceivedEvents username={user.githubUsername} />
        </div>
        <div className="h-[360px]">
          <NewPeopleToConnect />
        </div>
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="h-[280px]">
          <GitHubEvents username={user.githubUsername} />
        </div>
        <div className="h-[280px]">
          <CurrentGatherings />
        </div>
      </div>

      {/* Feature preview */}
      <div className="mb-12">
        <FeatureBigPreview />
      </div>

      {/* Details + Quote */}
      <div className="mb-12 space-y-8">
        <Details />
        <Quote />
      </div>

      <LatestChangelog />
    </div>
  );
}

export default LoggedInView;
