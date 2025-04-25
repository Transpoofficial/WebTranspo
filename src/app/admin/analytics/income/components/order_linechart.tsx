import React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface OrderLineChartProps {
  chartData: { month: string; orders: number }[];
  chartConfig: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
}

const OrderLineChart: React.FC<OrderLineChartProps> = ({
  chartData,
  chartConfig,
}) => {
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
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
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
