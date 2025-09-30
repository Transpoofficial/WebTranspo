"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import servicesData from "@/data/services.json";
import OrderButton from "../components/order-button";
import {
  Users,
  DollarSign,
  Check,
  BusFront,
  Calendar,
  CalendarIcon,
  Ticket,
} from "lucide-react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface NearestOrder {
  id: string;
  orderStatus: string;
  orderType: string;
  transportation?: {
    destinations: {
      departureDate: string;
      address: string;
      isPickupLocation: boolean;
    }[];
  };
  packageOrder?: {
    departureDate: string;
    package: {
      name: string;
      destination: string;
    };
  };
}

interface Service {
  name: string;
  description: string;
  information: string[];
  pros: string[];
  cons: string[];
}

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

const DashboardPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [nearestOrder, setNearestOrder] = useState<NearestOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    // Load services from the JSON file
    setServices(servicesData.services);

    // if (!session) {
    //   router.push("/auth/signin");
    //   return;
    // }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard/customer");
        const data = await response.json();

        if (data.user) {
          setUserName(data.user.fullName || session?.user?.name || "");
        }

        if (data.nearestOrder) {
          setNearestOrder(data.nearestOrder);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, router]);

  // Format departure date from the nearest order
  const formatOrderDate = (order: NearestOrder) => {
    if (!order) return "";

    let date: string | null = null;

    if (
      order.orderType === "TRANSPORT" &&
      order.transportation?.destinations.length
    ) {
      const pickupLocation = order.transportation.destinations.find(
        (d) => d.isPickupLocation
      );
      date = pickupLocation?.departureDate || null;
    } else if (order.orderType === "TOUR" && order.packageOrder) {
      date = order.packageOrder.departureDate;
    }

    if (!date) return "Tanggal tidak tersedia";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get order description
  const getOrderDescription = (order: NearestOrder) => {
    if (!order) return "";

    if (order.orderType === "TRANSPORT" && order.transportation) {
      const pickupLocation = order.transportation.destinations.find(
        (d) => d.isPickupLocation
      );
      return pickupLocation
        ? `Perjalanan dari ${pickupLocation.address}`
        : "Perjalanan transportasi";
    } else if (order.orderType === "TOUR" && order.packageOrder) {
      return `Paket Tour: ${order.packageOrder.package.name} - ${order.packageOrder.package.destination}`;
    }

    return "Detail pesanan tidak tersedia";
  };

  // Get background color based on service name
  const getServiceBgColor = (serviceName: string) => {
    switch (serviceName) {
      case "Angkot":
        return "bg-transpo-primary";
      case "Hiace Commuter":
        return "bg-amber-400";
      case "Hiace Premio":
        return "bg-red-400";
      case "Elf (Elf Giga)":
      case "Elf Giga":
        return "bg-teal-500";
      case "Becak":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };
  const getServiceTextColor = (serviceName: string) => {
    switch (serviceName) {
      case "Angkot":
        return "text-transpo-primary";
      case "Hiace Commuter":
        return "text-amber-400";
      case "Hiace Premio":
        return "text-red-400";
      case "Elf (Elf Giga)":
      case "Elf Giga":
        return "text-teal-500";
      case "Becak":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  // Get vehicle image based on service name
  const getVehicleImage = (serviceName: string) => {
    switch (serviceName) {
      case "Angkot":
        return "/images/angkot/angkot_1.jpeg";
      case "Hiace Commuter":
        return "/images/hiace/commuter/commuter.jpg";
      case "Hiace Premio":
        return "/images/hiace/premio/premio_4.jpg";
      case "Elf (Elf Giga)":
      case "Elf Giga":
        return "/images/elf/elf_5.jpg";
      case "Becak":
        return "/images/becak/becak.jpg";
      default:
        return "/images/angkot/angkot_1.jpeg";
    }
  };

  const {
    data: openTripData,
    isLoading: openTripLoading,
    error: openTripError,
  } = useQuery<{
    data: TourPackage[];
  }>({
    queryKey: ["tour-packages", "open-trip"],
    queryFn: async () => {
      const response = await axios.get(`/api/tour-packages?is_private=false`);
      return response.data;
    },
  });

  const {
    data: privateTripData,
    isLoading: privateTripLoading,
    error: privateTripError,
  } = useQuery<{
    data: TourPackage[];
  }>({
    queryKey: ["tour-packages", "private-trip"],
    queryFn: async () => {
      const response = await axios.get(`/api/tour-packages?is_private=true`);
      return response.data;
    },
  });

  const formatCurrency = (value: string) =>
    `Rp ${parseInt(value).toLocaleString("id-ID")}`;

  return (
    <>
      <Header isLandingPage={false} />
      <div className="max-w-6xl mx-auto p-4">
        {/* Header Section */}
        <div className="bg-transpo-primary text-white rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold">Halo, {userName || ""}!</h1>
          <p className="text-sm">Ayo Atur Perjalananmu bareng TRANSPO!!</p>

          {/* Order Status Box */}
          <div className="bg-white rounded-lg mt-4 p-4">
            <h2 className="text-transpo-primary font-medium mb-2">
              Pesanan Saya
            </h2>

            {loading ? (
              <p className="text-gray-500 text-sm">Memuat data...</p>
            ) : nearestOrder ? (
              <div className="text-gray-700 text-sm">
                <p>{getOrderDescription(nearestOrder)}</p>
                <p>Tanggal: {formatOrderDate(nearestOrder)}</p>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => router.push("/settings/order")}
                    className="bg-transpo-primary text-white px-4 py-1 rounded-md"
                  >
                    Cek Pesanan
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Tidak ada pesanan dalam waktu dekat. Pilih layanan dan atur
                perjalananmu
              </p>
            )}
          </div>
        </div>

        <div className="border-t-2 border-t-transpo-primary md:my-10" />

        {/* Services Section */}
        <div className="mb-12">
          <h2 className="text-xl md:text-3xl font-bold text-transpo-primary mb-4">
            Layanan yang Tersedia
          </h2>

          {services.map((service, index) => (
            <div
              key={index}
              className={`rounded-lg overflow-hidden mb-4 ${getServiceBgColor(
                service.name
              )}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-5">
                {/* Image Section */}
                <div className="p-4">
                  <Image
                    src={getVehicleImage(service.name)}
                    alt={`${service.name} vehicle`}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full aspect-square"
                  />
                </div>
                {/* Left section - Vehicle info */}
                <div
                  className="p-4 md:col-span-3 flex gap-4
              "
                >
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-2xl md:text-3xl mr-2 text-white">
                        <BusFront />
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        {service.name.toUpperCase()}
                      </h3>
                    </div>
                    <div className="ml-1">
                      <ul className="list-disc list-inside text-lg font-semibold mb-2 text-white">
                        {service.information.slice(0, 3).map((info, i) => (
                          <li key={i}>{info}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right section - Features */}
                <div className="border-t-2 md:border-l-2 border-white/20 p-4">
                  <div className="flex flex-col h-full justify-center gap-4 md:items-center">
                    <div>
                      {service.pros.slice(0, 3).map((pro, i) => (
                        <div
                          key={i}
                          className="flex items-center mb-2 text-white"
                        >
                          <span className="mr-2">
                            {i === 0 ? (
                              <Users size={16} />
                            ) : i === 1 ? (
                              <DollarSign size={16} />
                            ) : (
                              <Check size={16} />
                            )}
                          </span>
                          <span className="text-base">{pro}</span>
                        </div>
                      ))}
                    </div>

                    {service.name === "Becak" ? (
                      <Link href="/maintenance">
                        <Button
                          size="lg"
                          className={`py-2 px-4 text-xl w-full md:w-min bg-white hover:bg-gray-100 shadow-lg ${getServiceTextColor(service.name)}`}
                        >
                          Pesan Sekarang
                        </Button>
                      </Link>
                    ) : (
                      <OrderButton
                        textColor={getServiceTextColor(service.name)}
                        isDashboard
                        content={service.name}
                        type="TRANSPORT"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Open Trip Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-3xl font-bold text-transpo-primary">
              Paket Wisata Open Trip
            </h2>

            <Link href="/tour-package/open-trip">
              <Button
                variant="link"
                className="text-[#0897B1] hover:text-[#0897B1]/80"
              >
                Lihat Semua
              </Button>
            </Link>
          </div>

          <div className="flex items-strech gap-x-2 overflow-x-auto ">
            {openTripLoading ? (
              <p>Loading...</p>
            ) : openTripError ? (
              <p>Error loading tour packages.</p>
            ) : (
              openTripData?.data.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/tour-package/open-trip/detail/${pkg.id}`}
                >
                  <Card className="w-full min-w-full max-w-full md:min-w-md md:max-w-md overflow-hidden bg-white shadow-none cursor-pointer !pt-0">
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
                                {pkg.tickets &&
                                pkg.tickets.filter(
                                  (t) => new Date(t.date) >= new Date()
                                ).length > 0
                                  ? new Date(
                                      pkg.tickets
                                        .filter(
                                          (t) => new Date(t.date) >= new Date()
                                        )
                                        .sort(
                                          (a, b) =>
                                            new Date(a.date).getTime() -
                                            new Date(b.date).getTime()
                                        )[0].date
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "Tanggal fleksibel"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Ticket className="w-4 h-4" />
                              <span>
                                Maksimal {pkg.maxPersonCapacity} tiket
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
        </div>

        {/* Private Trip Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-3xl font-bold text-transpo-primary">
              Paket Wisata Private Trip
            </h2>

            <Link href="/tour-package/private-trip">
              <Button
                variant="link"
                className="text-[#0897B1] hover:text-[#0897B1]/80"
              >
                Lihat Semua
              </Button>
            </Link>
          </div>

          <div className="flex items-strech gap-x-2 overflow-x-auto ">
            {privateTripLoading ? (
              <p>Loading...</p>
            ) : privateTripError ? (
              <p>Error loading tour packages.</p>
            ) : (
              privateTripData?.data.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/tour-package/private-trip/detail/${pkg.id}`}
                >
                  <Card className="w-full min-w-full max-w-full md:min-w-md md:max-w-md overflow-hidden bg-white shadow-none cursor-pointer !pt-0">
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
                      ) : (
                        <Badge className="absolute top-4 left-4 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1">
                          Open Tour
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
                              <Calendar className="w-4 h-4" />
                              <span>
                                {pkg.tickets && pkg.tickets.length > 0
                                  ? new Date(
                                      pkg.tickets[0].date
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "Tanggal fleksibel"}
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
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
