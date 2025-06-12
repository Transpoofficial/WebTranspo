"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArticleSchema } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import Image from "next/image";

export const columns: ColumnDef<ArticleSchema>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Judul" />
    ),
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const mainImgUrl = row.original.mainImgUrl as string;
      return (
        <div className="flex items-center space-x-3 max-w-[500px]">
          <div className="relative w-[60px] h-[40px] flex-shrink-0">
            {mainImgUrl ? (
              <Image
                src={mainImgUrl}
                alt={title || "Article image"}
                fill
                className="object-cover rounded"
                sizes="60px"
                onError={() => (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded text-xs text-gray-500">
                    Failed
                  </div>
                )}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded text-xs text-gray-500">
                No Image
              </div>
            )}
          </div>
          <div className="truncate font-medium">{title}</div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "author",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Penulis" />
    ),
    cell: ({ row }) => {
      const author = row.getValue("author") as { fullName: string };
      return <div className="text-sm">{author.fullName}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal Dibuat" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <>
          {date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </>
      );
    },
  },
];