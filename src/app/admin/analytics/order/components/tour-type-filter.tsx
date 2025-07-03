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

interface TourTypeFilterProps {
  tourType: string;
  setTourType: (value: string) => void;
}

const TourTypeFilter: React.FC<TourTypeFilterProps> = ({
  tourType,
  setTourType,
}) => {
  return (
    <Select value={tourType} onValueChange={setTourType}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Pilih tipe tour" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tipe Tour</SelectLabel>
          <SelectItem value="all">Semua tipe</SelectItem>
          <SelectItem value="open">Open-Trip</SelectItem>
          <SelectItem value="private">Private-Trip</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default TourTypeFilter;