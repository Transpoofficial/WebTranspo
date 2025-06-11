import React from "react";
import { CartesianGrid, Bar, BarChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";

interface OrderBarChartProps {
  orders: Array<{ createdAt: string }>;
  chartConfig: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
}

const OrderBarChart: React.FC<OrderBarChartProps> = ({ orders = [], chartConfig }) => {
  const chartData = React.useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    // Create a map of all dates with their order counts
    const dateMap = new Map<string, number>();
    
    // Sort orders by date
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Get start and end dates
    const startDate = new Date(sortedOrders[0].createdAt);
    const endDate = new Date(sortedOrders[sortedOrders.length - 1].createdAt);

    // Fill in all dates in the range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "dd MMM");
      dateMap.set(dateStr, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count orders for each date
    orders.forEach(order => {
      const dateStr = format(new Date(order.createdAt), "dd MMM");
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
    });

    // Convert map to array
    return Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      orders: count,
    }));
  }, [orders]);

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        Tidak ada data untuk ditampilkan
      </div>
    );
  }

  return (
    <ChartContainer className="max-h-118 w-full" config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="orders" fill="var(--color-orders)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
};

export default OrderBarChart;
