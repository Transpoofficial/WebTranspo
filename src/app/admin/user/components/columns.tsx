"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { User } from "../data/schema"
import { DataTableColumnHeader } from "./data-table-column-header"

export const columns: ColumnDef<User>[] = [
	{
		accessorKey: "fullName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Nama" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex items-center gap-2">
					<span className="max-w-[500px] truncate font-medium">
						{row.getValue("fullName")}
					</span>
				</div>
			)
		},
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "email",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Email" />
		),
		cell: ({ row }) => {
			return (
				<div className="w-[200px] max-w-[200px] truncate">
					{row.getValue("email")}
				</div>
			)
		},
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "phoneNumber",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="No. Telepon" />
		),
		cell: ({ row }) => {
			return (
				<div className="w-[120px]">
					{row.getValue("phoneNumber") || "-"}
				</div>
			)
		},
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "role",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Role" />
		),
		cell: ({ row }) => {
			const role = row.getValue("role") as string
			return (
				<div className="w-[100px]">
					<Badge variant="outline" className="capitalize">
						{role.toLowerCase().replace("_", " ")}
					</Badge>
				</div>
			)
		},
		enableSorting: false,
		enableHiding: false,
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id))
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Tanggal Dibuat" />
		),
		cell: ({ row }) => {
			return (
				<div className="w-[100px]">
					{format(new Date(row.getValue("createdAt")), "dd MMM yyyy", {
						locale: id,
					})}
				</div>
			)
		},
		enableSorting: false,
		enableHiding: false,
	},
]
