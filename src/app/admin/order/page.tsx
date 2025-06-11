"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useState, useMemo, useCallback } from "react";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { Order } from "./data/schema";
import { useDebounce } from "@/hooks/use-debounce";

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

interface SearchFilters {
  search: string;
  orderType: string;
  orderStatus: string;
  vehicleType: string;
  paymentStatus: string;
}

// Fetch orders function with search and filters
const fetchOrders = async (
  skip: number,
  limit: number,
  filters: SearchFilters
): Promise<OrderResponse> => {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  // Add search and filter parameters
  if (filters.search) params.append("search", filters.search);
  if (filters.orderType) params.append("orderType", filters.orderType);
  if (filters.orderStatus) params.append("orderStatus", filters.orderStatus);
  if (filters.vehicleType) params.append("vehicleType", filters.vehicleType);
  if (filters.paymentStatus)
    params.append("paymentStatus", filters.paymentStatus);

  const response = await axios.get(`/api/orders?${params.toString()}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export default function OrderPage() {
  const { data: session, status } = useSession();

  // Pagination state
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);

  // Separate search input state for immediate UI response
  const [searchInput, setSearchInput] = useState("");

  // Filter state (excluding search which is handled separately)
  const [filters, setFilters] = useState({
    orderType: "",
    orderStatus: "",
    vehicleType: "",
    paymentStatus: "",
  });

  // Debounce only the search input for API calls
  const debouncedSearch = useDebounce(searchInput, 300);

  // Combine debounced search with other filters for API calls
  const apiFilters = useMemo(
    () => ({
      search: debouncedSearch,
      ...filters,
    }),
    [debouncedSearch, filters]
  );

  // Reset pagination when filters change
  const resetPagination = useCallback(() => {
    setSkip(0);
  }, []);

  // Query to fetch orders with search and pagination
  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<OrderResponse>({
    queryKey: ["orders", skip, limit, apiFilters],
    queryFn: () => fetchOrders(skip, limit, apiFilters),
    enabled: !!session?.user, // Only fetch when user is authenticated
    staleTime: 30 * 1000, // 30 seconds - reduced for more responsive search
    gcTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData, // Keep previous data while loading new data
  });

  // Update search function - immediate UI update
  const updateSearch = useCallback(
    (search: string) => {
      setSearchInput(search);
      resetPagination();
    },
    [resetPagination]
  );

  // Update filters function - immediate UI update
  const updateFilters = useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      resetPagination();
    },
    [resetPagination]
  );

  // Update pagination
  const updatePagination = useCallback((newSkip: number, newLimit?: number) => {
    setSkip(newSkip);
    if (newLimit !== undefined) {
      setLimit(newLimit);
    }
  }, []);

  // Enhanced pagination data
  const paginationData = useMemo(() => {
    if (!orderResponse?.pagination) return null;

    return {
      ...orderResponse.pagination,
      pageIndex: Math.floor(skip / limit),
      pageSize: limit,
      pageCount: Math.ceil(orderResponse.pagination.total / limit),
    };
  }, [orderResponse, skip, limit]);

  if (status === "loading") {
    return (
      <div className="h-full flex-1 flex-col space-y-4">
        <div className="flex items-center justify-center h-24">
          <div className="text-sm text-muted-foreground">
            Loading session...
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="h-full flex-1 flex-col space-y-4">
        <div className="flex items-center justify-center h-24">
          <div className="text-sm text-muted-foreground">
            Please log in to view orders.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center w-full">
        <div className="border-y-2 border-black w-6 h-6 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex-1 flex-col space-y-4">
        <div className="flex items-center justify-center h-24">
          <div className="text-sm text-red-600">
            Error loading orders:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
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
    <div className="h-full space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Pesanan</h1>

      <DataTable
        data={orderResponse?.data || []}
        columns={columns}
        pagination={paginationData}
        searchInput={searchInput}
        filters={filters}
        onSearchChange={updateSearch}
        onFiltersChange={updateFilters}
        onPaginationChange={updatePagination}
        isLoading={isLoading}
      />
    </div>
  );
}
