"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Destination {
  departureDate: string;
}

interface Transportation {
  destinations: Destination[];
}

interface VehicleType {
  name: string;
  id: string;
}

interface Order {
  transportation: Transportation;
  vehicleType: VehicleType;
}
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  CartesianGrid,
  LabelList,
  XAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import DashboardTable from "./components/table";

const barChartConfig = {
  orders: {
    label: "Pesanan",
    color: "hsl(222.2 47.4% 11.2%)", // darker blue
  },
} satisfies ChartConfig;

const chartColors = [
  '#FF7F50', // coral
  '#32CD32', // lime green
  '#4169E1', // royal blue
  '#9370DB', // medium purple
  '#FF69B4', // hot pink
];
const generatePieChartConfig = (vehicleTypes: VehicleType[]) => {
  return vehicleTypes.reduce((config: ChartConfig, type: VehicleType, index: number) => {
    config[type.name.toLowerCase()] = {
      label: type.name,
      color: chartColors[index % chartColors.length],
    };
    return config;
  }, {} as ChartConfig);
};

const Dashboard = () => {
  // Get current year
const currentYear = new Date().getFullYear();

const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await axios.get("/api/orders");
      return data;
    },
  });

  const { data: vehicleTypesData, isLoading: vehicleTypesLoading } = useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: async () => {
      const { data } = await axios.get("/api/vehicle-types");
      return data;
    },
  });

  // Calculate monthly orders for current year
  const calculateMonthlyOrders = () => {
    if (!ordersData?.data) return [];

    const monthlyOrders = Array(12).fill(0);

    ordersData.data.forEach((order: Order) => {
      const orderDate = new Date(
        order.transportation.destinations[0].departureDate
      );
      if (orderDate.getFullYear() === currentYear) {
        monthlyOrders[orderDate.getMonth()]++;
      }
    });

    return [
      { month: "January", orders: monthlyOrders[0] },
      { month: "February", orders: monthlyOrders[1] },
      { month: "March", orders: monthlyOrders[2] },
      { month: "April", orders: monthlyOrders[3] },
      { month: "May", orders: monthlyOrders[4] },
      { month: "June", orders: monthlyOrders[5] },
      { month: "July", orders: monthlyOrders[6] },
      { month: "August", orders: monthlyOrders[7] },
      { month: "September", orders: monthlyOrders[8] },
      { month: "October", orders: monthlyOrders[9] },
      { month: "November", orders: monthlyOrders[10] },
      { month: "December", orders: monthlyOrders[11] },
    ];
  };

  // Calculate vehicle usage percentages
  const calculateVehicleStats = () => {
    if (!ordersData?.data || !vehicleTypesData?.data) return [];

    const vehicleCounts: { [key: string]: number } = {};
    let total = 0;

    ordersData.data.forEach((order: Order) => {
      const vehicleType = order.vehicleType.name.toLowerCase();
      vehicleCounts[vehicleType] = (vehicleCounts[vehicleType] || 0) + 1;
      total++;
    });

    return vehicleTypesData.data.map((type: VehicleType, index: number) => ({
      vehicle: type.name.toLowerCase(),
      count: vehicleCounts[type.name.toLowerCase()] || 0,
      percentage: Math.round(((vehicleCounts[type.name.toLowerCase()] || 0) / total) * 100),
      fill: chartColors[index % chartColors.length], // Use chartColors directly
    }));
  };

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { vehicle: string; percentage: number; count: number } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 rounded-lg border shadow-sm">
          <p className="text-sm font-medium">{`${payload[0].payload.vehicle}`}</p>
          <p className="text-sm">{`${payload[0].payload.percentage}% (${payload[0].payload.count} orders)`}</p>
        </div>
      );
    }
    return null;
  };

  if (ordersLoading || vehicleTypesLoading) return <div>Loading...</div>;

  const barChartData = calculateMonthlyOrders();
  const pieChartData = calculateVehicleStats();
  const pieChartConfig = generatePieChartConfig(vehicleTypesData?.data || []);

  return (
    <>
      <div className="flex flex-col lg:flex-row items-stretch gap-4">
        {/* Total bookings this year */}
        <Card className="w-full rounded-3xl">
          <CardHeader>
            <CardTitle>Pemesanan</CardTitle>
            <CardDescription>Tahun {currentYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig}>
              <BarChart
                accessibilityLayer
                data={barChartData}
                margin={{
                  top: 20,
                }}
              >
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
                <Bar dataKey="orders" fill="hsl(222.2 47.4% 11.2%)" radius={8}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Vehicle */}
        <Card className="w-full rounded-3xl">
          <CardHeader>
            <CardTitle>Kendaraan Teratas</CardTitle>
            <CardDescription>
              Jenis kendaraan yang sering dipesan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={pieChartConfig}
              className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
            >
              <PieChart>
                <ChartTooltip content={<CustomTooltip />} />
                <Pie
                  data={pieChartData}
                  dataKey="percentage"
                  nameKey="vehicle"
                >
                  <LabelList
                    dataKey="percentage"
                    position="inside"
                    className="fill-background"
                    stroke="none"
                    fontSize={14}
                    formatter={(value: number) => value > 0 ? `${value}%` : ''}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex items-center">
            <div className="w-full grid grid-cols-2 gap-1.5">
              {vehicleTypesData?.data.map((type: VehicleType, index: number) => (
                <div key={type.name} className="inline-flex items-center gap-x-1.5">
                  <div
                    className="min-w-5 min-h-5 w-5 h-5 rounded-sm"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  ></div>
                  <span className="text-xs">{type.name}</span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card className="rounded-3xl mt-4">
        <CardHeader className="flex justify-between items-start gap-0">
          <CardTitle>Daftar pemesanan terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardTable />
        </CardContent>
      </Card>
    </>
  );
};

export default Dashboard;
