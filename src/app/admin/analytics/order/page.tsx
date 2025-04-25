"use client";

import React, { useState } from "react";
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

const chartData = [
  { month: "January", orders: 186 },
  { month: "February", orders: 305 },
  { month: "March", orders: 237 },
  { month: "April", orders: 73 },
  { month: "May", orders: 209 },
  { month: "June", orders: 214 },
];

const chartConfig = {
  orders: {
    label: "Pesanan",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const OrderAnalysis = () => {
  const [chartType, setChartType] = useState<string>("line");
  const [dateFilter, setDateFilter] = useState<string>("7");

  return (
    <>
      <Card className="rounded-3xl">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-y-1.5">
            <CardTitle>Analisis pemesanan</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </div>

          {/* Filters */}
          <div className="flex items-center w-full md:w-auto overflow-x-auto gap-x-2">
            {/* Select for chart filter */}
            <ChartFilter chartType={chartType} setChartType={setChartType} />

            {/* Select for date filter */}
            <DateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />
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

      <OrderTable />
    </>
  );
};

export default OrderAnalysis;
