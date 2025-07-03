// components/order-type-filter.tsx
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

interface OrderTypeFilterProps {
  orderType: string;
  setOrderType: (value: string) => void;
}

const OrderTypeFilter: React.FC<OrderTypeFilterProps> = ({
  orderType,
  setOrderType,
}) => {
  return (
    <Select value={orderType} onValueChange={setOrderType}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Pilih tipe pesanan" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tipe Pesanan</SelectLabel>
          <SelectItem value="all">Semua tipe</SelectItem>
          <SelectItem value="TRANSPORT">Transportasi</SelectItem>
          <SelectItem value="TOUR">Tour</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default OrderTypeFilter;