"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { DayPicker, DayPickerSingleProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TimePickerInput } from "./custom/time-picker-input";

export type DatetimePickerProps = Omit<
  DayPickerSingleProps,
  "mode" | "onSelect"
> & {
  setDate: (date: Date) => void;
};

function DatetimePicker({
  className,
  classNames,
  showOutsideDays = true,
  setDate: setGlobalDate,
  ...props
}: DatetimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const { selected: selectedDate } = props as { selected: Date };

  const setDate = (dateInput: Date | undefined) => {
    if (!dateInput) return;
    const date = new Date(selectedDate);
    date.setDate(dateInput.getDate());
    date.setMonth(dateInput.getMonth());
    date.setFullYear(dateInput.getFullYear());
    setGlobalDate(date);
  };
  
  const setTime = (dateInput: Date | undefined) => {
    if (!dateInput) return;
    const time = new Date(selectedDate);
    time.setHours(dateInput.getHours());
    time.setMinutes(dateInput.getMinutes());
    setGlobalDate(time);
  };

  return (
    <div className="w-full">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={setDate}
        showOutsideDays={showOutsideDays}
        className={cn("py-3 w-full", className)} // Ensure the outer container is full width
        classNames={{
          months:
            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full", // Ensure months container is full width
          month: "space-y-4 w-full", // Ensure each month container is full width
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1", // Ensure the table (calendar grid) is full width
          head_row: "flex w-full", // Ensure the header row is full width
          head_cell:
            "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center", // Make header cells stretch equally
          row: "flex w-full", // Ensure each row is full width
          cell: "flex-1 h-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20", // Make cells stretch equally
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-full p-0 font-normal aria-selected:opacity-100" // Ensure each day button is full width within its cell
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
      <hr className="my-0" />
      <div className="px-2 mt-4 flex justify-between">
        <div className="flex gap-2 items-center text-gray-700">
          <Clock className="h-5 w-5" />
          <p className="text-sm font-medium">Time</p>
        </div>
        <div className="font-medium">
          <div className="flex items-center gap-2">
            <TimePickerInput
              picker="hours"
              date={selectedDate}
              setDate={setTime}
              ref={hourRef}
              onRightFocus={() => minuteRef.current?.focus()}
            />
            <span>:</span>
            <TimePickerInput
              picker="minutes"
              date={selectedDate}
              setDate={setTime}
              ref={minuteRef}
              onLeftFocus={() => hourRef.current?.focus()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

DatetimePicker.displayName = "DatetimePicker";

export { DatetimePicker as DatetimePicker };
