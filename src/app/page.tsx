'use client';

import { Separator } from "@/components/ui/separator";
import {
  BanknoteArrowUp,
  Bus,
  BusFront,
  CarFront,
  CreditCard,
  Handshake,
  Keyboard,
  ListChecks,
  LogIn,
  MapPinned,
  Phone,
  Quote,
  TreePalm,
  UsersRound,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Footer from "@/components/footer";
import Image from "next/image";
import Header from "../components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hurricane } from "next/font/google";
import Transportation from "./components/transportation";
import Hiace from "./components/hiace";
import Elf from "./components/elf";
import TourPackages from "./components/tour_packages";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRef } from "react";

const hurricane = Hurricane({
  weight: "400",
  subsets: ["latin"],
});

const Home = () => {
  const advantageRef = useRef<HTMLDivElement | null>(null);
  const howToOrderRef = useRef<HTMLDivElement | null>(null);
  const faqAndContactRef = useRef<HTMLDivElement | null>(null);
  const reviewRef = useRef<HTMLDivElement | null>(null);

  const scrollToAdvantage = () => {
    advantageRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const scrollToHowToOrder = () => {
    howToOrderRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const scrollToFAQAndContact = () => {
    faqAndContactRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const scrollToReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <Header scrollToAdvantage={scrollToAdvantage} scrollToHowToOrder={scrollToHowToOrder} scrollToFAQAndContact={scrollToFAQAndContact} scrollToReview={scrollToReview} />

      <main>
        {/* Carousel */}
        <div className="relative">
          <Image
            className="w-full h-120 object-cover"
            src="/images/angkot/angkot_4.jpg"
            alt="angkot_4.jpg"
            width={100}
            height={100}
          />
          
          {/* Backdrop */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/[.5]"></div>

          <div className="absolute top-1/2 left-1/2 -translate-1/2 w-full container">
            <div className="flex items-start gap-x-2">
              <Image
                className="min-w-24 w-24 md:min-w-50 md:w-50 h-full object-cover"
                src="/images/logo/logo_3.png"
                alt="logo_3.png"
                width={100}
                height={100}
              />

              <div className="md:pt-3">
                <h1 className="text-white text-4xl font-extrabold uppercase tracking-tight lg:text-7xl">
                  TRANSPO
                </h1>

                <div className="hidden md:block">
                  <h1
                    className={`mt-1 ${hurricane.className} text-white text-4xl font-extrabold uppercase tracking-tight lg:text-7xl`}
                  >
                    Dari Malang Raya untuk Indonesia
                  </h1>

                  <h4 className="text-white text-xl md:text-2xl font-semibold tracking-tight mt-2">
                    Transpo adalah startup inovatif yang menyediakan layanan
                    transportasi publik berbasis teknologi untuk mempermudah
                    mobilisasi wisatawan dan masyarakat dengan solusi
                    terjangkau, aman, dan nyaman.
                  </h4>
                </div>
              </div>
            </div>

            <div className="block md:hidden">
              <h1
                className={`mt-1 ${hurricane.className} text-white text-3xl font-extrabold uppercase tracking-tight lg:text-5xl`}
              >
                Dari Malang Raya untuk Indonesia
              </h1>

              <h4 className="text-white text-sm font-semibold tracking-tight mt-2">
                Transpo adalah startup inovatif yang menyediakan layanan
                transportasi publik berbasis teknologi untuk mempermudah
                mobilisasi wisatawan dan masyarakat dengan solusi terjangkau,
                aman, dan nyaman.
              </h4>
            </div>
          </div>
        </div>

        {/* Choose Transportation*/}
        <div className="container mt-10 md:mt-24 px-4 md:px-10 mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Pilih layanan sesuai kebutuhanmu
          </h1>

          {/* Tabs */}
          <div className="mt-6 md:mt-12">
            <Tabs defaultValue="angkot" className="w-full">
              <TabsList className="w-full min-h-max">
                <TabsTrigger value="angkot" className="flex-col min-h-max data-[state=active]:text-[#0897B1]">
                  <CarFront className="!w-8 !h-8" />
                  <span className="font-bold uppercase text-base">Angkot</span>
                </TabsTrigger>
                <TabsTrigger value="hiace" className="flex-col min-h-max data-[state=active]:text-[#0897B1]">
                  <BusFront className="!w-8 !h-8" />
                  <span className="font-bold uppercase text-base">HIACE</span>
                </TabsTrigger>
                <TabsTrigger value="elf" className="flex-col min-h-max data-[state=active]:text-[#0897B1]">
                  <Bus className="!w-8 !h-8" />
                  <span className="font-bold uppercase text-base">Elf</span>
                </TabsTrigger>
                <TabsTrigger
                  value="paket_wisata"
                  className="flex-col min-h-max data-[state=active]:text-[#0897B1]"
                >
                  <TreePalm className="!w-8 !h-8" />
                  <span className="font-bold uppercase text-base">
                    Paket wisata
                  </span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="angkot">
                <Transportation />
              </TabsContent>
              <TabsContent value="hiace">
                <Hiace />
              </TabsContent>
              <TabsContent value="elf">
                <Elf />
              </TabsContent>
              <TabsContent value="paket_wisata">
                <TourPackages />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* How to Order */}
        <div ref={howToOrderRef} className="container flex flex-col items-center mt-10 md:mt-24 px-4 md:px-10 mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">
            Cara Pesan <span className="text-[#0897B1]">Transpo</span>
          </h1>

          <ul className="mt-6 md:mt-12 flex items-start overflow-x-auto w-full">
            <li className="flex flex-col items-center gap-y-6">
              <h2 className="text-lg md:text-3xl font-bold">1</h2>

              <LogIn color="#0897B1" className="w-8 h-8 md:w-14 md:h-14" />

              <h2 className="text-base md:text-2xl font-bold text-center">
                Login/Register
              </h2>
            </li>

            <li className="my-auto min-w-16 w-16 md:w-full">
              <Separator />
            </li>

            <li className="flex flex-col items-center gap-y-6">
              <h2 className="text-lg md:text-3xl font-bold">2</h2>

              <ListChecks color="#0897B1" className="w-8 h-8 md:w-14 md:h-14" />

              <h2 className="text-base md:text-2xl font-bold text-center">
                Pilih Layanan
              </h2>
            </li>

            <li className="my-auto min-w-16 w-16 md:w-full">
              <Separator />
            </li>

            <li className="flex flex-col items-center gap-y-6">
              <h2 className="text-lg md:text-3xl font-bold">3</h2>

              <Keyboard color="#0897B1" className="w-8 h-8 md:w-14 md:h-14" />

              <h2 className="text-base md:text-2xl font-bold text-center">
                Masukkan Informasi
              </h2>
            </li>

            <li className="my-auto min-w-16 w-16 md:w-full">
              <Separator />
            </li>

            <li className="flex flex-col items-center gap-y-6">
              <h2 className="text-lg md:text-3xl font-bold">4</h2>

              <CreditCard color="#0897B1" className="w-8 h-8 md:w-14 md:h-14" />

              <h2 className="text-base md:text-2xl font-bold text-center">
                Pilih Metode Pembayaran
              </h2>
            </li>

            <li className="my-auto min-w-16 w-16 md:w-full">
              <Separator />
            </li>

            <li className="flex flex-col items-center gap-y-6">
              <h2 className="text-lg md:text-3xl font-bold">5</h2>

              <BanknoteArrowUp
                color="#0897B1"
                className="w-8 h-8 md:w-14 md:h-14"
              />

              <h2 className="text-base md:text-2xl font-bold text-center">
                Bayar
              </h2>
            </li>
          </ul>
        </div>

        {/* Advantages */}
        <div ref={advantageRef} className="container mx-auto mt-10 md:mt-24 px-4 md:px-10">
          <h1 className="block md:hidden text-3xl md:text-4xl text-center md:text-left font-bold">
            Kelebihan
          </h1>

          <div className="grid grid-cols-12 gap-x-0 md:gap-x-12 mt-6 md:mt-0">
            <div className="col-span-12 md:col-span-5">
              <Image
                className="w-full h-full md:min-h-96 md:h-96 object-cover rounded-3xl"
                src="/images/angkot/angkot_5.png"
                alt="angkot_5.png"
                width={500}
                height={500}
              />
            </div>
            
            <div className="col-span-12 md:col-span-7 mt-6 md:mt-0">
              <h1 className="hidden md:block text-3xl md:text-4xl text-center md:text-left font-bold">
                Kelebihan
              </h1>

              <ul className="md:mt-6 flex flex-col gap-y-3">
                <li className="flex items-start gap-x-4">
                  <div className="w-auto">
                    <MapPinned color="#0897B1" className="w-8 h-8 md:w-10 md:h-10" />
                  </div>

                  <div className="flex flex-col justify-start max-w-full">
                    <h5 className="text-base md:text-xl font-medium">
                      Aksesibilas Mudah
                    </h5>
                    <p className="text-base md:text-xl whitespace-wrap">
                      Layanan berbasis teknologi dengan fitur transparasi harga,
                      titik jemput, strategis dan kemudahan pemesanan.
                    </p>
                  </div>
                </li>

                <li className="flex items-center gap-x-4">
                  <div className="w-auto">
                    <Handshake color="#0897B1" className="w-8 h-8 md:w-10 md:h-10" />
                  </div>

                  <div className="flex flex-col justify-start">
                    <h5 className="text-base md:text-xl font-medium">
                      Pemberdayaan Lokal
                    </h5>
                    <p className="text-base md:text-xl">
                      Melibatkan pengemudi dan tempat wisata lokal untuk
                      pemberdayaan ekonomi.
                    </p>
                  </div>
                </li>

                <li className="flex items-center gap-x-4">
                  <div className="w-auto">
                    <UsersRound color="#0897B1" className="w-8 h-8 md:w-10 md:h-10" />
                  </div>

                  <div className="flex flex-col justify-start">
                    <h5 className="text-base md:text-xl font-medium">
                      Fleksibilitas Layanan
                    </h5>
                    <p className="text-base md:text-xl">
                      Menyediakan opsi sewa untuk kebutuhan kelompok ataupun
                      acara khusus.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="container mx-auto mt-10 md:mt-24 px-4 md:px-10">
          <h1 className="text-3xl md:text-4xl text-center font-bold">
            Artikel
          </h1>

          <div className="flex items-center overflow-y-auto gap-x-4 mt-6 md:mt-12">
            <Card className="min-w-xs max-w-xs md:min-w-md md:max-w-md">
              <CardContent>
                <Image
                  className="object-cover rounded-xl min-h-36 h-36 max-h-36 md:min-h-52 md:h-52 md:max-h-52"
                  src="/images/angkot/angkot_2.png"
                  alt="angkot_1.jpeg"
                  width={500}
                  height={500}
                />
                <div className="mt-2 text-lg font-semibold">
                  Angkutan Umum Kota Malang Bakal Berbasis Aplikasi Online
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">02 Mei 2025</p>
              </CardFooter>
            </Card>
            <Card className="min-w-xs max-w-xs md:min-w-md md:max-w-md">
              <CardContent>
                <Image
                  className="object-cover rounded-xl min-h-36 h-36 max-h-36 md:min-h-52 md:h-52 md:max-h-52"
                  src="/images/angkot/angkot_2.png"
                  alt="angkot_1.jpeg"
                  width={500}
                  height={500}
                />
                <div className="mt-2 text-lg font-semibold">
                  Angkutan Umum Kota Malang Bakal Berbasis Aplikasi Online
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">02 Mei 2025</p>
              </CardFooter>
            </Card>
            <Card className="min-w-xs max-w-xs md:min-w-md md:max-w-md">
              <CardContent>
                <Image
                  className="object-cover rounded-xl min-h-36 h-36 max-h-36 md:min-h-52 md:h-52 md:max-h-52"
                  src="/images/angkot/angkot_2.png"
                  alt="angkot_1.jpeg"
                  width={500}
                  height={500}
                />
                <div className="mt-2 text-lg font-semibold">
                  Angkutan Umum Kota Malang Bakal Berbasis Aplikasi Online
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">02 Mei 2025</p>
              </CardFooter>
            </Card>
            <Card className="min-w-xs max-w-xs md:min-w-md md:max-w-md">
              <CardContent>
                <Image
                  className="object-cover rounded-xl min-h-36 h-36 max-h-36 md:min-h-52 md:h-52 md:max-h-52"
                  src="/images/angkot/angkot_2.png"
                  alt="angkot_1.jpeg"
                  width={500}
                  height={500}
                />
                <div className="mt-2 text-lg font-semibold">
                  Angkutan Umum Kota Malang Bakal Berbasis Aplikasi Online
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">02 Mei 2025</p>
              </CardFooter>
            </Card>
            <Card className="min-w-xs max-w-xs md:min-w-md md:max-w-md">
              <CardContent>
                <Image
                  className="object-cover rounded-xl min-h-36 h-36 max-h-36 md:min-h-52 md:h-52 md:max-h-52"
                  src="/images/angkot/angkot_2.png"
                  alt="angkot_1.jpeg"
                  width={500}
                  height={500}
                />
                <div className="mt-2 text-lg font-semibold">
                  Angkutan Umum Kota Malang Bakal Berbasis Aplikasi Online
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">02 Mei 2025</p>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Review */}
        <div ref={reviewRef} className="container mx-auto mt-10 md:mt-24 px-4 md:px-10">
          <h1 className="text-center text-3xl md:text-4xl font-bold">Review</h1>

          <Carousel
            opts={{
              align: "center",
            }}
            className="w-full mt-3 md:mt-9"
          >
            <CarouselContent className="py-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="py-4 px-6 shadow-md rounded-3xl border">
                    <Quote size={20} />
                    <p className="text-xs md:text-sm mt-2 mb-3">
                      Layanan yang sangat memuaskan! Prosesnya cepat dan mudah,
                      dan saya sangat terbantu dengan fitur transparansi harga.
                      Sangat recommended!
                    </p>

                    <h6 className="text-sm md:text-base font-bold underline">
                      Anthony
                    </h6>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Contact */}
        <div ref={faqAndContactRef} className="container mx-auto my-10 md:my-24 px-4 md:px-10 grid grid-cols-12 gap-x-0 md:gap-x-12">
          <div className="col-span-12 md:col-span-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg md:text-xl">
                  Harga?
                </AccordionTrigger>
                <AccordionContent className="text-base md:text-lg">
                  Mulai dari Rp.100,000.00 kamu udah bisa jalan-jalan.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg md:text-xl">
                  Berapa kapasitas orang per-angkot?
                </AccordionTrigger>
                <AccordionContent className="text-base md:text-lg">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Harum, iure.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg md:text-xl">
                  Kapan waktu terakhir melakukan pemesanan?
                </AccordionTrigger>
                <AccordionContent className="text-base md:text-lg">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Harum, iure.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg md:text-xl">
                  Apakah paket wisata sudah include semua?
                </AccordionTrigger>
                <AccordionContent className="text-base md:text-lg">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Harum, iure.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="col-span-12 md:col-span-6 mt-4 md:mt-0">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              Frequently Asked Question
            </h1>

            <h5 className="text-base md:text-xl mb-4 md:mb-6">
              Punya pertanyaan lain? Langsung hubungin Admin ajahh
            </h5>

            <Button className="cursor-pointer">
              <Phone />
              Admin
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Home;
