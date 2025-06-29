import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, eachDayOfInterval, parseISO, subDays } from "date-fns";

interface OrderBarChartProps {
  orders: Array<{ createdAt: string }>;
  dateFilter: string;
  dateRange?: { from: Date; to: Date } | undefined;
  chartConfig: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
}

const OrderBarChart: React.FC<OrderBarChartProps> = ({ 
  orders = [], 
  dateFilter, 
  dateRange,
}) => {
  const chartData = React.useMemo(() => {
    if (!orders || orders.length === 0) return [];

    let endDate = new Date();
    let startDate: Date;

    if (dateRange?.from && dateRange?.to) {
      // Untuk custom date range, gunakan tanggal yang dipilih
      startDate = dateRange.from;
      endDate = dateRange.to;
    } else if (dateFilter === "custom") {
      // Jika mode custom tapi tidak ada range, gunakan 7 hari
      startDate = subDays(endDate, 6);
    } else {
      // Untuk preset filter
      const days = parseInt(dateFilter);
      startDate = !isNaN(days) ? subDays(endDate, days - 1) : subDays(endDate, 6);
    }

    // Generate array of all dates in the range (inclusive)
    const datesInRange = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    // Initialize map with all dates set to 0
    const dateMap = new Map<string, number>();
    datesInRange.forEach((date) => {
      const dateStr = format(date, "dd MMM");
      dateMap.set(dateStr, 0);
    });

    // Count orders for each date, using exact date comparison
    orders.forEach((order) => {
      const orderDate = parseISO(order.createdAt);
      if (orderDate >= startDate && orderDate <= endDate) {
        const dateStr = format(orderDate, "dd MMM");
        dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
      }
    });

    // Convert map to array for chart and ensure it's sorted by date
    return Array.from(dateMap.entries())
      .map(([date, count]) => ({
        date,
        orders: count,
      }))
      .sort((a, b) => {
        return datesInRange.findIndex(d => format(d, "dd MMM") === a.date) 
               - datesInRange.findIndex(d => format(d, "dd MMM") === b.date);
      });
  }, [orders, dateFilter, dateRange]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground">
        Tidak ada data untuk ditampilkan
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Tanggal
                        </span>
                        <span className="font-bold">
                          {payload[0].payload.date}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Pesanan
                        </span>
                        <span className="font-bold">
                          {payload[0].payload.orders}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="orders"
            radius={[4, 4, 0, 0]}
            style={{
              fill: "var(--primary)",
              opacity: 0.9,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderBarChart;
