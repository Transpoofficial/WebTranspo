import React from "react";
import { CartesianGrid, Bar, BarChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface OrderBarChartProps {
  chartData: { month: string; orders: number }[];
  chartConfig: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
}

const OrderBarChart: React.FC<OrderBarChartProps> = ({chartData, chartConfig}) => {
  return (
    <>
      {/* Bar Chart */}
      <ChartContainer className="max-h-118 w-full" config={chartConfig}>
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="orders" fill="var(--color-orders)" radius={8} />
        </BarChart>
      </ChartContainer>
    </>
  );
};

export default OrderBarChart;
