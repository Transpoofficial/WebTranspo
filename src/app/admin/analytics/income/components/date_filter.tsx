import React from "react";
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
}

const DateFilter: React.FC<DateFilterProps> = ({
  dateFilter,
  setDateFilter,
}) => {
  return (
    <>
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
    </>
  );
};

export default DateFilter;
