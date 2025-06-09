"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";

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

// Fetch orders function
const fetchOrders = async (): Promise<OrderResponse> => {
  const response = await axios.get("/api/orders", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export default function OrderPage() {
  const { data: session, status } = useSession();

  // Query to fetch orders
  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    enabled: !!session?.user, // Only fetch when user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
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
    <div className="h-full space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Pesanan</h1>

      <DataTable data={orderResponse?.data || []} columns={columns} />
    </div>
  );
}