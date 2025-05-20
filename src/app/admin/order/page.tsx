"use client";

import React from "react";
import OrderTable from "./components/order-table";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Menubar,
  MenubarContent,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

const Order = () => {

  // Table data
  const data = [
    {
      id: "INV001",
      name: "Fathan Alfariel Adhyaksa",
      orderType: "transport",
      vehicle: "HIACE",
      destinations: [
        { dest: "Malang", dateTime: "Senin, 5 May 2025 20:15 WIB" },
        { dest: "Surabaya", dateTime: "Senin, 5 May 2025 20:15 WIB" },
        { dest: "Madura", dateTime: "Rabu, 7 May 2025 08:00 WIB" },
      ],
      paymentStatus: "approved",
      payment: { total: 50000, paid: 25000 },
      status: "pending",
      createdAt: "Rabu, 6 Mei 2025",
    },
    {
      id: "INV002",
      name: "Fathan Alfariel Adhyaksa",
      orderType: "tour",
      vehicle: "",
      destinations: [],
      paymentStatus: "pending",
      payment: { total: 100000, paid: 100000 },
      status: "pending",
      createdAt: "Rabu, 6 Mei 2025",
    },
  ];

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight first:mt-0">Pesanan</h2>

      <div className="mt-4">
        <p className="flex items-center gap-x-2 text-sm font-medium">
          <ListFilter size={16} />
          Filter
        </p>

        <Menubar className="whitespace-nowrap overflow-x-auto overflow-y-hidden mt-2">
          {/* Filter by name */}
          <MenubarMenu>
            <MenubarTrigger>Nama</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Nama</MenubarLabel>
              <MenubarSeparator />

              <Input type="text" />

              <MenubarSeparator />
              <div className="flex justify-end">
                <Button>Terapkan</Button>
              </div>
            </MenubarContent>
          </MenubarMenu>

          {/* Filter by order type */}
          <MenubarMenu>
            <MenubarTrigger>Tipe pesanan</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Tipe pesanan</MenubarLabel>
              <MenubarSeparator />

              <MenubarRadioGroup value="transport">
                <MenubarRadioItem value="transport">Transport</MenubarRadioItem>
                <MenubarRadioItem value="tour">Tour</MenubarRadioItem>
              </MenubarRadioGroup>

              <MenubarSeparator />
              <div className="flex justify-end">
                <Button>Terapkan</Button>
              </div>
            </MenubarContent>
          </MenubarMenu>

          {/* Filter by vehicle */}
          <MenubarMenu>
            <MenubarTrigger>Kendaraan</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Kendaraan</MenubarLabel>
              <MenubarSeparator />

              <MenubarRadioGroup value="angkot">
                <MenubarRadioItem value="angkot">Angkot</MenubarRadioItem>
                <MenubarRadioItem value="elf">Elf</MenubarRadioItem>
                <MenubarRadioItem value="hiace">HIACE</MenubarRadioItem>
              </MenubarRadioGroup>

              <MenubarSeparator />
              <div className="flex justify-end">
                <Button>Terapkan</Button>
              </div>
            </MenubarContent>
          </MenubarMenu>

          {/* Filter by payment status */}
          <MenubarMenu>
            <MenubarTrigger>Status pembayaran</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Status pembayaran</MenubarLabel>
              <MenubarSeparator />

              <MenubarRadioGroup value="pending">
                <MenubarRadioItem value="pending">Pending</MenubarRadioItem>
                <MenubarRadioItem value="approved">Approved</MenubarRadioItem>
                <MenubarRadioItem value="rejected">Rejected</MenubarRadioItem>
                <MenubarRadioItem value="refunded">Refunded</MenubarRadioItem>
              </MenubarRadioGroup>

              <MenubarSeparator />
              <div className="flex justify-end">
                <Button>Terapkan</Button>
              </div>
            </MenubarContent>
          </MenubarMenu>

          {/* Filter by order status */}
          <MenubarMenu>
            <MenubarTrigger>Status pesanan</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Status pesanan</MenubarLabel>
              <MenubarSeparator />

              <MenubarRadioGroup value="pending">
                <MenubarRadioItem value="pending">Pending</MenubarRadioItem>
                <MenubarRadioItem value="confirmed">Confirmed</MenubarRadioItem>
                <MenubarRadioItem value="canceled">Canceled</MenubarRadioItem>
                <MenubarRadioItem value="completed">Completed</MenubarRadioItem>
                <MenubarRadioItem value="refunded">Refunded</MenubarRadioItem>
              </MenubarRadioGroup>

              <MenubarSeparator />
              <div className="flex justify-end">
                <Button>Terapkan</Button>
              </div>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <OrderTable data={data} />
      </div>
    </>
  );
};

export default Order;
