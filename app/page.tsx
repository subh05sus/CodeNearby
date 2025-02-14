import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import NotLoggedInView from "@/components/not-logged-in-view";
import LoggedInView from "@/components/logged-in-view";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      {session ? (
        <div className="flex flex-col items-center justify-center  p-4 h-[-webkit-fill-available]">
          <LoggedInView user={session.user} />
        </div>
      ) : (
        <NotLoggedInView />
      )}
    </div>
  );
}
