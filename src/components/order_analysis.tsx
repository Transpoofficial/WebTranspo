"use client";

import React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const OrderAnalysis = () => {
  return (
    <>
      <Card className="rounded-3xl">
        <CardHeader className="flex justify-between items-center">
          <div className="flex flex-col gap-y-1.5">
            <CardTitle>Analisis pemesanan</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </div>

          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter tanggal" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Filter tangal</SelectLabel>
                <SelectItem value="7">7 hari terakhir</SelectItem>
                <SelectItem value="28">28 hari terakhir</SelectItem>
                <SelectItem value="90">90 hari terakhir</SelectItem>
                <SelectItem value="365">365 hari terakhir</SelectItem>
                <Separator className="my-1" />
                <SelectItem value="custom">Custom</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ChartContainer className="max-h-96 w-full" config={chartConfig}>
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
                dataKey="desktop"
                type="linear"
                stroke="var(--color-desktop)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <Button variant="secondary" className="cursor-pointer">
            Lihat selengkapnya
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default OrderAnalysis;
