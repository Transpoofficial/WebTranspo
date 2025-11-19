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
import ChartFilter from "./components/chart-filter";
import DateFilter from "./components/date-filter";
import VehicleFilter from "./components/vehicle-filter";
import OrderTypeFilter from "./components/order-type-filter";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import TourTypeFilter from "./components/tour-type-filter";

interface Order {
  id: string;
  fullName: string;
  orderStatus: string;
  orderType: string;
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

const OrderAnalysis = () => {
  const [chartType, setChartType] = useState<string>("line");
  const [dateFilter, setDateFilter] = useState<string>("7");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [vehicleType, setVehicleType] = useState<string>("all");
  const [orderType, setOrderType] = useState<string>("all");
  const [tourType, setTourType] = useState<string>("all");

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
      params.append("dateFilter", "custom");
      params.append("startDate", dateRange.from.toISOString());
      params.append("endDate", dateRange.to.toISOString());
    } else {
      params.append("dateFilter", dateFilter);
    }

    if (vehicleType !== "all") {
      params.append("vehicleType", vehicleType);
    }

    if (orderType !== "all") {
      params.append("orderType", orderType);
      
      // Only add tourType filter when orderType is TOUR
      if (orderType === "TOUR" && tourType !== "all") {
        params.append("isPrivate", tourType === "private" ? "true" : "false");
      }
    }

    // Only include completed orders for income analysis
    params.append("orderStatus", "COMPLETED");

    return params.toString();
  };

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", dateFilter, dateRange, vehicleType, orderType, tourType],
    queryFn: async () => {
      const queryParams = buildQueryParams();
      const { data } = await axios.get<ApiResponse>(`/api/orders?noPagination=true&${queryParams}`);
      return data.data || [];
    },
  });

  const getDateDescription = React.useMemo(() => {
    try {
      const now = new Date();

      if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
        return `${format(dateRange.from, "d MMMM yyyy")} - ${format(
          dateRange.to,
          "d MMMM yyyy"
        )}`;
      }

      const days = parseInt(dateFilter);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
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
    const dataMap = new Map<string, number>();

    orders.forEach((order) => {
      const date = format(new Date(order.createdAt), "yyyy-MM-dd");
      const amount = parseInt(order.payment.totalPrice) || 0;
      dataMap.set(date, (dataMap.get(date) || 0) + amount);
    });

    // Convert to array and sort by date
    return Array.from(dataMap.entries())
      .map(([date, amount]) => ({ date, orders: amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [orders]);

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

            {/* Select for order type filter */}
            <OrderTypeFilter orderType={orderType} setOrderType={setOrderType} />

            {/* Show tour type filter only when orderType is TOUR */}
            {orderType === "TOUR" && (
              <TourTypeFilter tourType={tourType} setTourType={setTourType} />
            )}

            {/* Select for vehicle filter */}
            {orderType === "TRANSPORT" && (
              <VehicleFilter vehicleType={vehicleType} setVehicleType={setVehicleType} />
            )}

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
            <OrderLineChart chartData={chartData} chartConfig={chartConfig} />
          ) : chartType === "bar" ? (
            <OrderBarChart chartData={chartData} chartConfig={chartConfig} />
          ) : (
            <p className="text-sm">Tidak ada chart</p>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default OrderAnalysis;