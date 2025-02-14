"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";

interface Gathering {
  _id: string;
  name: string;
  slug: string;
  expiresAt: string;
}

export function CurrentGatherings() {
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGatherings = async () => {
      try {
        const response = await fetch("/api/gathering");
        const data = await response.json();
        setGatherings(data);
      } catch (error) {
        console.error("Error fetching current gatherings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGatherings();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Gatherings</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[160px] portrait:h-fit pr-4">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : gatherings.length > 0 ? (
            <ul className="space-y-2">
              {gatherings.map((gathering) => (
                <li
                  key={gathering._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold md:text-base text-sm">
                      {gathering.name}
                    </h3>
                    <p className=" text-xs md:text-sm text-muted-foreground">
                      Expires: {new Date(gathering.expiresAt).toLocaleString()}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/gathering/${gathering.slug}`}>
                      <Users className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No current gatherings
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
