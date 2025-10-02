"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { Order } from "../data/schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { FlagTriangleRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useMediaQuery } from "@/hooks/use-media-query";
import { UploadPaymentDialog } from "./upload-payment-dialog";
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Star } from "lucide-react"; // Add this import

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSearch: (value: string) => void;
  onOrderTypeFilter: (values: string[]) => void;
  onOrderStatusFilter: (values: string[]) => void;
  onVehicleTypeFilter: (values: string[]) => void;
  onPaymentStatusFilter: (values: string[]) => void;
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  searchValue?: string; // Add this prop
  orderTypeFilter: string[];
  orderStatusFilter: string[];
  vehicleTypeFilter: string[];
  paymentStatusFilter: string[];
  vehicleTypes: { value: string; label: string }[];
}

interface ReviewFormData {
  rating: string;
  content: string;
}

interface ReviewPayload {
  orderId: string;
  rating: number;
  content: string;
}

export function DataTable<TData extends Order, TValue>({
  columns,
  data,
  onSearch,
  onOrderTypeFilter,
  onOrderStatusFilter,
  onVehicleTypeFilter,
  onPaymentStatusFilter,
  pagination,
  searchValue = "", // Add default value
  orderTypeFilter = [],
  orderStatusFilter = [],
  vehicleTypeFilter = [],
  paymentStatusFilter = [],
  vehicleTypes,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedRow, setSelectedRow] = React.useState<TData | null>(null);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = React.useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = React.useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
  const [isPaymentProofDialogOpen, setIsPaymentProofDialogOpen] =
    React.useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const form = useForm<ReviewFormData>();
  const queryClient = useQueryClient();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        });
        pagination.onPageChange(newState.pageIndex);
        if (newState.pageSize !== pagination.pageSize) {
          pagination.onPageSizeChange(newState.pageSize);
        }
      }
    },
    pageCount: pagination.pageCount,
    manualPagination: true, // Enable manual pagination
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const reviewMutation = useMutation({
    mutationFn: (payload: ReviewPayload) => axios.post("/api/reviews", payload),
    onSuccess: () => {
      toast.success("Penilaian berhasil dikirim");
      setIsReviewDialogOpen(false);
      form.reset();
      // Invalidate dan refetch data orders
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Gagal mengirim penilaian");
    },
  });

  // Tambahkan di bagian mutations
  const updateReviewMutation = useMutation({
    mutationFn: (payload: ReviewPayload) =>
      axios.put(`/api/reviews/${selectedRow?.review?.id}`, {
        rating: payload.rating,
        content: payload.content,
      }),
    onSuccess: () => {
      toast.success("Penilaian berhasil diperbarui");
      setIsReviewDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Gagal memperbarui penilaian");
    },
  });

  const handleLongPressStart = (row: TData) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedRow(row);
      setIsActionDrawerOpen(true);
    }, 800);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleViewDetail = (row: TData) => {
    setSelectedRow(row);
    setIsActionDrawerOpen(false);
    if (isDesktop) {
      setSheetOpen(true);
    } else {
      setIsDetailDrawerOpen(true);
    }
  };

  const handleConfirmCancel = () => {
    if (selectedRow) {
      console.log("Canceling order:", selectedRow);
      // Implement cancel logic here (API call)
      setIsDeleteDrawerOpen(false);
      setSelectedRow(null);
    }
  };

  const handleUploadPayment = (row: TData) => {
    setSelectedRow(row);
    setIsActionDrawerOpen(false);
    setIsUploadDialogOpen(true);
  };

  const handleViewPaymentProof = (row: TData) => {
    setSelectedRow(row);
    setIsActionDrawerOpen(false);
    setIsPaymentProofDialogOpen(true);
  };

  const handleUploadSuccess = () => {
    // Refresh data or update UI as needed
    toast.success("Pembayaran berhasil diupload");
  };

  const handleSubmitReview = async (data: ReviewFormData) => {
    if (!selectedRow) return;

    if (selectedRow.review) {
      // Update existing review
      updateReviewMutation.mutate({
        orderId: selectedRow.id,
        rating: parseInt(data.rating),
        content: data.content,
      });
    } else {
      // Create new review
      reviewMutation.mutate({
        orderId: selectedRow.id,
        rating: parseInt(data.rating),
        content: data.content,
      });
    }
  };

  const handleOpenReview = (row: TData) => {
    setSelectedRow(row);
    setIsActionDrawerOpen(false);
    if (row.review) {
      form.setValue("rating", String(row.review.rating));
      form.setValue("content", row.review.content);
    }
    setIsReviewDialogOpen(true);
  };

  const renderOrderDetails = (order: Order) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-gray-500">Order ID</h4>
            <p className="text-sm font-mono">{order.id}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-500">Status</h4>
            <Badge variant="outline">{order.orderStatus}</Badge>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-500">Tipe Order</h4>
            <p className="text-sm">{order.orderType}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-500">
              Tanggal Dibuat
            </h4>
            <p className="text-sm">
              {format(new Date(order.createdAt), "dd MMM yyyy HH:mm", {
                locale: id,
              })}
            </p>
          </div>
        </div>

        {order.orderType === "TRANSPORT" && order.transportation && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-900">
              Detail Transportasi
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-xs text-gray-500">
                  Jumlah Kendaraan
                </h5>
                <p className="text-sm">
                  {order.transportation.vehicleCount} unit
                </p>
              </div>
              <div>
                <h5 className="font-medium text-xs text-gray-500">
                  Tipe Perjalanan
                </h5>
                <p className="text-sm">
                  {order.transportation.roundTrip
                    ? "Pulang Pergi"
                    : "Sekali Jalan"}
                </p>
              </div>
              <div className="col-span-2">
                <h5 className="font-medium text-xs text-gray-500">
                  Total Jarak
                </h5>
                <p className="text-sm">
                  {(order.transportation.totalDistance / 1000).toFixed(1)} km
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-xs text-gray-500 mb-2">
                Destinasi
              </h5>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {order.transportation.destinations
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((dest) => (
                    <div
                      key={dest.id}
                      className="text-xs bg-gray-50 p-2 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            dest.isPickupLocation ? "default" : "secondary"
                          }
                          className="text-xs px-1"
                        >
                          {dest.isPickupLocation ? "Pickup" : "Drop"}
                        </Badge>
                        <span className="font-medium">{dest.arrivalTime}</span>
                      </div>
                      <p className="mt-1 text-gray-600">{dest.address}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    try {
      if (!dateString) return "Invalid date";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return format(date, "EEEE, d MMMM yyyy 'pukul' HH:mm", { locale: id });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const formatTimeOnly = (dateString: string | null | undefined) => {
    try {
      if (!dateString) return "Invalid time";
      // Jika arrivalTime hanya berupa jam (misal: "14:00" atau "14:00:00")
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateString)) {
        // Tambahkan WIB jika belum ada
        return `${dateString.slice(0, 5)} WIB`;
      }
      // Jika arrivalTime berupa ISO string
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // fallback: tampilkan apa adanya
      }
      return format(date, "HH:mm 'WIB'", { locale: id });
    } catch (error) {
      console.error("Time formatting error:", error);
      return dateString || "Invalid time";
    }
  };

  const renderOrderDetailContent = (order: Order) => {
    const groupDestinationsByDate = (
      destinations: NonNullable<Order["transportation"]>["destinations"]
    ) => {
      const groups = destinations.reduce(
        (acc, dest) => {
          // Handle case where departureDate might be null/undefined
          const date = dest.departureDate
            ? dest.departureDate.split("T")[0]
            : "unknown";
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(dest);
          return acc;
        },
        {} as Record<string, typeof destinations>
      );

      // Sort destinations within each group by sequence
      Object.keys(groups).forEach((date) => {
        groups[date].sort((a, b) => a.sequence - b.sequence);
      });

      return groups;
    };

    const orderStatusMap: {
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

    const paymentStatusMap: {
      [key: string]: {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      };
    } = {
      PENDING: { label: "Menunggu", variant: "outline" },
      APPROVED: { label: "Disetujui", variant: "default" },
      REJECTED: { label: "Ditolak", variant: "destructive" },
    };

    const orderStatus = orderStatusMap[order.orderStatus] || {
      label: order.orderStatus,
      variant: "outline" as const,
    };

    const paymentStatus = paymentStatusMap[
      order.payment?.paymentStatus || ""
    ] || {
      label: order.payment?.paymentStatus || "Belum ada",
      variant: "outline" as const,
    };

    const pkgOrder = order.packageOrder as {
      package: {
        is_private: boolean;
        name: string;
        photoUrl: { url: string }[];
      };
      departureDate: Date;
      people?: number;
    };

    return (
      <div className="p-4 pt-0 overflow-y-auto">
        <div className="flex items-start gap-x-10 w-full whitespace-nowrap overflow-x-auto">
          {/* Created At */}
          <div className="flex flex-col gap-y-4">
            <p className="text-xs text-[#6A6A6A]">Tanggal pemesanan</p>
            <p className="text-sm">{formatDate(order.createdAt)}</p>
          </div>

          {/* Order Status */}
          <div className="flex flex-col gap-y-4">
            <p className="text-xs text-[#6A6A6A]">Status pesanan</p>
            <Badge variant={orderStatus.variant}>{orderStatus.label}</Badge>
          </div>

          {/* Payment Status */}
          <div className="flex flex-col gap-y-4">
            <p className="text-xs text-[#6A6A6A]">Status pembayaran</p>
            <Badge variant={paymentStatus.variant}>{paymentStatus.label}</Badge>
          </div>

          {/* Order Type */}
          <div className="flex flex-col gap-y-4">
            <p className="text-xs text-[#6A6A6A]">Tipe</p>
            <Badge className="block first-letter:uppercase">
              {order.orderType}
            </Badge>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Customer */}
        <div className="flex flex-col gap-y-4">
          <p className="text-xs text-[#6A6A6A]">Pemesan</p>
          <div className="flex flex-col gap-y-2">
            <p className="text-sm">{order.fullName}</p>
            <p className="text-sm">{order.email}</p>
            <p className="text-sm">{order.phoneNumber}</p>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Total Price */}
        <div className="flex flex-col gap-y-4">
          <p className="text-xs text-[#6A6A6A]">Total biaya</p>
          <div className="text-lg font-semibold">
            {order.payment?.totalPrice !== undefined
              ? new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(Number(order.payment.totalPrice))
              : "-"}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Destination for Transport orders */}
        {order.orderType === "TRANSPORT" && order.transportation ? (
          <div className="flex flex-col gap-y-4">
            <p className="text-xs text-[#6A6A6A]">Destinasi (Transport)</p>

            <div className="flex flex-col max-h-96 overflow-y-auto divide-y">
              {Object.entries(
                groupDestinationsByDate(order.transportation.destinations)
              )
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .filter(([date]) => date !== "unknown")
                .map(([date, destinations]) => (
                  <div key={date} className="py-4 first:pt-0 last:pb-0">
                    <h3 className="text-sm font-medium text-gray-900 sticky top-0 bg-white py-2 mb-4">
                      {format(new Date(date), "EEEE, d MMMM yyyy", {
                        locale: id,
                      })}
                    </h3>

                    <div className="flex flex-col space-y-4">
                      {destinations.map((dest, index) => (
                        <div
                          key={dest.id}
                          className="flex items-stretch gap-x-3.5"
                        >
                          <div className="w-6 flex flex-col items-center pt-1">
                            <span className="inline-flex justify-center items-center border border-dashed rounded-full p-1 border-black">
                              {dest.isPickupLocation ? (
                                <FlagTriangleRight size={14} />
                              ) : (
                                <span className="w-3.5 h-3.5 flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </span>
                              )}
                            </span>
                            {index < destinations.length - 1 && (
                              <div className="h-full pt-1">
                                <Separator orientation="vertical" />
                              </div>
                            )}
                          </div>

                          <div className="inline-flex flex-col flex-1">
                            <p className="text-sm font-medium line-clamp-2">
                              {dest.address}
                            </p>
                            <p className="text-xs text-[#6A6A6A]">
                              {dest.isPickupLocation
                                ? "Lokasi penjemputan"
                                : `Lokasi ${index + 1}`}
                            </p>
                            <p className="text-xs text-[#6A6A6A] mt-1">
                              {formatTimeOnly(dest.arrivalTime)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-y-4">
            <p className="text-xs text-[#6A6A6A]">
              Paket Wisata (
              {pkgOrder.package.is_private === true
                ? "PRIVATE TRIP"
                : "OPEN TRIP"}
              )
            </p>

            <div className="flex items-start gap-x-2 overflow-y-auto divide-y">
              <div className="overflow-hidden rounded-lg">
                <Image
                  src={pkgOrder.package.photoUrl[0].url}
                  alt={pkgOrder.package.photoUrl[0].url}
                  width={400}
                  height={240}
                  className="h-24 aspect-3/2 w-auto object-cover"
                />
              </div>

              <div className="space-y-0.5">
                <div className="text-sm font-medium leading-none line-clamp-2">
                  {pkgOrder.package.name}
                </div>

                {pkgOrder.package.is_private === true ? (
                  <>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Tanggal keberangkatan:{" "}
                      {format(pkgOrder.departureDate, "dd MMM yyyy", {
                        locale: id,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Jumlah orang: {pkgOrder.people}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Tanggal keberangkatan:{" "}
                    {format(pkgOrder.departureDate, "dd MMM yyyy", {
                      locale: id,
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Separator className="my-8" />

        {/* Review Section */}
        {order.orderStatus === "COMPLETED" && (
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#6A6A6A]">Penilaian</p>
              {order.review ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenReview(order as TData)}
                >
                  Edit Penilaian
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenReview(order as TData)}
                >
                  Beri Penilaian
                </Button>
              )}
            </div>

            {order.review ? (
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-x-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < order.review!.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }
                    />
                  ))}
                  <span className="text-sm ml-2">{order.review.rating}/5</span>
                </div>
                <p className="text-sm mt-2">{order.review.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {format(
                    new Date(order.review.createdAt),
                    "dd MMM yyyy HH:mm",
                    {
                      locale: id,
                    }
                  )}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Belum ada penilaian</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const StarRating = ({
    rating,
    onRatingChange,
  }: {
    rating: number;
    onRatingChange: (rating: number) => void;
  }) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 focus:outline-none"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => onRatingChange(star)}
          >
            <Star
              size={24}
              className={`transition-all ${
                (hoverRating || rating) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        onSearch={onSearch}
        searchValue={searchValue}
        orderTypeFilter={orderTypeFilter}
        orderStatusFilter={orderStatusFilter}
        vehicleTypeFilter={vehicleTypeFilter}
        paymentStatusFilter={paymentStatusFilter}
        onOrderTypeFilter={onOrderTypeFilter}
        onOrderStatusFilter={onOrderStatusFilter}
        onVehicleTypeFilter={onVehicleTypeFilter}
        onPaymentStatusFilter={onPaymentStatusFilter}
        vehicleTypes={vehicleTypes}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <ContextMenu key={row.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      onMouseDown={() => handleLongPressStart(row.original)}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                      onTouchStart={() => handleLongPressStart(row.original)}
                      onTouchEnd={handleLongPressEnd}
                      className="relative cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => handleViewDetail(row.original)}
                    >
                      Lihat detail
                    </ContextMenuItem>
                    {row.original.payment?.proofUrl ? (
                      <ContextMenuItem
                        onClick={() => handleViewPaymentProof(row.original)}
                      >
                        Lihat bukti pembayaran
                      </ContextMenuItem>
                    ) : (
                      <ContextMenuItem
                        onClick={() => handleUploadPayment(row.original)}
                      >
                        Upload bukti pembayaran
                      </ContextMenuItem>
                    )}
                    {row.original.orderStatus === "COMPLETED" &&
                      !row.original.review && (
                        <ContextMenuItem
                          onClick={() => handleOpenReview(row.original)}
                        >
                          Beri penilaian
                        </ContextMenuItem>
                      )}
                    {row.original.orderStatus === "COMPLETED" &&
                      row.original.review && (
                        <ContextMenuItem disabled>
                          Sudah diberi penilaian
                        </ContextMenuItem>
                      )}
                  </ContextMenuContent>
                </ContextMenu>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada pesanan ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        totalCount={pagination.pageCount * pagination.pageSize}
      />

      {/* Action Drawer for Mobile */}
      <Drawer open={isActionDrawerOpen} onOpenChange={setIsActionDrawerOpen}>
        <DrawerContent>
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => selectedRow && handleViewDetail(selectedRow)}
            >
              Lihat Detail
            </Button>
            {selectedRow?.payment?.proofUrl ? (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() =>
                  selectedRow && handleViewPaymentProof(selectedRow)
                }
              >
                Lihat bukti pembayaran
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => selectedRow && handleUploadPayment(selectedRow)}
              >
                Upload bukti pembayaran
              </Button>
            )}
            {selectedRow?.orderStatus === "COMPLETED" &&
              !selectedRow?.review && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => selectedRow && handleOpenReview(selectedRow)}
                >
                  Beri penilaian
                </Button>
              )}
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full justify-start">
                Batal
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer open={isDetailDrawerOpen} onOpenChange={setIsDetailDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Detail Pesanan</DrawerTitle>
            <DrawerDescription>
              Informasi lengkap tentang pesanan Anda
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {selectedRow && renderOrderDetails(selectedRow as Order)}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Tutup</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Cancel Confirmation Drawer */}
      <Drawer open={isDeleteDrawerOpen} onOpenChange={setIsDeleteDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Batalkan Pesanan</DrawerTitle>
            <DrawerDescription>
              Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini
              tidak dapat dibatalkan.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Batalkan Pesanan
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Batal</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Upload Payment Dialog */}
      {selectedRow && (
        <UploadPaymentDialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          paymentId={selectedRow.payment.id}
          amount={selectedRow.payment.totalPrice}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Payment Proof Dialog */}
      <Dialog
        open={isPaymentProofDialogOpen}
        onOpenChange={setIsPaymentProofDialogOpen}
      >
        <DialogContent className="sm:max-w-xl max-h-[calc(100dvh-5rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          {selectedRow?.payment?.proofUrl ? (
            <>
              <div className="text-sm space-y-1">
                {selectedRow.payment.senderName && (
                  <div>
                    <span className="font-medium">Nama Pengirim: </span>
                    {selectedRow.payment.senderName}
                  </div>
                )}
                {selectedRow.payment.transferDate && (
                  <div>
                    <span className="font-medium">Tanggal Transfer: </span>
                    {format(
                      new Date(selectedRow.payment.transferDate),
                      "dd MMM yyyy",
                      { locale: id }
                    )}
                  </div>
                )}
                {selectedRow.payment.note && (
                  <div
                    className={`mt-2 border rounded-md p-3 ${
                      selectedRow.payment.paymentStatus === "REJECTED"
                        ? "bg-red-100 border-red-200"
                        : ""
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        selectedRow.payment.paymentStatus === "REJECTED"
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      Catatan:{" "}
                    </span>
                    <p
                      className={`mt-1 text-sm ${
                        selectedRow.payment.paymentStatus === "REJECTED"
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {selectedRow.payment.note}
                    </p>
                  </div>
                )}
              </div>
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src={selectedRow.payment.proofUrl}
                  alt="Bukti pembayaran"
                  fill
                  className="object-contain"
                />
              </div>
            </>
          ) : (
            <div className="text-sm text-center text-muted-foreground py-8">
              Belum memberikan bukti pembayaran
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRow?.review ? "Edit Penilaian" : "Beri Penilaian"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmitReview)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Rating</Label>
              <StarRating
                rating={Number(form.watch("rating")) || 0}
                onRatingChange={(value) =>
                  form.setValue("rating", String(value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Komentar</Label>
              <Textarea
                {...form.register("content")}
                placeholder="Tulis komentar Anda disini..."
              />
            </div>
            <Button
              disabled={
                reviewMutation.isPending || updateReviewMutation.isPending
              }
              type="submit"
              className="w-full"
            >
              {reviewMutation.isPending || updateReviewMutation.isPending ? (
                <span className="border-y-2 border-white w-4 h-4 rounded-full animate-spin" />
              ) : selectedRow?.review ? (
                "Perbarui Penilaian"
              ) : (
                "Kirim Penilaian"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Desktop Sheet */}
      {isDesktop && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-[384px] sm:max-w-full sm:w-[576px]">
            <SheetHeader>
              <SheetTitle>Detail pesanan</SheetTitle>
            </SheetHeader>
            {selectedRow && renderOrderDetailContent(selectedRow)}
          </SheetContent>
        </Sheet>
      )}

      {/* Mobile Drawer */}
      {!isDesktop && (
        <Drawer open={isDetailDrawerOpen} onOpenChange={setIsDetailDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Detail Pesanan</DrawerTitle>
            </DrawerHeader>
            {selectedRow && renderOrderDetailContent(selectedRow)}
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Tutup</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
