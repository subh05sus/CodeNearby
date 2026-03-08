import type React from "react"

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
    <input
      type="time"
      value={`${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`}
      onChange={handleTimeChange}
      className="w-full bg-white border-4 border-black p-4 font-black text-xl uppercase  focus:outline-none focus:bg-muted transition-colors cursor-pointer"
    />
  )
}
