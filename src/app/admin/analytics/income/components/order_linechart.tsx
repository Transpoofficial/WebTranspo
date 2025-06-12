import React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { format } from "date-fns";

interface OrderLineChartProps {
  chartData: { date: string; orders: number }[];
  chartConfig: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
}

const OrderLineChart: React.FC<OrderLineChartProps> = ({ chartData, chartConfig }) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Tidak ada data pendapatan untuk ditampilkan
      </div>
    );
  }

  const formattedChartData = chartData.map(item => ({
    ...item,
    formattedDate: format(new Date(item.date), "d MMM")
  }));

  return (
    <ChartContainer className="max-h-118 w-full" config={chartConfig}>
      <LineChart
        data={formattedChartData}
        margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
        height={300}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="formattedDate"
          tickLine={false}
          axisLine
          tickMargin={12}
          interval="preserveEnd"
          tick={{ fontSize: 12, fill: '#888' }}
        />
        <YAxis
          tickFormatter={(value) => new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value)}
          tickMargin={8}
          axisLine
          tickLine={false}
          tick={{ fontSize: 12, fill: '#888' }}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                      {payload[0].payload.formattedDate}
                    </span>
                    <span className="font-bold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(Number(payload[0].value || 0))}
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="var(--color-orders)"
          strokeWidth={2}
          dot={{ strokeWidth: 2, r: 2, fill: 'white' }}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default OrderLineChart;
