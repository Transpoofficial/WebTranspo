"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BusFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import OrderButton from "./order-button";

const Hiace = () => {
  const [activeTab, setActiveTab] = useState("commuter");

  const imageSrc =
    activeTab === "commuter"
      ? "/images/hiace/commuter/commuter.jpg"
      : "/images/hiace/premio/premio_4.jpg";

  return (
    <>
      <Card className="bg-[#0897B1]">
        <CardContent className="flex flex-col md:flex-row items-stretch gap-x-6">
          <Image
            className="min-w-full md:min-w-lg min-h-52 h-52 max-h-52 md:min-h-96 md:h-96 md:max-h-96 object-cover rounded-2xl shadow-lg"
            src={imageSrc}
            alt={activeTab === "commuter" ? "HIACE Commuter" : "HIACE Premio"}
            width={500}
            height={500}
          />

          <div className="flex flex-col gap-y-2 w-full mt-4">
            <div className="flex items-center gap-x-2">
              <BusFront className="!w-10 !h-10" color="#FFFFFF" />
              <h2 className="text-3xl font-bold tracking-tight text-white">
                HIACE
              </h2>
            </div>

            <div className="grow flex flex-col justify-between mt-1">
              <Tabs
                defaultValue="commuter"
                value={activeTab}
                onValueChange={(value) => setActiveTab(value)}
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="commuter">HIACE Commuter</TabsTrigger>
                  <TabsTrigger value="premio">HIACE Premio</TabsTrigger>
                </TabsList>
                <TabsContent value="commuter">
                  <p className="leading-7 text-base md:text-xl text-white">
                    Informasi kendaraan:
                  </p>
                  <ul className="mt-1 mb-6 ml-6 list-disc text-base md:text-xl text-white">
                    <li>Muat hingga 15 orang, cocok untuk rombongan.</li>
                    <li>
                      Harga sewa ekonomis untuk ukuran mobil besar, mulai
                      999.000 per hari.
                    </li>
                    <li>Ideal untuk perjalanan ke luar kota dan provinsi.</li>
                    <li>
                      Dilengkapi musik, mic untuk karaoke seru-seruan, AC yang
                      dingin, dan free air mineral.
                    </li>
                    <li>
                      Fleksibel dan nyaman untuk mengunjungi banyak destinasi
                      sekaligus dengan jarak yang jauh.
                    </li>
                    <li>Cocok untuk perjalanan jauh dalam waktu yang lama.</li>
                  </ul>
                </TabsContent>
                <TabsContent value="premio">
                  <p className="leading-7 text-base md:text-xl text-white">
                    Informasi kendaraan:
                  </p>
                  <ul className="mt-1 mb-6 ml-6 list-disc text-base md:text-xl text-white">
                    <li>Muat hingga 14 orang, cocok untuk rombongan.</li>
                    <li>
                      Harga sewa ekonomis untuk ukuran mobil besar, mulai
                      1.100.000 per hari.
                    </li>
                    <li>Ideal untuk perjalanan ke luar kota dan provinsi.</li>
                    <li>
                      Dilengkapi musik, mic untuk karaoke seru-seruan, AC yang
                      dingin, dan free air mineral.
                    </li>
                    <li>Interior armada mewah dan bikin nyaman.</li>
                    <li>
                      Fleksibel dan nyaman untuk mengunjungi banyak destinasi
                      sekaligus dengan jarak yang jauh.
                    </li>
                    <li>Cocok untuk perjalanan jauh dalam waktu yang lama.</li>
                  </ul>
                </TabsContent>
              </Tabs>

              <OrderButton content={`hiace-${activeTab}`} type="TRANSPORT" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Hiace;
