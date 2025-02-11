/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Smile } from "lucide-react";
import { useTheme } from "next-themes";

interface EmojiPickerProps {
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:bg-primary/10 rounded-full"
        >
          <Smile className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border-none" side="top">
        <Picker
          data={data}
          onEmojiSelect={(emoji: any) => {
            onChange(emoji.native);
            setOpen(false);
          }}
          theme={theme}
          previewPosition="none"
        />
      </PopoverContent>
    </Popover>
  );
}
