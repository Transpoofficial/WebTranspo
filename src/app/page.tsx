"use client";

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
  Star,
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
import Elf from "./components/elf";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import HiaceCommuter from "./components/hiace-commuter";
import HiacePremio from "./components/hiace-premio";
import Link from "next/link";

const hurricane = Hurricane({
  weight: "400",
  subsets: ["latin"],
});

interface Article {
  id: string;
  title: string;
  mainImgUrl: string;
  createdAt: string;
  author: {
    fullName: string;
  };
}

interface Review {
  id: string;
  rating: number;
  content: string;
  order: {
    user: {
      fullName: string;
    };
  };
}

const Home = () => {
  const router = useRouter();

  const {
    data: articlesData,
    isLoading: isLoadingArticles,
    error: articlesError,
  } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data } = await axios.get("/api/articles");
      return data;
    },
  });

  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    error: reviewsError,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data } = await axios.get("/api/reviews");
      return data;
    },
  });

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

        {/* How to Order */}
        <div
          ref={howToOrderRef}
          className="container flex flex-col items-center mt-10 md:mt-24 px-4 md:px-10 mx-auto"
        >
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
        <div
          ref={advantageRef}
          className="container mx-auto mt-10 md:mt-24 px-4 md:px-10"
        >
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
                    <MapPinned
                      color="#0897B1"
                      className="w-8 h-8 md:w-10 md:h-10"
                    />
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
                    <Handshake
                      color="#0897B1"
                      className="w-8 h-8 md:w-10 md:h-10"
                    />
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
                    <UsersRound
                      color="#0897B1"
                      className="w-8 h-8 md:w-10 md:h-10"
                    />
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

        {/* Choose Transportation*/}
        <div
          ref={serviceRef}
          className="container mt-10 md:mt-24 px-4 md:px-10 mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Pilih layanan sesuai kebutuhanmu
          </h1>

          {/* Tabs */}
          <div className="mt-6 md:mt-12">
            <Tabs defaultValue="angkot" className="w-full">
              <TabsList className="w-full min-h-max">
                <TabsTrigger
                  value="angkot"
                  className="flex-col min-h-max data-[state=active]:text-[#0897B1]"
                >
                  <CarFront className="!w-8 !h-8" />
                  <span className="font-bold uppercase text-base">Angkot</span>
                </TabsTrigger>
                <TabsTrigger
                  value="hiace_commuter"
                  className="flex-col min-h-max data-[state=active]:text-[#0897B1]"
                >
                  <BusFront className="!w-8 !h-8" />
                  <span className="font-bold uppercase text-base">
                    HIACE Commuter
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="hiace_premio"
                  className="flex-col min-h-max data-[state=active]:text-[#0897B1]"
                >
                  <BusFront className="!w-8 !h-8" />
                  <span className="font-bold uppercase text-base">
                    HIACE Premio
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="elf"
                  className="flex-col min-h-max data-[state=active]:text-[#0897B1]"
                >
                  <Bus className="!w-8 !h-8" />
                  <span className="font-bold uppercase text-base">Elf</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="angkot">
                <Transportation />
              </TabsContent>
              <TabsContent value="hiace_commuter">
                <HiaceCommuter />
              </TabsContent>
              <TabsContent value="hiace_premio">
                <HiacePremio />
              </TabsContent>
              <TabsContent value="elf">
                <Elf />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Articles */}
        <div
          ref={articleRef}
          className="container mx-auto mt-10 md:mt-24 px-4 md:px-10"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl text-center font-bold">
              Artikel
            </h1>
            <Button
              variant="link"
              onClick={() => router.push("/articles")}
              className="text-[#0897B1] hover:text-[#0897B1]/80"
            >
              Lihat Semua
            </Button>
          </div>

          {isLoadingArticles ? (
            <div className="flex justify-center mt-6 md:mt-12">Loading...</div>
          ) : articlesError ? (
            <div className="flex justify-center mt-6 md:mt-12 text-red-500">
              Error loading articles
            </div>
          ) : (
            <div className="flex items-center overflow-y-auto gap-x-4 mt-6 md:mt-12">
              {articlesData?.data?.slice(0, 10).map((article: Article) => (
                <Card
                  key={article.id}
                  className="min-w-xs max-w-xs md:min-w-md md:max-w-md"
                >
                  <CardContent>
                    <Image
                      className="object-cover rounded-xl min-h-36 h-36 max-h-36 md:min-h-52 md:h-52 md:max-h-52"
                      src={article.mainImgUrl || "/images/angkot/angkot_2.png"}
                      alt={article.title}
                      width={500}
                      height={500}
                    />
                    <div className="mt-2 text-lg font-semibold line-clamp-2">
                      {article.title}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      By {article.author.fullName}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">
                      {new Date(article.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Review */}
        <div
          ref={reviewRef}
          className="container mx-auto mt-10 md:mt-24 px-4 md:px-10"
        >
          <h1 className="text-center text-3xl md:text-4xl font-bold">Review</h1>

          <Carousel
            opts={{
              align: "center",
            }}
            className="w-full mt-3 md:mt-9"
          >
            <CarouselContent className="py-3">
              {isLoadingReviews ? (
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="py-4 px-6 shadow-md rounded-3xl border">
                    Loading reviews...
                  </div>
                </CarouselItem>
              ) : reviewsError ? (
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="py-4 px-6 shadow-md rounded-3xl border">
                    Error loading reviews
                  </div>
                </CarouselItem>
              ) : (
                reviewsData?.data.map((review: Review) => (
                  <CarouselItem
                    key={review.id}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="py-4 px-6 shadow-md rounded-3xl border">
                      <Quote size={20} />
                      <div className="flex gap-0.5 mt-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={16}
                            className={
                              index < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <p
                        title={review.content}
                        className="text-xs md:text-sm mt-2 mb-3 line-clamp-3 text-ellipsis"
                      >
                        {review.content}
                      </p>
                      <h6 className="text-sm md:text-base font-bold underline">
                        {review.order.user.fullName}
                      </h6>
                    </div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Contact */}
        <div className="container mx-auto my-10 md:my-24 px-4 md:px-10 grid grid-cols-12 gap-x-0 md:gap-x-12">
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

            <Link href="https://wa.me/6282231378326" target="_blank">
              <Button className="cursor-pointer bg-[#33E73C] hover:bg-[#33E73C]/90">
                <Phone />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Home;
