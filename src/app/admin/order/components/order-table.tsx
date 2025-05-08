"use client";

import React, { useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";
import OrderDetail from "./order-detail";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

interface DestinationsItem {
  dest: string;
  dateTime: string;
}

interface Item {
  id: string;
  name: string;
  orderType: string;
  vehicle: string;
  destinations: DestinationsItem[];
  paymentStatus: string;
  payment: { total: number; paid: number };
  status: string;
  createdAt: string;
}

interface OrderTableProps {
  data: Item[];
}

const OrderTable: React.FC<OrderTableProps> = ({ data }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null); // track which row's dropdown is open
  const [openSheet, setOpenSheet] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLongPressStart = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      setOpenDropdown(id); // open the dropdown for the specific row
    }, 800);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleDropdownToggle = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id)); // toggle dropdown for this row
  };

  const handleSheetToggle = (id: string) => {
    setOpenSheet((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <Table className="mt-2">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead className="pl-2 pr-6">Tanggal pemesanan</TableHead>
            <TableHead className="pl-2 pr-6">Nama</TableHead>
            <TableHead className="pl-2 pr-6">Tipe pesanan</TableHead>
            <TableHead className="pl-2 pr-6">Kendaraan</TableHead>
            <TableHead className="pl-2 pr-6">Total</TableHead>
            <TableHead className="pl-2 pr-6">Status pembayaran</TableHead>
            <TableHead className="pl-2 pr-6">Status pesanan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            return (
              <React.Fragment key={index}>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      onMouseDown={() => handleLongPressStart(row.id)}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                      onTouchStart={() => handleLongPressStart(row.id)}
                      onTouchEnd={handleLongPressEnd}
                      className="relative transition duration-200 active:scale-99 cursor-pointer items-start"
                    >
                      <TableCell className="font-medium">{index + 1}</TableCell>

                      {/* Full Name */}
                      <TableCell>{row.createdAt}</TableCell>

                      {/* Full Name */}
                      <TableCell>{row.name}</TableCell>

                      {/* Order Type */}
                      <TableCell>
                        <span className="capitalize">{row.orderType}</span>
                      </TableCell>

                      {/* Vehicle */}
                      <TableCell>{!row.vehicle ? "-" : row.vehicle}</TableCell>

                      {/* Status Payment */}
                      <TableCell>
                        <span className="font-semibold">
                          {row.payment.total.toLocaleString("id", {
                            style: "currency",
                            currency: "IDR",
                          })}
                        </span>
                      </TableCell>

                      {/* Status Payment */}
                      <TableCell>
                        <Badge className="block first-letter:uppercase">
                          {row.paymentStatus}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge className="block first-letter:uppercase">
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => handleSheetToggle(row.id)}>
                      Lihat detail
                    </ContextMenuItem>
                    <ContextMenuItem>Edit</ContextMenuItem>
                    <ContextMenuItem>Hapus</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>

                <OrderDetail
                  id={row.id}
                  openSheet={openSheet}
                  handleSheetToggle={handleSheetToggle}
                />

                <Drawer
                  open={openDropdown === row.id}
                  onOpenChange={() => handleDropdownToggle(row.id)}
                >
                  <DrawerContent>
                    <div className="flex flex-col gap-y-2 p-4">
                      <Button
                        variant="outline"
                        onClick={() => handleSheetToggle(row.id)}
                      >
                        Lihat detail
                      </Button>
                      <Button variant="outline">Edit</Button>
                      <Button variant="outline">Hapus</Button>
                    </div>
                  </DrawerContent>
                </Drawer>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default OrderTable;
