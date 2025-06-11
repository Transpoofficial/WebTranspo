"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Order {
  id: string;
  fullName: string;
  totalPassengers: number;
  orderStatus: string;
  createdAt: string;
  vehicleType: {
    name: string;
  };
}

interface OrderTableProps {
  orders: Order[];
}

const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Tidak ada data pesanan untuk ditampilkan
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>
            Tanggal pemesanan
          </TableHead>
          <TableHead>
            Jumlah penumpang
          </TableHead>
          <TableHead>
          Tipe kendaraan
          </TableHead>
          <TableHead>
            Status
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.fullName}</TableCell>
            <TableCell>
              {format(new Date(order.createdAt), "dd MMMM yyyy")}
            </TableCell>
            <TableCell>{order.totalPassengers}</TableCell>
            <TableCell>{order.vehicleType.name}</TableCell>
            <TableCell>
              <Badge>{order.orderStatus}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OrderTable;
