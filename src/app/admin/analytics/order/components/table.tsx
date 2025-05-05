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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Ellipsis } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const OrderTable = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null); // track which row's dropdown is open
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

  // Table data
  const data = [
    {
      id: "INV001",
      name: "Juhari",
      date: "20 Februari 2025",
      location: "Malang",
      destination: "Surabaya",
      passengers: 10,
      vehicle: "Elf",
      status: "Pending",
    },
    {
      id: "INV002",
      name: "Fathan",
      date: "25 Februari 2025",
      location: "Surabaya",
      destination: "Jakarta",
      passengers: 17,
      vehicle: "Elf",
      status: "Success",
    },
  ];

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden"></TableHead>
            <TableHead>ID Pesanan</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead className="hidden md:table-cell">
              Tanggal Keberangkatan
            </TableHead>
            <TableHead className="hidden md:table-cell">
              Lokasi Penjemputan
            </TableHead>
            <TableHead className="hidden md:table-cell">
              Destinasi Utama
            </TableHead>
            <TableHead className="hidden md:table-cell">
              Jumlah Penumpang
            </TableHead>
            <TableHead className="hidden md:table-cell">
              Jenis Kendaraan
            </TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, key) => {
            return (
              <ContextMenu key={key}>
                <ContextMenuTrigger asChild>
                  <TableRow
                    onMouseDown={() => handleLongPressStart(row.id)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd} // Batalkan jika mouse keluar dari row
                    onTouchStart={() => handleLongPressStart(row.id)}
                    onTouchEnd={handleLongPressEnd}
                    className="relative transition duration-200 active:scale-99 cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      INV001
                      {/* Action Menu */}
                      <div className="absolute top-0 left-0">
                        {/* Dropdown menu for Mobile */}
                        <DropdownMenu
                          open={openDropdown === row.id} // Open dropdown for the active row
                          onOpenChange={() => handleDropdownToggle(row.id)} // Toggle dropdown visibility
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0"
                            >
                              <Ellipsis />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="bottom"
                            align="start"
                            className="z-50"
                          >
                            <DropdownMenuItem
                              onClick={() => setOpenDropdown(null)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setOpenDropdown(null)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setOpenDropdown(null)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                    <TableCell>Juhari</TableCell>
                    <TableCell className="hidden md:table-cell">
                      20 Februari 2025
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      Malang
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      Surabaya
                    </TableCell>
                    <TableCell className="hidden md:table-cell">10</TableCell>
                    <TableCell className="hidden md:table-cell">Elf</TableCell>
                    <TableCell>
                      <Badge>Pending</Badge>
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>Profile</ContextMenuItem>
                  <ContextMenuItem>Billing</ContextMenuItem>
                  <ContextMenuItem>Team</ContextMenuItem>
                  <ContextMenuItem>Subscription</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default OrderTable;
