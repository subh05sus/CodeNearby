import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Minus, ChartNoAxesColumn } from "lucide-react";
import SwissButton from "./swiss/SwissButton";

interface CreatePollProps {
  onCreatePoll: (question: string, options: string[]) => void;
}

export function CreatePoll({ onCreatePoll }: CreatePollProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isOpen, setIsOpen] = useState(false);

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (question.trim() && options.every((option) => option.trim())) {
      onCreatePoll(question, options);
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
          <ChartNoAxesColumn className="w-5 h-5" />
        </SwissButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-none border-4 border-black p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tightest mb-4">Create a Poll</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4 border-t-2 border-black/10">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-swiss-red mb-2 italic">Poll Question</p>
            <input
              placeholder="ENTER YOUR QUESTION"
              className="w-full bg-white border-2 border-black p-3 font-bold uppercase tracking-widest focus:bg-muted outline-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs font-black uppercase tracking-widest text-swiss-red mb-1 italic">Options</p>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  placeholder={`OPTION ${index + 1}`}
                  className="flex-1 bg-white border-2 border-black p-3 font-bold uppercase tracking-widest focus:bg-muted outline-none"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                {index > 1 && (
                  <SwissButton
                    size="sm"
                    variant="secondary"
                    className="w-10 h-10 p-0"
                    onClick={() => removeOption(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </SwissButton>
                )}
              </div>
            ))}
          </div>

          {options.length < 4 && (
            <SwissButton onClick={addOption} variant="secondary" size="sm" className="w-fit">
              <Plus className="h-4 w-4 mr-2" /> ADD OPTION
            </SwissButton>
          )}
        </div>
        <SwissButton onClick={handleSubmit} variant="accent" className="w-full mt-4">CREATE POLL</SwissButton>
      </DialogContent>
    </Dialog>
  );
}
