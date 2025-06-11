"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import OrderBarChart from "./components/order_barchart";
import OrderLineChart from "./components/order_linechart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import ChartFilter from "./components/chart_filter";
import DateFilter from "./components/date_filter";
import OrderTable from "./components/table";
import VehicleFilter from "./components/vehicle_filter";
import StatusFilter from "./components/status_filter";
import { DateRange } from "react-day-picker";
import {
  endOfDay,
  startOfDay,
  subDays,
  format,
} from "date-fns";

interface Order {
  id: string;
  fullName: string;
  totalPassengers: number;
  orderStatus: string;
  createdAt: string;
  vehicleType: {
    name: string;
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

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await axios.get<OrdersResponse>("/api/orders");
      return data;
    },
  });

  const filteredOrders = React.useMemo(() => {
    if (!ordersData?.data) return [];

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    try {
      if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
        // Untuk custom date range, gunakan waktu 00:00 untuk from dan 23:59 untuk to
        startDate = startOfDay(dateRange.from);
        endDate = endOfDay(dateRange.to);
      } else {
        // Untuk preset filter
        const days = parseInt(dateFilter);
        if (!isNaN(days)) {
          startDate = startOfDay(subDays(now, days - 1));
          endDate = endOfDay(now);
        } else {
          startDate = startOfDay(subDays(now, 6));
          endDate = endOfDay(now);
        }
      }

      let filtered = ordersData.data.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });

      if (vehicleType !== "all") {
        filtered = filtered.filter((order) => order.vehicleType.name === vehicleType);
      }

      if (orderStatus !== "all") {
        filtered = filtered.filter((order) => order.orderStatus === orderStatus);
      }

      return filtered;
    } catch (error) {
      console.error("Filtering error:", error);
      return [];
    }
  }, [ordersData?.data, dateFilter, dateRange, vehicleType, orderStatus]);

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
      const startDate = startOfDay(subDays(now, days));
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

            {/* Select for vehicle type filter */}
            <VehicleFilter vehicleType={vehicleType} setVehicleType={setVehicleType} />

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
          {/* Chats */}
          {chartType === "line" ? (
            <OrderLineChart
              orders={filteredOrders}
              chartConfig={chartConfig}
              dateFilter={dateFilter}
              dateRange={dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined}
            />
          ) : chartType === "bar" ? (
            <OrderBarChart
              orders={filteredOrders}
              chartConfig={chartConfig}
              dateFilter={dateFilter}
              dateRange={dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined}
            />
          ) : (
            <p className="text-sm">Tidak ada chart</p>
          )}
        </CardContent>
      </Card>

      <OrderTable orders={filteredOrders} />
    </>
  );
};

export default OrderAnalysis;
