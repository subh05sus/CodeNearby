import React from "react";
import { CHANGELOG } from "@/consts/Changelog";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { ChevronRight } from "lucide-react";

const LatestChangelog: React.FC = () => {
  const latestVersion = CHANGELOG[0];

  return (
    <Card className="relative max-w-3xl mx-auto mb-20">
      <div className="absolute -top-3 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
        Latest Release: v{latestVersion.version}
      </div>
      <CardContent>
        <h2 className=" font-semibold text-gray-900 dark:text-white mt-5 mb-2">
          Additions
        </h2>
        <ul className="list-disc list-inside space-y-2 text-foreground text-sm">
          {latestVersion.changes.map((change: string, index: number) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: change }} />
          ))}
        </ul>
        <div className="mt-4 text-sm">
          <Link
            href="/changelog"
            className="group text-xs text-muted-foreground transition-all duration-200"
          >
            <span>View Changelog history</span>
            <ChevronRight
              className="inline-block group-hover:ml-2 transition-all duration-200"
              size={15}
            />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LatestChangelog;
