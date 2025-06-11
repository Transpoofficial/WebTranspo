import React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";

interface OrderLineChartProps {
  orders: Array<{ createdAt: string }>;

  chartConfig: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
}

const OrderLineChart: React.FC<OrderLineChartProps> = ({
  orders = [],
  chartConfig,
}) => {
  const chartData = React.useMemo(() => {
    if (!orders || orders.length === 0) return [];

    // Create a map of all dates with their order counts
    const dateMap = new Map<string, number>();

    // Sort orders by date
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
    orders.forEach((order) => {
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
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Tidak ada data untuk ditampilkan
      </div>
    );
  }

  return (
    <>
      {/* Line Chart */}
      <ChartContainer className="max-h-118 w-full" config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey="orders"
            type="linear"
            stroke="var(--color-orders)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </>
  );
};

export default OrderLineChart;
