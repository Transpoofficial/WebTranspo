"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

// Component that uses useSearchParams
function OrderPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial filters from URL
  const initialFilters = {
    search: searchParams.get("search") || "",
    orderType: searchParams.get("orderType") || "",
    orderStatus: searchParams.get("orderStatus") || "",
    vehicleType: searchParams.get("vehicleType") || "",
    paymentStatus: searchParams.get("paymentStatus") || "",
  };

  // State management
  const [skip, setSkip] = useState(parseInt(searchParams.get("skip") || "0"));
  const [limit, setLimit] = useState(
    parseInt(searchParams.get("limit") || "10")
  );
  const [searchInput, setSearchInput] = useState(initialFilters.search);
  const [filters, setFilters] = useState(initialFilters);

  const debouncedSearch = useDebounce(searchInput, 300);

  // Update URL with filters - modified to remove empty params
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.orderType) params.set("orderType", filters.orderType);
    if (filters.orderStatus) params.set("orderStatus", filters.orderStatus);
    if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
    if (filters.paymentStatus)
      params.set("paymentStatus", filters.paymentStatus);
    if (skip > 0) params.set("skip", skip.toString());
    if (limit !== 10) params.set("limit", limit.toString());

    // Use replaceState instead of push to avoid adding to browser history
    router.replace(`?${params.toString()}`);
  }, [debouncedSearch, filters, skip, limit, router]);

  // Query to fetch orders
  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders", skip, limit, debouncedSearch, filters],
    queryFn: () =>
      fetchOrders(skip, limit, { ...filters, search: debouncedSearch }),
    enabled: !!session?.user,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // Define resetPagination before using it
  const resetPagination = useCallback(() => {
    setSkip(0);
  }, []);

  // Update search function - immediate UI update
  const updateSearch = useCallback(
    (search: string) => {
      setSearchInput(search);
      resetPagination();
    },
    [resetPagination]
  );

  // Update filters function - modified to handle empty values
  const updateFilters = useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters((prev) => {
        const updated = { ...prev };
        // For each new filter value, either set it or delete it if empty
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value === "") {
            delete updated[key as keyof typeof filters];
          } else {
            updated[key as keyof typeof filters] = value;
          }
        });
        return updated;
      });
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

// Main exported component with Suspense wrapper
export default function OrderPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <OrderPageContent />
    </Suspense>
  );
}
