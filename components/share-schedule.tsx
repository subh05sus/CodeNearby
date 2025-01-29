import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface ShareScheduleProps {
  onShareSchedule: (date: Date) => void;
}

export function ShareSchedule({ onShareSchedule }: ShareScheduleProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleShareSchedule = () => {
    if (date) {
      onShareSchedule(date);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Share Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Your Schedule</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          {date && <p className="mt-4">Selected date: {format(date, "PPP")}</p>}
          <Button onClick={handleShareSchedule} className="mt-4">
            Share This Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
