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
import ChartFilter from "./components/chart_filter";
import DateFilter from "./components/date_filter";
import OrderTable from "./components/table";
import { DateRange } from "react-day-picker";
import VehicleFilter from "./components/vehicle_filter";
import {
  endOfDay,
  startOfDay,
  subDays,
  isBefore,
  isAfter,
  format,
} from "date-fns";

interface Order {
  id: string;
  fullName: string;
  orderStatus: string;
  createdAt: string;
  payment: {
    totalPrice: string;
  };
  vehicleType: {
    name: string;
  };
}

interface ApiResponse {
  data: Order[];
  message: string;
}

const fetchOrders = async (): Promise<Order[]> => {
  const { data } = await axios.get<ApiResponse>("/api/orders");
  return data.data || [];
};

const OrderAnalysis = () => {
  const [chartType, setChartType] = useState<string>("line");
  const [dateFilter, setDateFilter] = useState<string>("7");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [vehicleType, setVehicleType] = useState<string>("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const filteredOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];

    // Filter completed orders first
    let filtered = orders.filter((order) => order.orderStatus === "COMPLETED");

    // Apply date filtering
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    try {
      if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
        startDate = startOfDay(new Date(dateRange.from));
        endDate = endOfDay(new Date(dateRange.to));
      } else {
        const days = parseInt(dateFilter);
        startDate = startOfDay(subDays(now, days));
        endDate = endOfDay(now);
      }

      // Apply date filter
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          isAfter(orderDate, startDate) ||
          orderDate.getTime() === startDate.getTime()
        ) && (
          isBefore(orderDate, endDate) ||
          orderDate.getTime() === endDate.getTime()
        );
      });

      // Apply vehicle type filter
      if (vehicleType !== "all") {
        filtered = filtered.filter(
          (order) => order.vehicleType.name.toUpperCase() === vehicleType.toUpperCase()
        );
      }

      return filtered;
    } catch (error) {
      console.error("Filtering error:", error);
      return [];
    }
  }, [orders, dateFilter, dateRange, vehicleType]);

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

  const chartData = React.useMemo(() => {
    // Get date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
      startDate = startOfDay(new Date(dateRange.from));
      endDate = endOfDay(new Date(dateRange.to));
    } else {
      const days = parseInt(dateFilter);
      startDate = startOfDay(subDays(now, days));
      endDate = endOfDay(now);
    }

    // Generate all dates in range
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(format(currentDate, "yyyy-MM-dd"));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create map with all dates initialized to 0
    const dailyData = new Map(
      dates.map(date => [date, 0])
    );

    // Fill in actual income data
    filteredOrders.forEach((order) => {
      const date = format(new Date(order.createdAt), "yyyy-MM-dd");
      if (dailyData.has(date)) {
        const amount = parseInt(order.payment.totalPrice);
        dailyData.set(date, (dailyData.get(date) || 0) + amount);
      }
    });

    // Convert to array and format for chart
    return Array.from(dailyData.entries())
      .map(([date, amount]) => ({
        date,
        orders: amount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredOrders, dateFilter, dateRange]);

  const chartConfig = {
    orders: {
      label: "Pendapatan",
      color: "hsl(var(--chart-1))",
    },
  };

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
            <CardTitle>Analisis pendapatan</CardTitle>
            <CardDescription>{getDateDescription}</CardDescription>
          </div>

          {/* Filters */}
          <div className="flex items-center w-full md:w-auto overflow-x-auto gap-x-2">
            {/* Select for chart filter */}
            <ChartFilter chartType={chartType} setChartType={setChartType} />

            {/* Select for vehicle filter */}
            <VehicleFilter vehicleType={vehicleType} setVehicleType={setVehicleType} />

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
            <OrderLineChart chartData={chartData} chartConfig={chartConfig} />
          ) : chartType === "bar" ? (
            <OrderBarChart chartData={chartData} chartConfig={chartConfig} />
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
