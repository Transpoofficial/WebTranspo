import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleType {
  id: string;
  name: string;
}

interface VehicleTypesResponse {
  message: string;
  data: VehicleType[];
}

interface VehicleFilterProps {
  vehicleType: string;
  setVehicleType: (value: string) => void;
}

const VehicleFilter: React.FC<VehicleFilterProps> = ({
  vehicleType,
  setVehicleType,
}) => {
  const { data: vehicleTypesData, isLoading } = useQuery({
    queryKey: ["vehicle-types"],
    queryFn: async () => {
      const { data } = await axios.get<VehicleTypesResponse>(
        "/api/vehicle-types"
      );
      return data;
    },
  });

  return (
    <Select value={vehicleType} onValueChange={setVehicleType}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Pilih tipe kendaraan" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tipe kendaraan</SelectLabel>
          <SelectItem value="all">Semua tipe</SelectItem>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Memuat...
            </SelectItem>
          ) : (
            vehicleTypesData?.data.map((type) => (
              <SelectItem key={type.id} value={type.name}>
                {type.name}
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default VehicleFilter;
