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

interface VehicleFilterProps {
  vehicleType: string;
  setVehicleType: (value: string) => void;
}

const VehicleFilter: React.FC<VehicleFilterProps> = ({
  vehicleType,
  setVehicleType,
}) => {
  return (
    <Select value={vehicleType} onValueChange={setVehicleType}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Pilih tipe kendaraan" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tipe kendaraan</SelectLabel>
          <SelectItem value="all">Semua tipe</SelectItem>
          <SelectItem value="ANGKOT">Angkot</SelectItem>
          <SelectItem value="HIACE">HIACE</SelectItem>
          <SelectItem value="ELF">Elf</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default VehicleFilter;
