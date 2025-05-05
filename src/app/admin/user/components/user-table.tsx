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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const UserTable = () => {
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
      fullName: "Fathan Alfariel Adhyaksa",
      role: "Admin",
      email: "example123@gmail.com"
    },
    {
      id: "INV002",
      fullName: "Fathan Alfariel Adhyaksa",
      role: "Super admin",
      email: "example456@gmail.com"
    },
    {
      id: "INV003",
      fullName: "Fathan Alfariel Adhyaksa",
      role: "Customer",
      email: "example789@gmail.com"
    },
  ];

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/12">#</TableHead>
            <TableHead className="w-3/12">Nama lengkap</TableHead>
            <TableHead className="w-3/12">Role</TableHead>
            <TableHead className="w-full">Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            return (
              <ContextMenu key={index}>
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
                      {index + 1}

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
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setOpenDropdown(null)}
                            >
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                    <TableCell>{row.fullName}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>{row.email}</TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>Edit</ContextMenuItem>
                  <ContextMenuItem>Hapus</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default UserTable;
