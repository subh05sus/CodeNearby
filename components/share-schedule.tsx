import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { TimePickerInput } from "./time-picker-input"

interface ShareScheduleProps {
  onShareSchedule: (date: Date) => void
}

export function ShareSchedule({ onShareSchedule }: ShareScheduleProps) {
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date())

  const handleShareSchedule = () => {
    if (selectedDateTime) {
      onShareSchedule(selectedDateTime)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full">
          <CalendarIcon className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Your Schedule</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Calendar
            mode="single"
            selected={selectedDateTime}
            onSelect={(date) =>
              date &&
              setSelectedDateTime(new Date(date.setHours(selectedDateTime.getHours(), selectedDateTime.getMinutes())))
            }
            className="rounded-md border"
          />
          <div className="mt-4">
            <TimePickerInput date={selectedDateTime} setDate={setSelectedDateTime} />
          </div>
          {selectedDateTime && <p className="mt-4 text-sm">Selected date and time: {format(selectedDateTime, "PPP p")}</p>}
          <Button onClick={handleShareSchedule} className="mt-4">
            Share This Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

