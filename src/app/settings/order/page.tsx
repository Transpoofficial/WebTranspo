"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import axios from "axios";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { Order } from "./data/schema";

interface OrderResponse {
  message: string;
  data: Order[];
  pagination: {
    total: number;
    skip: number;
    limit: number;
    hasMore: boolean;
  };
}

// Update fetchOrders to accept filter parameters
const fetchOrders = async (params: {
  search?: string;
  orderType?: string[];
  orderStatus?: string[];
  vehicleType?: string[];
  paymentStatus?: string[];
  skip?: number;
  limit?: number;
}): Promise<OrderResponse> => {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append("search", params.search);
  if (params.orderType?.length)
    params.orderType.forEach((type) => searchParams.append("orderType", type));
  if (params.orderStatus?.length)
    params.orderStatus.forEach((status) => searchParams.append("orderStatus", status));
  if (params.vehicleType?.length)
    params.vehicleType.forEach((type) => searchParams.append("vehicleType", type));
  if (params.paymentStatus?.length)
    params.paymentStatus.forEach((status) => searchParams.append("paymentStatus", status));

  // Add pagination params
  if (params.skip !== undefined) searchParams.append("skip", params.skip.toString());
  if (params.limit !== undefined) searchParams.append("limit", params.limit.toString());

  const response = await axios.get(`/api/orders?${searchParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export default function OrderPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initialize state from URL params
  const [pageIndex, setPageIndex] = useState(Number(searchParams.get("page")) || 0);
  const [pageSize, setPageSize] = useState(Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string[]>(
    searchParams.getAll("orderType") || []
  );
  const [orderStatusFilter, setOrderStatusFilter] = useState<string[]>(
    searchParams.getAll("orderStatus") || []
  );
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string[]>(
    searchParams.getAll("vehicleType") || []
  );
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string[]>(
    searchParams.getAll("paymentStatus") || []
  );

  const debouncedSearch = useDebounce(search, 1000); // 1 second debounce

  // Function to update URL params
  const updateURLParams = (updates: Record<string, string[] | string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      params.delete(key);
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value !== null) {
        params.set(key, String(value));
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  // Update handlers to modify URL params
  const handleSearch = (value: string) => {
    setSearch(value);
    updateURLParams({ search: value || null });
  };

  const handleOrderTypeFilter = (values: string[]) => {
    setOrderTypeFilter(values);
    updateURLParams({ orderType: values });
  };

  const handleOrderStatusFilter = (values: string[]) => {
    setOrderStatusFilter(values);
    updateURLParams({ orderStatus: values });
  };

  const handleVehicleTypeFilter = (values: string[]) => {
    setVehicleTypeFilter(values);
    updateURLParams({ vehicleType: values });
  };

  const handlePaymentStatusFilter = (values: string[]) => {
    setPaymentStatusFilter(values);
    updateURLParams({ paymentStatus: values });
  };

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    updateURLParams({ page: newPageIndex });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page when changing page size
    updateURLParams({ limit: newPageSize, page: 0 });
  };

  // Query to fetch orders with filters
  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "orders",
      debouncedSearch,
      orderTypeFilter,
      orderStatusFilter,
      vehicleTypeFilter,
      paymentStatusFilter,
      pageIndex,
      pageSize,
    ],
    queryFn: () =>
      fetchOrders({
        search: debouncedSearch,
        orderType: orderTypeFilter,
        orderStatus: orderStatusFilter,
        vehicleType: vehicleTypeFilter,
        paymentStatus: paymentStatusFilter,
        skip: pageIndex * pageSize,
        limit: pageSize,
      }),
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Filter orders by current user's userId
  const userOrders = orderResponse?.data?.filter(
    (order) => order.userId === session?.user?.id
  ) || [];

  // Add vehicle types query
  const { data: vehicleTypes = [] } = useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: async () => {
      const response = await axios.get("/api/vehicle-types");
      return response.data.data.map((type: any) => ({
        value: type.name,
        label: type.name,
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (status === "loading") {
    return (
      <div className="h-full flex-1 flex-col space-y-4">
        <div className="flex items-center justify-center h-24">
          <div className="text-sm text-muted-foreground">Loading session...</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="h-full flex-1 flex-col space-y-4">
        <div className="flex items-center justify-center h-24">
          <div className="text-sm text-muted-foreground">Please log in to view orders.</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex-col space-y-4">
        <div className="flex items-center justify-center h-24">
          <div className="text-sm text-muted-foreground">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex-1 flex-col space-y-4">
        <div className="flex items-center justify-center h-24">
          <div className="text-sm text-red-600">
            Error loading orders: {error instanceof Error ? error.message : "Unknown error"}
          </div>
          <button
            onClick={() => refetch()}
            className="ml-2 text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <DataTable
        data={userOrders}
        columns={columns}
        onSearch={handleSearch}
        searchValue={search}
        orderTypeFilter={orderTypeFilter || []}
        orderStatusFilter={orderStatusFilter || []}
        vehicleTypeFilter={vehicleTypeFilter || []}
        paymentStatusFilter={paymentStatusFilter || []}
        onOrderTypeFilter={handleOrderTypeFilter}
        onOrderStatusFilter={handleOrderStatusFilter}
        onVehicleTypeFilter={handleVehicleTypeFilter}
        onPaymentStatusFilter={handlePaymentStatusFilter}
        vehicleTypes={vehicleTypes}
        pagination={{
          pageIndex,
          pageSize,
          pageCount: Math.ceil((orderResponse?.pagination?.total || 0) / pageSize),
          total: orderResponse?.pagination?.total || 0,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />
    </div>
  );
}