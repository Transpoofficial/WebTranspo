<<<<<<< HEAD
import React from 'react'

const page = () => {
  return (
    <div>Hai</div>
  )
}

export default page
=======
"use client";

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

const barChartData = [
  { month: "January", orders: 186 },
  { month: "February", orders: 305 },
  { month: "March", orders: 237 },
  { month: "April", orders: 73 },
  { month: "May", orders: 209 },
  { month: "June", orders: 214 },
];

const barChartConfig = {
  orders: {
    label: "Pesanan",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const pieChartData = [
  { vehicle: "angkot", visitors: 50, fill: "var(--color-angkot)" },
  { vehicle: "elf", visitors: 15, fill: "var(--color-elf)" },
  { vehicle: "hiace", visitors: 20, fill: "var(--color-hiace)" },
  { vehicle: "paketwisata", visitors: 15, fill: "var(--color-paketwisata)" },
];
const pieChartConfig = {
  visitors: {
    label: "Visitors",
  },
  angkot: {
    label: "Angkot",
    color: "hsl(var(--chart-1))",
  },
  elf: {
    label: "Elf",
    color: "hsl(var(--chart-2))",
  },
  hiace: {
    label: "HIACE",
    color: "hsl(var(--chart-3))",
  },
  paketwisata: {
    label: "Paket Wisata",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const Dashboard = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8">
          <Card className="rounded-3xl">
            <CardHeader className="flex justify-between items-start gap-0">
              <CardTitle>Daftar pemesanan terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardTable />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
          {/* Total bookings this year */}
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Pemesanan</CardTitle>
              <CardDescription>January - June 2025</CardDescription>
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
                  <Bar dataKey="orders" fill="var(--color-orders)" radius={8}>
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
          <Card className="rounded-3xl">
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
                  <ChartTooltip
                    content={
                      <ChartTooltipContent nameKey="visitors" hideLabel />
                    }
                  />
                  <Pie data={pieChartData} dataKey="visitors">
                    <LabelList
                      dataKey="vehicle"
                      className="fill-background"
                      stroke="none"
                      fontSize={14}
                      formatter={(value: keyof typeof pieChartData) => {
                        const visitorsData = pieChartData.find(
                          (obj) => obj.vehicle === value
                        );

                        return `${visitorsData?.visitors}%`;
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex items-center">
              <div className="w-full flex flex-col gap-y-1.5">
                {/* Angkot */}
                <div className="inline-flex items-center gap-x-1.5">
                  <div
                    className="min-w-5 min-h-5 w-5 h-5 rounded-sm"
                    style={{ backgroundColor: `hsl(var(--chart-1))` }}
                  ></div>
                  <span className="text-xs">Angkot</span>
                </div>

                {/* Elf */}
                <div className="inline-flex items-center gap-x-1.5">
                  <div
                    className="min-w-5 min-h-5 w-5 h-5 rounded-sm"
                    style={{ backgroundColor: `hsl(var(--chart-2))` }}
                  ></div>
                  <span className="text-xs">Elf</span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-y-1.5">
                {/* HIACE */}
                <div className="inline-flex items-center gap-x-1.5">
                  <div
                    className="min-w-5 min-h-5 w-5 h-5 rounded-sm"
                    style={{ backgroundColor: `hsl(var(--chart-3))` }}
                  ></div>
                  <span className="text-xs">HIACE</span>
                </div>

                {/* Paket Wisata */}
                <div className="inline-flex items-center gap-x-1.5">
                  <div
                    className="min-w-5 min-h-5 w-5 h-5 rounded-sm"
                    style={{ backgroundColor: `hsl(var(--chart-4))` }}
                  ></div>
                  <span className="text-xs">Paket Wisata</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
>>>>>>> 9f36405cac0055fe29bd07eebcd754b55fa9ddae
