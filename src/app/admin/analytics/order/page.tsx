// page.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import OrderBarChart from "./components/order-barchart";
import OrderLineChart from "./components/order-linechart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import ChartFilter from "./components/chart-filter";
import DateFilter from "./components/date-filter";
import VehicleFilter from "./components/vehicle-filter";
import StatusFilter from "./components/status-filter";
import OrderTypeFilter from "./components/order-type-filter";
import { DateRange } from "react-day-picker";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import TourTypeFilter from "./components/tour-type-filter";

interface Order {
  id: string;
  fullName: string;
  totalPassengers: number;
  orderStatus: string;
  orderType: string;
  createdAt: string;
  vehicleType: {
    name: string;
  } | null;
  packageOrder?: {
    package: {
      is_private: boolean;
    };
  };
}

interface OrdersResponse {
  message: string;
  data: Order[];
  pagination: {
    total: number;
    skip: number;
    limit: number;
    hasMore: boolean;
  };
}

const chartConfig = {
  orders: {
    label: "Pesanan",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const OrderAnalysis = () => {
  const [chartType, setChartType] = useState<string>("line");
  const [dateFilter, setDateFilter] = useState<string>("7");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [vehicleType, setVehicleType] = useState<string>("all");
  const [orderStatus, setOrderStatus] = useState<string>("all");
  const [orderType, setOrderType] = useState<string>("all");
  const [tourType, setTourType] = useState<string>("all");

  const buildQueryParams = () => {
  const params = new URLSearchParams();

  if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
    params.append("dateFilter", "custom");
    params.append("startDate", startOfDay(dateRange.from).toISOString());
    params.append("endDate", endOfDay(dateRange.to).toISOString());
  } else {
    params.append("dateFilter", dateFilter);
  }

  if (vehicleType !== "all") {
    params.append("vehicleType", vehicleType);
  }

  if (orderStatus !== "all") {
    params.append("orderStatus", orderStatus);
  }

  if (orderType !== "all") {
    params.append("orderType", orderType);
  }

  if (orderType === "TOUR" && tourType !== "all") {
    params.append("isPrivate", tourType === "private" ? "true" : "false");
  }

  return params.toString();
};

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", dateFilter, dateRange, vehicleType, orderStatus, orderType, tourType],
    queryFn: async () => {
      const queryParams = buildQueryParams();
      const { data } = await axios.get<OrdersResponse>(`/api/orders?${queryParams}`);
      return data;
    },
  });

  const getDateDescription = React.useMemo(() => {
    try {
      const now = new Date();

      if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
        return `${format(new Date(dateRange.from), "d MMMM yyyy")} - ${format(
          new Date(dateRange.to),
          "d MMMM yyyy"
        )}`;
      }

      const days = parseInt(dateFilter);
      const startDate = subDays(now, days);
      return `${days} hari terakhir (${format(startDate, "d MMMM yyyy")} - ${format(
        now,
        "d MMMM yyyy"
      )})`;
    } catch (error) {
      console.error("Date description error:", error);
      return "Silahkan pilih tanggal";
    }
  }, [dateFilter, dateRange]);

  if (isLoading) {
    return (
      <div className="border-y-2 border-black w-4 h-4 rounded-full animate-spin" />
    );
  }

  return (
    <>
      <Card className="rounded-3xl">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-y-1.5">
            <CardTitle>Analisis pemesanan</CardTitle>
            <CardDescription>{getDateDescription}</CardDescription>
          </div>

          {/* Filters */}
          <div className="flex items-center w-full md:w-auto overflow-x-auto gap-x-2">
            {/* Select for chart filter */}
            <ChartFilter chartType={chartType} setChartType={setChartType} />

            {/* Select for order type filter */}
            <OrderTypeFilter orderType={orderType} setOrderType={setOrderType} />

            {/* Show tour type filter only when orderType is TOUR */}
            {orderType === "TOUR" && (
              <TourTypeFilter tourType={tourType} setTourType={setTourType} />
            )}

            {/* Select for vehicle type filter */}
            {orderType === "TRANSPORT" && (
              <VehicleFilter vehicleType={vehicleType} setVehicleType={setVehicleType} />
            )}

            {/* Select for order status filter */}
            <StatusFilter orderStatus={orderStatus} setOrderStatus={setOrderStatus} />

            {/* Select for date filter */}
            <DateFilter
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              onDateRangeChange={setDateRange}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Charts */}
          {chartType === "line" ? (
            <OrderLineChart
              orders={ordersData?.data || []}
              chartConfig={chartConfig}
              dateFilter={dateFilter}
              dateRange={dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined}
            />
          ) : chartType === "bar" ? (
            <OrderBarChart
              orders={ordersData?.data || []}
              chartConfig={chartConfig}
              dateFilter={dateFilter}
              dateRange={dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined}
            />
          ) : (
            <p className="text-sm">Tidak ada chart</p>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default OrderAnalysis;