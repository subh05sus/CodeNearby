import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";

interface Gathering {
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
        <Card key={gathering.id}>
          <CardHeader>
            <CardTitle>{gathering.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Expires: {new Date(gathering.expiresAt).toLocaleString()}
            </p>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
