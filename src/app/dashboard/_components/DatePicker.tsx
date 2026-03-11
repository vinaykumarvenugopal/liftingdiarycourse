"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  selected: Date;
}

export function DatePicker({ selected }: DatePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", format(date, "yyyy-MM-dd"));
    router.push(`?${params.toString()}`);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[220px] justify-start gap-2 text-left font-normal">
          <CalendarIcon className="h-4 w-4 text-zinc-500" />
          {format(selected, "do MMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
