import React from "react";
import { CalendarDays, UsersRound } from "lucide-react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import Image from "next/image";

const TourPackages = () => {
  return (
    <>
      <div className="mx-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Untuk Anda</h2>
          <Button variant="link" className="cursor-pointer">
            Lihat semua
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-x-4">
          <div className="col-span-3">
            <button className="cursor-pointer">
              {/* Card Image */}
              <div className="mb-2.5">
                <Image
                  src=""
                  alt="card_img"
                  className="aspect-3/2 object-cover rounded-3xl"
                />
              </div>

              {/* Title */}
              <p
                title="Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna & Sendang
            Biru"
                className="text-sm text-left font-medium line-clamp-2 mb-2.5"
              >
                Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna &
                Sendang Biru
              </p>

              <Separator orientation="horizontal" />

              <div className="flex flex-col gap-y-1.5 mt-2.5">
                <span className="inline-flex items-center gap-x-2">
                  <UsersRound color="#6A6A6A" size={16} />
                  <span className="text-sm">8 orang dewasa</span>
                </span>

                <span className="inline-flex items-center gap-x-2">
                  <CalendarDays color="#6A6A6A" size={16} />
                  <span className="text-sm">1-3 Maret 2025</span>
                </span>
              </div>

              <p className="mt-2.5 text-sm text-left font-medium underline ">
                Rp 500.000/pax
              </p>
            </button>
          </div>
          <div className="col-span-3">
            <button className="cursor-pointer">
              {/* Card Image */}
              <div className="mb-2.5">
                <Image
                  src=""
                  alt="card_img"
                  className="aspect-3/2 object-cover rounded-3xl"
                />
              </div>

              {/* Title */}
              <p
                title="Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna & Sendang
            Biru"
                className="text-sm text-left font-medium line-clamp-2 mb-2.5"
              >
                Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna &
                Sendang Biru
              </p>

              <Separator orientation="horizontal" />

              <div className="flex flex-col gap-y-1.5 mt-2.5">
                <span className="inline-flex items-center gap-x-2">
                  <UsersRound color="#6A6A6A" size={16} />
                  <span className="text-sm">8 orang dewasa</span>
                </span>

                <span className="inline-flex items-center gap-x-2">
                  <CalendarDays color="#6A6A6A" size={16} />
                  <span className="text-sm">1-3 Maret 2025</span>
                </span>
              </div>

              <p className="mt-2.5 text-sm text-left font-medium underline ">
                Rp 500.000/pax
              </p>
            </button>
          </div>
          <div className="col-span-3">
            <button className="cursor-pointer">
              {/* Card Image */}
              <div className="mb-2.5">
                <Image
                  src=""
                  alt="card_img"
                  className="aspect-3/2 object-cover rounded-3xl"
                />
              </div>

              {/* Title */}
              <p
                title="Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna & Sendang
            Biru"
                className="text-sm text-left font-medium line-clamp-2 mb-2.5"
              >
                Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna &
                Sendang Biru
              </p>

              <Separator orientation="horizontal" />

              <div className="flex flex-col gap-y-1.5 mt-2.5">
                <span className="inline-flex items-center gap-x-2">
                  <UsersRound color="#6A6A6A" size={16} />
                  <span className="text-sm">8 orang dewasa</span>
                </span>

                <span className="inline-flex items-center gap-x-2">
                  <CalendarDays color="#6A6A6A" size={16} />
                  <span className="text-sm">1-3 Maret 2025</span>
                </span>
              </div>

              <p className="mt-2.5 text-sm text-left font-medium underline ">
                Rp 500.000/pax
              </p>
            </button>
          </div>
          <div className="col-span-3">
            <button className="cursor-pointer">
              {/* Card Image */}
              <div className="mb-2.5">
                <Image
                  src=""
                  alt="card_img"
                  className="aspect-3/2 object-cover rounded-3xl"
                />
              </div>

              {/* Title */}
              <p
                title="Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna & Sendang
            Biru"
                className="text-sm text-left font-medium line-clamp-2 mb-2.5"
              >
                Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna &
                Sendang Biru
              </p>

              <Separator orientation="horizontal" />

              <div className="flex flex-col gap-y-1.5 mt-2.5">
                <span className="inline-flex items-center gap-x-2">
                  <UsersRound color="#6A6A6A" size={16} />
                  <span className="text-sm">8 orang dewasa</span>
                </span>

                <span className="inline-flex items-center gap-x-2">
                  <CalendarDays color="#6A6A6A" size={16} />
                  <span className="text-sm">1-3 Maret 2025</span>
                </span>
              </div>

              <p className="mt-2.5 text-sm text-left font-medium underline ">
                Rp 500.000/pax
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourPackages;
