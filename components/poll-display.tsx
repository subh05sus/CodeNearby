"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { BarChartIcon as ChartBar, Check } from "lucide-react";
import { Session } from "next-auth";
import { cn } from "@/lib/utils";

interface PollDisplayProps {
  poll: {
    question: string;
    options: string[];
    votes: Record<string, number>;
    userVotes?: Record<string, string>;
  };
  postId: string;
  onVote: (postId: string, optionIndex: number) => Promise<void>;
}

export function PollDisplay({ poll, postId, onVote }: PollDisplayProps) {
  const { data: session } = useSession() as { data: Session | null };
  const [isVoting, setIsVoting] = useState(false);

  const totalVotes = Object.values(poll.votes || {}).reduce(
    (sum, count) => sum + (count || 0),
    0
  );
  const hasVoted =
    session?.user?.id && poll.userVotes?.[session.user.id] !== undefined;

  const handleVote = async (index: number) => {
    if (!session || hasVoted || isVoting) return;
    setIsVoting(true);
    try {
      await onVote(postId, index);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-swiss-white border-4 border-swiss-black p-6">
      <div className="flex items-center gap-3 mb-6">
        <ChartBar className="h-6 w-6 text-swiss-red" />
        <h3 className="font-black uppercase tracking-tighter text-lg leading-tight">
          {poll.question}
        </h3>
      </div>

      <div className="space-y-6">
        {poll.options.map((option, index) => {
          const votes = poll.votes?.[index] || 0;
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
          const isSelected =
            hasVoted && Number(poll.userVotes?.[session!.user!.id]) === index;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => handleVote(index)}
                  disabled={hasVoted || isVoting}
                  className={cn(
                    "flex-1 text-left p-2 font-bold uppercase tracking-tight text-sm transition-colors",
                    isSelected ? "bg-swiss-black text-swiss-white" : "hover:bg-swiss-muted",
                    !hasVoted && !isVoting && "cursor-pointer"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {isSelected && <Check className="h-4 w-4" />}
                    {option}
                  </span>
                </button>
                <span className="font-black uppercase  text-[10px] text-swiss-red tabular-nums">
                  {votes} {votes === 1 ? "VOTE" : "VOTES"}
                </span>
              </div>

              <div className="h-4 bg-swiss-muted border-2 border-swiss-black relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-swiss-black transition-transform duration-500"
                  style={{ transform: `translateX(${percentage - 100}%)` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t-2 border-swiss-black flex items-center justify-between">
        <p className="text-[10px] font-black uppercase  opacity-60">
          METRIC / {totalVotes} TOTAL {totalVotes === 1 ? "VOTE" : "VOTES"}
        </p>
        {!hasVoted && !session && (
          <p className="text-[8px] font-bold uppercase  text-swiss-red">LOGIN TO PARTICIPATE</p>
        )}
      </div>
    </div>
  );
}
