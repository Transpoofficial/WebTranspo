"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import servicesData from "@/data/services.json";
import OrderButton from "../components/order-button";
import { Users, DollarSign, Check, BusFront } from "lucide-react";
import Header from "@/components/header";

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
      default:
        return "/images/angkot/angkot_1.jpeg";
    }
  };

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

        <div className=" border-t-2 border-t-transpo-primary md:my-10" />

        {/* Services Section */}
        <div className="mb-6">
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
                    <OrderButton
                      textColor={getServiceTextColor(service.name)}
                      isDashboard
                      content={service.name}
                      type="TRANSPORT"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
