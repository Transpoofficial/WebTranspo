"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CalendarIcon, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import TabsComponent from "../components/tabs";
import Header from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import Pagination from "../components/pagination";

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

export default function PrivateTrip() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, error } = useQuery<{
    data: TourPackage[];
    pagination: {
      total: number;
      skip: number;
      limit: number;
      hasMore: boolean;
    };
  }>({
    queryKey: ["tour-packages", search, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("skip", ((page - 1) * limit).toString());
      params.append("limit", limit.toString());
      params.append("is_private", "true"); // atau "true" kalau mau halaman private trip

      const res = await axios.get(`/api/tour-packages?${params.toString()}`);
      return res.data;
    },
  });

  const formatCurrency = (value: string) =>
    `Rp ${parseInt(value).toLocaleString("id-ID")}`;

  const advantageRef = useRef<HTMLDivElement | null>(null);
  const howToOrderRef = useRef<HTMLDivElement | null>(null);
  const serviceRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLDivElement | null>(null);
  const reviewRef = useRef<HTMLDivElement | null>(null);

  const scrollToAdvantage = () => {
    advantageRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHowToOrder = () => {
    howToOrderRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToService = () => {
    serviceRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToArticle = () => {
    articleRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Header
        scrollToAdvantage={scrollToAdvantage}
        scrollToHowToOrder={scrollToHowToOrder}
        scrollToService={scrollToService}
        scrollToArticle={scrollToArticle}
        scrollToReview={scrollToReview}
      />

      <div className="container mx-auto my-10 px-4 md:px-10">
        <TabsComponent />

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-teal-600 mb-2">
              PRIVATE TRIP
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Nikmati liburan eksklusif dengan keluarga atau teman-teman!
            </p>
          </div>

          <Input
            placeholder="Cari berdasarkan nama paket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          {/* Trip Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>Error loading tour packages.</p>
            ) : data?.data.length === 0 ? (
              <p>Tidak ada data yang ditemukan.</p>
            ) : (
              data?.data.map((pkg) => (
                <Link key={pkg.id} href={`/tour-package/private-trip/detail/${pkg.id}`}>
                  <Card className="h-full w-full overflow-hidden bg-white shadow-none cursor-pointer !pt-0">
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
                          Private Trip
                        </Badge>
                      ) : (
                        <Badge className="absolute top-4 left-4 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1">
                          Open Trip
                        </Badge>
                      )}
                    </div>

                    <CardContent className="px-4 pb-4 space-y-4 h-full">
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">
                        {pkg.name}
                      </h2>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-medium mb-1.5">
                            Includes:
                          </p>
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
                          <p className="text-xs font-medium mb-1.5">
                            Excludes:
                          </p>
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
                          <span className="text-xs text-gray-500">
                            Mulai dari
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CalendarIcon className="w-4 h-4" />
                              <span>
                                Tanggal fleksibel
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>
                                {pkg.minPersonCapacity} -{" "}
                                {pkg.maxPersonCapacity} orang
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-gray-400 line-through">
                              {formatCurrency(
                                (parseInt(pkg.price) * 1.2).toString()
                              )}
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
              ))
            )}
          </div>

          {data?.pagination && (
            <Pagination
              pagination={data.pagination}
              currentPage={page}
              pageSize={limit}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
