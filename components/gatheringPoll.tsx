"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Minus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CreatePollProps {
  gatheringSlug: string
}

export function CreateGatheringPoll({ gatheringSlug }: CreatePollProps) {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async () => {
    if (!question.trim() || options.some((option) => !option.trim())) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/gathering/${gatheringSlug}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options }),
      })

      if (!response.ok) {
        throw new Error("Failed to create poll")
      }

      toast({
        title: "Success",
        description: "Poll created successfully",
      })
      setIsOpen(false)
      setQuestion("")
      setOptions(["", ""])
    } catch {
      toast({
        title: "Error",
        description: "Failed to create poll. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Poll</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Enter your question" value={question} onChange={(e) => setQuestion(e.target.value)} />
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
              {index > 1 && (
                <Button size="icon" variant="ghost" onClick={() => removeOption(index)}>
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {options.length < 4 && (
            <Button onClick={addOption} variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          )}
          <Button onClick={handleSubmit} className="w-full">
            Create Poll
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

