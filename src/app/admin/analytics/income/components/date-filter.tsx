import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface DateFilterProps {
  dateFilter: string;
  setDateFilter: (value: string) => void;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({
  dateFilter,
  setDateFilter,
  onDateRangeChange,
}) => {
  const [date, setDate] = useState<DateRange | undefined>();

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  React.useEffect(() => {
    if (dateFilter !== "custom") {
      setDate(undefined);
      onDateRangeChange?.(undefined);
    }
  }, [dateFilter, onDateRangeChange]);

  return (
    <div className="flex gap-2">
      <Select
        value={dateFilter}
        onValueChange={(value) => setDateFilter(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter tanggal" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Filter tangal</SelectLabel>
            <SelectItem value="7">7 hari terakhir</SelectItem>
            <SelectItem value="28">28 hari terakhir</SelectItem>
            <SelectItem value="90">90 hari terakhir</SelectItem>
            <SelectItem value="365">365 hari terakhir</SelectItem>
            <Separator className="my-1" />
            <SelectItem value="custom">Custom</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {dateFilter === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd LLL, y")} -{" "}
                    {format(date.to, "dd LLL, y")}
                  </>
                ) : (
                  format(date.from, "dd LLL, y")
                )
              ) : (
                <span>Pilih tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default DateFilter;
