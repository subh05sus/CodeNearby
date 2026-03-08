import { useState } from "react";
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
import { TimePickerInput } from "./time-picker-input";
import SwissButton from "./swiss/SwissButton";

interface ShareScheduleProps {
  onShareSchedule: (date: Date) => void;
}

export function ShareSchedule({ onShareSchedule }: ShareScheduleProps) {
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const handleShareSchedule = () => {
    if (selectedDateTime) {
      onShareSchedule(selectedDateTime);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <SwissButton
          variant="secondary"
          size="sm"
          className="w-10 h-10 p-0"
        >
          <CalendarIcon className="w-5 h-5" />
        </SwissButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-none border-4 border-black p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase  mb-4">Share Your Schedule</DialogTitle>
        </DialogHeader>
        <div className="py-4 border-t-2 border-black/10">
          <Calendar
            mode="single"
            selected={selectedDateTime}
            onSelect={(date) =>
              date &&
              setSelectedDateTime(
                new Date(
                  date.setHours(
                    selectedDateTime.getHours(),
                    selectedDateTime.getMinutes()
                  )
                )
              )
            }
            className="rounded-none border-4 border-black p-4 mb-6"
          />
          <div className="mb-6">
            <p className="text-xs font-black uppercase  text-swiss-red mb-2 italic">Set Time</p>
            <TimePickerInput
              date={selectedDateTime}
              setDate={setSelectedDateTime}
            />
          </div>
          {selectedDateTime && (
            <div className="bg-muted p-4 border-2 border-black mb-6">
              <p className="text-xs font-black uppercase  opacity-50 mb-1">Target Selection</p>
              <p className="font-bold text-lg leading-tight uppercase">
                {format(selectedDateTime, "PPP p")}
              </p>
            </div>
          )}
          <SwissButton onClick={handleShareSchedule} variant="accent" className="w-full">
            SHARE THIS SCHEDULE
          </SwissButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
