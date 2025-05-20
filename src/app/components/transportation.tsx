import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";

const Transportation = () => {
  return (
    <>
      <Card>
        <CardContent className="flex flex-col md:flex-row items-stretch gap-x-6">
          <img
            className="min-w-full md:min-w-lg h-96 object-cover rounded-2xl shadow-lg"
            src="https://www.blok-a.com/wp-content/uploads/2022/12/whatsapp-image-2022-12-28-at-08.06.53.jpeg"
            alt="angkot.jpeg"
            width={100}
            height={100}
          />

          <div className="flex flex-col gap-y-2 w-full mt-4">
            <div className="flex items-center gap-x-2">
              <CarFront className="!w-8 !h-8" />
              <h3 className="text-2xl font-bold tracking-tight">
                Angkot
              </h3>
            </div>

            <div className="grow flex flex-col justify-between">
              <div>
                <p className="leading-7 text-sm md:text-base">
                  Informasi kendaraan:
                </p>
                <ul className="mt-1 mb-6 ml-6 list-disc text-sm md:text-base">
                  <li>Muat hingga 10 orang, cocok untuk rombongan kecil.</li>
                  <li>Harga sewa ekonomis, mulai dari Rp100.000 per hari.</li>
                  <li>Ideal untuk city tour Malang-Batu atau antar-jemput kegiatan kampus.</li>
                  <li>Dilengkapi musik dan jendela besar untuk pengalaman perjalanan terbuka.</li>
                  <li>Fleksibel dalam penjemputan dan penurunan di banyak titik.</li>
                  <li>Praktis untuk perjalanan singkat dalam kota tanpa perlu kendaraan besar.</li>
                </ul>
              </div>

              <Button size="lg" className="text-base w-min">Pesan sekarang</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Transportation;
