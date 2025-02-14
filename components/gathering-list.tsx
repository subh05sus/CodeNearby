/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MessageSquare, Users } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Gathering {
  participants: any;
  createdAt: string | number | Date;
  id: string;
  name: string;
  slug: string;
  expiresAt: string;
  hostId: string;
}

interface GatheringListProps {
  gatherings: Gathering[];
}

export function GatheringList({ gatherings }: GatheringListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {gatherings.map((gathering) => (
        <Card
          key={gathering.id}
          className="hover:shadow-lg transition-shadow duration-300"
        >
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {gathering.name}
            </CardTitle>
            <CardDescription>
              <div className="flex space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/gathering/${gathering.slug}`}>
                    <Users className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/gathering/${gathering.slug}/chat`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                  </Link>
                </Button>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                {gathering.participants.length} participant
                {gathering.participants.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Created{" "}
                {formatDistanceToNow(new Date(gathering.createdAt), {
                  addSuffix: true,
                })}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                Expires {format(new Date(gathering.expiresAt), "PPp")}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
