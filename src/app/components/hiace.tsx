import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { BusFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Hiace = () => {
  return (
    <>
      <Card>
        <CardContent className="flex flex-col md:flex-row items-stretch gap-x-6">
          <img
            className="min-w-full md:min-w-lg h-96 object-cover rounded-2xl shadow-lg"
            src="https://th.bing.com/th/id/OIP.e5dFblG5uR4xQ6nU2lFh-AHaFj?cb=iwc2&rs=1&pid=ImgDetMain"
            alt="hiace.jpg"
            width={100}
            height={100}
          />

          <div className="flex flex-col gap-y-2 w-full mt-4">
            <div className="flex items-center gap-x-2">
              <BusFront className="!w-8 !h-8" />
              <h3 className="text-2xl font-bold tracking-tight">
                HIACE
              </h3>
            </div>

            <div className="grow flex flex-col justify-between mt-1">
              <Tabs defaultValue="commuter" className="w-full">
                <TabsList>
                  <TabsTrigger value="commuter">HIACE Commuter</TabsTrigger>
                  <TabsTrigger value="premio">HIACE Premio</TabsTrigger>
                </TabsList>
                <TabsContent value="commuter">
                  <p className="leading-7 text-sm md:text-base">
                    Informasi kendaraan:
                  </p>
                  <ul className="mt-1 mb-6 ml-6 list-disc text-sm md:text-base">
                    <li>Muat hingga 15 orang, cocok untuk rombongan.</li>
                    <li>Harga sewa ekonomis untuk ukuran mobil besar, mulai 999.000 per hari.</li>
                    <li>Ideal untuk perjalanan ke luar kota dan provinsi.</li>
                    <li>Dilengkapi musik, mic untuk karaoke seru-seruan, AC yang dingin, dan free air mineral.</li>
                    <li>Fleksibel dan nyaman untuk mengunjungi banyak destinasi sekaligus dengan jarak yang jauh.</li>
                    <li>Cocok untuk perjalanan jauh dalam waktu yang lama.</li>
                  </ul>
                </TabsContent>
                <TabsContent value="premio">
                  <p className="leading-7 text-sm md:text-base">
                    Informasi kendaraan:
                  </p>
                  <ul className="mt-1 mb-6 ml-6 list-disc text-sm md:text-base">
                    <li>Muat hingga 14 orang, cocok untuk rombongan.</li>
                    <li>Harga sewa ekonomis untuk ukuran mobil besar, mulai 1.100.000 per hari.</li>
                    <li>Ideal untuk perjalanan ke luar kota dan provinsi.</li>
                    <li>Dilengkapi musik, mic untuk karaoke seru-seruan, AC yang dingin, dan free air mineral.</li>
                    <li>Interior armada mewah dan bikin nyaman.</li>
                    <li>Fleksibel dan nyaman untuk mengunjungi banyak destinasi sekaligus dengan jarak yang jauh.</li>
                    <li>Cocok untuk perjalanan jauh dalam waktu yang lama.</li>
                  </ul>
                </TabsContent>
              </Tabs>

              <Button size="lg" className="text-base w-min">Pesan sekarang</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Hiace;
