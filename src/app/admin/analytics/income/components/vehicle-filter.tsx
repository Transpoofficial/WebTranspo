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
  pricePerKm: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: VehicleType[];
  message: string;
  pagination: {
    total: number;
    skip: number;
    limit: number;
    hasMore: boolean;
  };
}

interface VehicleFilterProps {
  vehicleType: string;
  setVehicleType: (value: string) => void;
}

const VehicleFilter: React.FC<VehicleFilterProps> = ({
  vehicleType,
  setVehicleType,
}) => {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery<ApiResponse>({
    queryKey: ["vehicle-types"],
    queryFn: async () => {
      const { data } = await axios.get("/api/vehicle-types");
      return data;
    },
  });

  if (isLoading) {
    return (
      <Select disabled value={vehicleType}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error || !response?.data) {
    return (
      <Select disabled value={vehicleType}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Error loading data" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={vehicleType} onValueChange={setVehicleType}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Pilih tipe kendaraan" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tipe kendaraan</SelectLabel>
          <SelectItem value="all">Semua tipe</SelectItem>
          {response.data.map((type) => (
            <SelectItem key={type.id} value={type.name}>
              {type.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default VehicleFilter;
