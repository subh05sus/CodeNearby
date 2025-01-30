import type React from "react"
import { Input } from "@/components/ui/input"

interface TimePickerInputProps {
  date: Date
  setDate: (date: Date) => void
}

export function TimePickerInput({ date, setDate }: TimePickerInputProps) {
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = event.target.value.split(":").map(Number)
    const newDate = new Date(date)
    newDate.setHours(hours)
    newDate.setMinutes(minutes)
    setDate(newDate)
  }

  return (
    <Input
      type="time"
      value={`${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`}
      onChange={handleTimeChange}
      className="w-fit"
    />
  )
}

