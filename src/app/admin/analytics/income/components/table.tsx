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

interface Order {
  id: string;
  orderStatus: string;
  fullName: string;
  createdAt: string;
  payment: {
    totalPrice: string;
  };
  vehicleType: {
    name: string;
  };
}

interface OrderTableProps {
  orders?: Order[];
}

const OrderTable: React.FC<OrderTableProps> = ({ orders = [] }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Tidak ada data pendapatan untuk ditampilkan
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Tanggal pemesanan</TableHead>
          <TableHead>Total harga</TableHead>
          <TableHead>Jenis Kendaraan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.fullName}</TableCell>
            <TableCell>
              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </TableCell>
            <TableCell>
              {parseInt(order.payment.totalPrice).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </TableCell>
            <TableCell>{order.vehicleType.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OrderTable;
