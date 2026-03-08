/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { Calendar, Clock, MessageSquare, Users, Zap } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import SwissButton from "./swiss/SwissButton";
import { cn } from "@/lib/utils";

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
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {gatherings.map((gathering) => (
        <div
          key={gathering.id}
          className="group bg-swiss-white border-4 border-swiss-black flex flex-col shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:bg-swiss-muted transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <div className="p-8 border-b-4 border-swiss-black bg-swiss-black text-swiss-white">
            <div className="flex justify-between items-start gap-4 mb-4">
              <h3 className="font-black text-3xl uppercase tracking-tighter leading-none break-words">
                {gathering.name}
              </h3>
              <div className="p-2 border-2 border-swiss-white">
                <Zap className="h-4 w-4 text-swiss-red fill-swiss-red" />
              </div>
            </div>
            <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-[10px]">
              <Users className="h-4 w-4" />
              {gathering.participants.length} PARTICIPANTS
            </div>
          </div>

          <div className="p-8 flex-1 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 font-bold uppercase tracking-tight text-xs">
                <Calendar className="h-5 w-5 text-swiss-red" />
                CREATED {formatDistanceToNow(new Date(gathering.createdAt), { addSuffix: true }).toUpperCase()}
              </div>
              <div className="flex items-center gap-3 font-bold uppercase tracking-tight text-xs">
                <Clock className="h-5 w-5 text-swiss-red" />
                EXPIRES {format(new Date(gathering.expiresAt), "PPp").toUpperCase()}
              </div>
            </div>

            <div className="pt-6 border-t-2 border-swiss-black grid grid-cols-2 gap-3">
              <SwissButton asChild variant="primary" size="sm" className="h-10">
                <Link href={`/gathering/${gathering.slug}`}>
                  <Users className="mr-2 h-4 w-4" /> VIEW
                </Link>
              </SwissButton>
              <SwissButton asChild variant="secondary" size="sm" className="h-10">
                <Link href={`/gathering/${gathering.slug}/chat`}>
                  <MessageSquare className="mr-2 h-4 w-4" /> CHAT
                </Link>
              </SwissButton>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
