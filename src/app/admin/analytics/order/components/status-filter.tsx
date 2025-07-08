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

interface StatusFilterProps {
  orderStatus: string;
  setOrderStatus: (value: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  orderStatus,
  setOrderStatus,
}) => {
  return (
    <Select value={orderStatus} onValueChange={setOrderStatus}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Pilih status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Status pesanan</SelectLabel>
          <SelectItem value="all">Semua status</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
          <SelectItem value="CANCELED">Canceled</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="REFUNDED">Refunded</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default StatusFilter;
