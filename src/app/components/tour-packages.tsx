"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";
import Link from "next/link";

interface TourPackage {
  id: string;
  photoUrl: Array<{ url: string }>;
  name: string;
  price: string;
  description: string;
  meetingPoint: string;
  minPersonCapacity: number;
  maxPersonCapacity: number;
  includes: Array<{ text: string }>;
  excludes: Array<{ text: string }>;
  itineraries: Array<{ text?: string; opsional?: string }>;
  requirements: Array<{ text: string }>;
  tickets: Array<{ date: string }> | null;
  is_private: boolean;
  createdAt: string;
  updatedAt: string;
}

const formatCurrency = (value: string) =>
  `Rp ${parseInt(value).toLocaleString("id-ID")}`;

const TourPackages = () => {
  const router = useRouter();
  const handlePackageClick = (id: string) => {
    router.push(`/order/tour-package/${id}`);
  };

  const { data, isLoading, error } = useQuery<{
    data: TourPackage[];
  }>({
    queryKey: ["tour-packages"],
    queryFn: async () => {
      const response = await axios.get("/api/tour-packages");
      return response.data;
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading tour packages.</p>;

  return (
    <div className="flex items-strech gap-x-2 overflow-x-auto p-4">
      {data?.data.map((pkg) => (
        <Link key={pkg.id} href={`/tour-package/detail/${pkg.id}`}>
        <Card
          className="w-full min-w-full max-w-full md:min-w-md md:max-w-md overflow-hidden bg-white shadow-lg cursor-pointer !pt-0"
          onClick={() => handlePackageClick(pkg.id)}
        >
          {/* Hero Image */}
          <div className="relative">
            <Image
              src={pkg.photoUrl[0]?.url}
              alt={pkg.name}
              width={400}
              height={240}
              className="w-full h-60 object-cover"
            />
            {pkg.is_private ? (
              <Badge className="absolute top-4 left-4 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1">
                Private Tour
              </Badge>
            ) : <Badge className="absolute top-4 left-4 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1">
                Open Tour
              </Badge>}
          </div>

          <CardContent className="px-4 pb-4 space-y-4 h-full">
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {pkg.name}
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium mb-1.5">Includes:</p>
                <ul className="list-disc list-inside space-y-1">
                  {pkg.includes?.slice(0, 2).map((inc, idx) => (
                    <li key={idx} className="text-xs text-gray-600">
                      {inc.text}
                    </li>
                  ))}
                  {pkg.includes && pkg.includes.length > 2 && (
                    <li className="text-xs text-gray-600">
                      +{pkg.includes.length - 2} lainnya
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium mb-1.5">Excludes:</p>
                <ul className="list-disc list-inside space-y-1">
                  {pkg.excludes?.slice(0, 2).map((inc, idx) => (
                    <li key={idx} className="text-xs text-gray-600">
                      {inc.text}
                    </li>
                  ))}
                  {pkg.excludes && pkg.excludes.length > 2 && (
                    <li className="text-xs text-gray-600">
                      +{pkg.excludes.length - 2} lainnya
                    </li>
                  )}
                </ul>
              </div>
            </div>

            
          </CardContent>

          <CardFooter className="p-4 border-t border-gray-100">
            <div className="w-full">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Direkomendasikan untuk:
                </span>
                <span className="text-xs text-gray-500">Mulai dari</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {pkg.tickets && pkg.tickets.length > 0
                        ? new Date(pkg.tickets[0].date).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "Tanggal fleksibel"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {pkg.minPersonCapacity} - {pkg.maxPersonCapacity} orang
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-400 line-through">
                    {formatCurrency((parseInt(pkg.price) * 1.2).toString())}
                  </div>
                  <div className="text-xl font-bold text-orange-500">
                    {formatCurrency(pkg.price)}
                    <span className="text-sm font-normal text-gray-500">
                      /pax
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
        </Link>
      ))}
    </div>
  );
};

export default TourPackages;
