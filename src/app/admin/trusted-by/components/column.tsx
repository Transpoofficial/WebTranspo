"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TrustedBy } from "../data/schema";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const columns: ColumnDef<TrustedBy>[] = [
  {
    accessorKey: "displayOrder",
    header: "Order",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.displayOrder}</div>;
    },
  },
  {
    accessorKey: "logoUrl",
    header: "Logo",
    cell: ({ row }) => {
      return (
        <Image
          src={row.original.logoUrl}
          alt={row.original.name}
          width={50}
          height={50}
          className="h-12 w-auto object-contain"
        />
      );
    },
  },
  {
    accessorKey: "name",
    header: "Partner Name",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.name}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return row.original.isActive ? (
        <Badge variant="default">Active</Badge>
      ) : (
        <Badge variant="secondary">Inactive</Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return format(new Date(row.original.createdAt), "MMM dd, yyyy");
    },
  },
];
