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

interface ChartFilterProps {
  chartType: string;
  setChartType: (value: string) => void;
}

const ChartFilter: React.FC<ChartFilterProps> = ({
  chartType,
  setChartType,
}) => {
  return (
    <>
      <Select value={chartType} onValueChange={(value) => setChartType(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Pilih chart" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Pilih chart</SelectLabel>
            <SelectItem value="line">Line chart</SelectItem>
            <SelectItem value="bar">Bar chart</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};

export default ChartFilter;
