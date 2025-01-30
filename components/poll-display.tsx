"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"
import { BarChartIcon as ChartBar } from "lucide-react"
import { Session } from "next-auth"

interface PollDisplayProps {
  poll: {
    question: string
    options: string[]
    votes: Record<string, number>
    userVotes?: Record<string, string>
  }
  postId: string
  onVote: (postId: string, optionIndex: number) => Promise<void>
}

export function PollDisplay({ poll, postId, onVote }: PollDisplayProps) {
  const { data: session } = useSession() as { data: Session | null }
  const [isVoting, setIsVoting] = useState(false)

  const totalVotes = Object.values(poll.votes || {}).reduce((sum, count) => sum + (count || 0), 0)
  const hasVoted = session?.user?.id && poll.userVotes?.[session.user.id] !== undefined

  const handleVote = async (index: number) => {
    if (!session || hasVoted || isVoting) return
    setIsVoting(true)
    try {
      await onVote(postId, index)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="bg-muted rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <ChartBar className="h-5 w-5" />
        <h3 className="font-semibold text-lg">{poll.question}</h3>
      </div>
      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const votes = poll.votes?.[index] || 0
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
          const isSelected = hasVoted && Number(poll.userVotes?.[session!.user!.id]) === index

          return (
            <div key={index} className="space-y-1">
              <Button
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-between font-normal"
                onClick={() => handleVote(index)}
                disabled={hasVoted || isVoting}
              >
                <span>{option}</span>
                <span className="text-muted-foreground">
                  {votes} {votes === 1 ? "vote" : "votes"}
                </span>
              </Button>
              <Progress value={percentage} className="h-2" />
            </div>
          )
        })}
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        {totalVotes} total {totalVotes === 1 ? "vote" : "votes"}
      </p>
    </div>
  )
}

