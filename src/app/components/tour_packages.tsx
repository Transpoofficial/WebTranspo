"use client";

import React from "react";
import { CalendarDays, UsersRound } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

const tourPackages = [
  {
    id: 1,
    image: "/images/paket_wisata/paket_wisata_1.jpg",
    title:
      "Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna & Sendang Biru",
    capacity: "8 orang dewasa",
    date: "1-3 Maret 2025",
    price: "Rp 500.000/pax",
  },
  {
    id: 2,
    image: "/images/paket_wisata/paket_wisata_1.jpg",
    title:
      "Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna & Sendang Biru",
    capacity: "8 orang dewasa",
    date: "1-3 Maret 2025",
    price: "Rp 500.000/pax",
  },
  {
    id: 3,
    image: "/images/paket_wisata/paket_wisata_1.jpg",
    title:
      "Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna & Sendang Biru",
    capacity: "8 orang dewasa",
    date: "1-3 Maret 2025",
    price: "Rp 500.000/pax",
  },
  {
    id: 4,
    image: "/images/paket_wisata/paket_wisata_1.jpg",
    title:
      "Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna & Sendang Biru",
    capacity: "8 orang dewasa",
    date: "1-3 Maret 2025",
    price: "Rp 500.000/pax",
  },
];

const TourPackages = () => {
  const router = useRouter();
  const handlePackageClick = (id: string) => {
    router.push(`/order/tour-package/${id}`);
  };
  return (
    <>
      <Card className="bg-[#0897B1]">
        <CardContent>
          <div className="grid grid-cols-12 gap-4">
            {tourPackages.map((tourPackage) => (
              <div
                onClick={() => handlePackageClick(`${tourPackage.id}`)}
                key={tourPackage.id}
                className="col-span-12 md:col-span-3"
              >
                <button className="cursor-pointer">
                  {/* Card Image */}
                  <div className="mb-2.5">
                    <Image
                      src={tourPackage.image}
                      alt={`paket_wisata_${tourPackage.id}`}
                      className="aspect-3/2 object-cover rounded-xl"
                      width={500}
                      height={500}
                    />
                  </div>

                  {/* Title */}
                  <p
                    title={tourPackage.title}
                    className="text-sm text-left font-medium line-clamp-2 mb-2.5 text-white"
                  >
                    {tourPackage.title}
                  </p>

                  <Separator orientation="horizontal" className="bg-zinc-700" />

                  <div className="flex flex-col gap-y-1.5 mt-2.5">
                    <span className="inline-flex items-center gap-x-2 text-white">
                      <UsersRound size={16} />
                      <span className="text-sm">{tourPackage.capacity}</span>
                    </span>

                    <span className="inline-flex items-center gap-x-2 text-white">
                      <CalendarDays size={16} />
                      <span className="text-sm">{tourPackage.date}</span>
                    </span>
                  </div>

                  <p className="mt-2.5 text-sm text-left font-medium underline text-white">
                    {tourPackage.price}
                  </p>
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TourPackages;
