"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { orderTypes, vehicleTypes } from "../data/data";
import { Order } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Order>[] = [
	{
		accessorKey: "user",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Pemesan" />
		),
		cell: ({ row }) => {
			const user = row.original.user;

			return (
				<div className="w-[125px] max-w-[125px] flex flex-col gap-y-0.5">
					<div className="text-sm font-medium text-gray-900">
						{user.fullName}
					</div>
					<div className="text-xs text-gray-500">
						{user.phoneNumber || user.email}
					</div>
				</div>
			);
		},
		enableSorting: true,
		enableHiding: false,
		filterFn: (row, id, value) => {
			return (
				row.original.user.fullName
					.toLowerCase()
					.includes(value.toLowerCase()) ||
				(row.original.user.phoneNumber
					?.toLowerCase()
					.includes(value.toLowerCase()) || "") ||
				row.original.user.email.toLowerCase().includes(value.toLowerCase())
			);
		},
	},
	{
		accessorKey: "orderType", // Change from 'route' to 'orderType'
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Route" />
		),
		cell: ({ row }) => {
			const order = row.original;
			const orderType = orderTypes.find(
				(type) => type.value === order.orderType
			);

			// Generate route info based on order type
			let routeInfo = "";
			if (order.orderType === "TRANSPORT" && order.transportation) {
				const destinations = order.transportation.destinations;
				const pickupLocations = destinations.filter(
					(dest) => dest.isPickupLocation
				);
				const dropLocations = destinations.filter(
					(dest) => !dest.isPickupLocation
				);

				if (pickupLocations.length > 0 && dropLocations.length > 0) {
					const firstPickup = pickupLocations[0].address.split(",")[0];
					const lastDrop = dropLocations[dropLocations.length - 1]
						.address.split(",")[0];
					routeInfo = `${firstPickup} → ${lastDrop}`;
				}
			}

			return (
				<div className="flex flex-col space-y-1">
					<div className="flex items-center space-x-2">
						{orderType && <Badge variant="outline">{orderType.label}</Badge>}
					</div>
					<span className="max-w-[300px] truncate text-sm text-gray-600">
						{routeInfo || "No route info"}
					</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "vehicleInfo",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Kendaraan" />
		),
		cell: ({ row }) => {
			const order = row.original;
			let vehicleInfo = "-";

			if (order.orderType === "TRANSPORT" && order.transportation) {
				vehicleInfo = `${order.transportation.vehicleCount} unit`;
			}

			return <div className="w-[80px]">{vehicleInfo}</div>;
		},
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "distance",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Jarak" />
		),
		cell: ({ row }) => {
			const order = row.original;
			let distance = "-";

			if (order.orderType === "TRANSPORT" && order.transportation) {
				const km = (order.transportation.totalDistance / 1000).toFixed(1);
				distance = `${km} km`;
			}

			return <div className="w-[80px]">{distance}</div>;
		},
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Tanggal Dibuat" />
		),
		cell: ({ row }) => {
			const date = new Date(row.original.createdAt);
			return (
				<div className="w-[100px]">
					{format(date, "dd MMM yyyy", { locale: id })}
				</div>
			);
		},
	},
	{
		accessorKey: "orderStatus",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status Pesanan" />
		),
		cell: ({ row }) => {
			const orderStatus = row.original.orderStatus;

			// Map order status to display status
			const statusMap: {
				[key: string]: {
					label: string;
					variant: "default" | "secondary" | "destructive" | "outline";
				};
			} = {
				PENDING: { label: "Menunggu", variant: "outline" },
				CONFIRMED: { label: "Dikonfirmasi", variant: "default" },
				CANCELED: { label: "Dibatalkan", variant: "destructive" },
				COMPLETED: { label: "Selesai", variant: "secondary" },
				REFUNDED: { label: "Dikembalikan", variant: "outline" },
			};

			const status =
				statusMap[orderStatus] || {
					label: orderStatus,
					variant: "outline" as const,
				};

			return (
				<div className="flex w-[100px] items-center">
					<Badge variant={status.variant}>{status.label}</Badge>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "paymentStatus",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status Pembayaran" />
		),
		cell: ({ row }) => {
			const paymentStatus = row.original.payment?.paymentStatus;

			// Map payment status to display status
			const statusMap: {
				[key: string]: {
					label: string;
					variant: "default" | "secondary" | "destructive" | "outline";
				};
			} = {
				PENDING: { label: "Menunggu", variant: "outline" },
				APPROVED: { label: "Disetujui", variant: "default" },
				REJECTED: { label: "Ditolak", variant: "destructive" },
			};

			const status =
				statusMap[paymentStatus || ""] || {
					label: paymentStatus || "Belum ada",
					variant: "outline" as const,
				};

			return (
				<div className="flex w-[100px] items-center">
					<Badge variant={status.variant}>{status.label}</Badge>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.original.payment?.paymentStatus || "");
		},
	},
	{
		accessorKey: "roundTrip",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Tipe Perjalanan" />
		),
		cell: ({ row }) => {
			const order = row.original;
			let tripType = "-";

			if (order.orderType === "TRANSPORT" && order.transportation) {
				tripType = order.transportation.roundTrip
					? "Pulang Pergi"
					: "Sekali Jalan";
			}

			return (
				<div className="flex items-center">
					<Badge variant="outline">{tripType}</Badge>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "vehicleType",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Jenis Kendaraan" />
		),
		cell: ({ row }) => {
			const order = row.original;
			let vehicle = "-";

			if (order.vehicleType && order.vehicleType.name) {
				// Cari label dari vehicleTypes jika ada
				const vt = vehicleTypes.find(
					(type) => type.label.toLowerCase() === order.vehicleType.name.toLowerCase()
				);
				vehicle = vt ? vt.label : order.vehicleType.name;
			}

			return (
				<div className="flex items-center">
					<Badge variant="outline">{vehicle}</Badge>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			// Filter berdasarkan nama kendaraan jika ada
			const vt = vehicleTypes.find(
				(type) => type.label.toLowerCase() === row.original.vehicleType?.name?.toLowerCase()
			);
			const label = vt ? vt.label : row.original.vehicleType?.name;
			return value.includes(label);
		},
	},
];