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
  // Quote,
  // Star,
  UsersRound,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
// } from "@/components/ui/carousel";
import Footer from "@/components/footer";
import Image from "next/image";
import Header from "../components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hurricane } from "next/font/google";
import Transportation from "./components/transportation";
import Elf from "./components/elf";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import HiaceCommuter from "./components/hiace-commuter";
import HiacePremio from "./components/hiace-premio";
import Link from "next/link";
import TourPackages from "./components/tour-packages";
import TrustedBy from "./components/trusted-by";
import Achievement from "./components/achievement";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Animation variants
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const slideUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const slideDown: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const tabContentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
}; const hurricane = Hurricane({
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

// interface Review {
//   id: string;
//   rating: number;
//   content: string;
//   order: {
//     user: {
//       fullName: string;
//     };
//   };
// }

const Home = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("angkot");

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

  // const {
  //   data: reviewsData,
  //   isLoading: isLoadingReviews,
  //   error: reviewsError,
  // } = useQuery({
  //   queryKey: ["reviews"],
  //   queryFn: async () => {
  //     const { data } = await axios.get("/api/reviews");
  //     return data;
  //   },
  // });

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
        <motion.div
          className="relative"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Image
            className="w-full min-h-120 h-120 max-h-120 object-cover object-center"
            src="/images/hero_image.jpg"
            alt="hero_image.jpg"
            width={500}
            height={500}
          />

          {/* Backdrop */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/[.5]"></div>

          <div className="absolute top-1/2 left-1/2 -translate-1/2 w-full container">
            <motion.div
              className="flex items-center md:items-start gap-x-2"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={scaleIn}>
                <Image
                  className="min-w-24 w-24 md:min-w-50 md:w-50 h-full object-cover"
                  src="/images/logo/logo_3.png"
                  alt="logo_3.png"
                  width={100}
                  height={100}
                />
              </motion.div>

              <div className="md:pt-3">
                <motion.h1
                  className="text-white text-4xl font-extrabold uppercase tracking-tight lg:text-7xl"
                  variants={slideRight}
                >
                  TRANSPO
                </motion.h1>

                <div className="hidden md:block">
                  <motion.h1
                    className={`mt-1 ${hurricane.className} text-white text-4xl font-extrabold uppercase tracking-tight lg:text-7xl`}
                    variants={slideRight}
                  >
                    Dari Malang Raya untuk Indonesia
                  </motion.h1>

                  <motion.h4
                    className="text-white text-xl md:text-2xl font-semibold tracking-tight mt-2"
                    variants={slideRight}
                  >
                    Transpo adalah startup inovatif yang menyediakan layanan
                    transportasi publik berbasis teknologi untuk mempermudah
                    mobilisasi wisatawan dan masyarakat dengan solusi
                    terjangkau, aman, dan nyaman.
                  </motion.h4>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="block md:hidden w-full pl-3"
              initial="hidden"
              animate="visible"
              variants={slideUp}
            >
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
            </motion.div>
          </div>
        </motion.div>

        {/* How to Order */}
        <motion.div
          ref={howToOrderRef}
          className="container flex flex-col items-center mt-10 md:mt-24 px-4 md:px-10 mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={slideUp}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold"
            variants={slideDown}
          >
            Cara Pesan <span className="text-[#0897B1]">Transpo</span>
          </motion.h1>

          <motion.ul
            className="mt-6 md:mt-12 flex items-start overflow-x-auto overflow-y-hidden w-full"
            variants={staggerContainer}
          >
            <motion.li
              className="flex flex-col items-center gap-y-6"
              variants={slideUp}
            >
              <h2 className="text-lg md:text-3xl font-bold">1</h2>

              <LogIn color="#0897B1" className="w-8 h-8 md:w-14 md:h-14" />

              <h2 className="text-base md:text-2xl font-bold text-center">
                Login/Register
              </h2>
            </motion.li>

            <li className="my-auto min-w-16 w-16 md:w-full">
              <Separator />
            </li>

            <motion.li
              className="flex flex-col items-center gap-y-6"
              variants={slideUp}
            >
              <h2 className="text-lg md:text-3xl font-bold">2</h2>

              <ListChecks color="#0897B1" className="w-8 h-8 md:w-14 md:h-14" />

              <h2 className="text-base md:text-2xl font-bold text-center">
                Pilih Layanan
              </h2>
            </motion.li>

            <li className="my-auto min-w-16 w-16 md:w-full">
              <Separator />
            </li>

            <motion.li
              className="flex flex-col items-center gap-y-6"
              variants={slideUp}
            >
              <h2 className="text-lg md:text-3xl font-bold">3</h2>

              <Keyboard color="#0897B1" className="w-8 h-8 md:w-14 md:h-14" />

              <h2 className="text-base md:text-2xl font-bold text-center">
                Masukkan Informasi
              </h2>
            </motion.li>

            <li className="my-auto min-w-16 w-16 md:w-full">
              <Separator />
            </li>

            <motion.li
              className="flex flex-col items-center gap-y-6"
              variants={slideUp}
            >
              <h2 className="text-lg md:text-3xl font-bold">4</h2>

              <CreditCard color="#0897B1" className="w-8 h-8 md:w-14 md:h-14" />

              <h2 className="text-base md:text-2xl font-bold text-center">
                Pilih Metode Pembayaran
              </h2>
            </motion.li>

            <li className="my-auto min-w-16 w-16 md:w-full">
              <Separator />
            </li>

            <motion.li
              className="flex flex-col items-center gap-y-6"
              variants={slideUp}
            >
              <h2 className="text-lg md:text-3xl font-bold">5</h2>

              <BanknoteArrowUp
                color="#0897B1"
                className="w-8 h-8 md:w-14 md:h-14"
              />

              <h2 className="text-base md:text-2xl font-bold text-center">
                Bayar
              </h2>
            </motion.li>
          </motion.ul>
        </motion.div>

        {/* Advantages */}
        <motion.div
          ref={advantageRef}
          className="container mx-auto mt-10 md:mt-24 px-4 md:px-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <motion.h1
            className="block md:hidden text-3xl md:text-4xl text-center md:text-left font-bold"
            variants={slideDown}
          >
            Kelebihan
          </motion.h1>

          <div className="grid grid-cols-12 gap-x-0 md:gap-x-12 mt-6 md:mt-0">
            <motion.div
              className="col-span-12 md:col-span-5"
              variants={slideLeft}
            >
              <Image
                className="w-full h-full md:min-h-96 md:h-96 object-cover rounded-3xl"
                src="/images/angkot/angkot_5.png"
                alt="angkot_5.png"
                width={500}
                height={500}
              />
            </motion.div>

            <motion.div
              className="col-span-12 md:col-span-7 mt-6 md:mt-0"
              variants={slideRight}
            >
              <h1 className="hidden md:block text-3xl md:text-4xl text-center md:text-left font-bold">
                Kelebihan
              </h1>

              <motion.ul
                className="md:mt-6 flex flex-col gap-y-3"
                variants={staggerContainer}
              >
                <motion.li
                  className="flex items-start gap-x-4"
                  variants={slideUp}
                >
                  <div className="w-auto">
                    <MapPinned
                      color="#0897B1"
                      className="w-8 h-8 md:w-10 md:h-10"
                    />
                  </div>

                  <div className="flex flex-col justify-start max-w-full">
                    <h5 className="text-base md:text-xl font-medium">
                      Aksesibilitas Mudah
                    </h5>
                    <p className="text-base md:text-xl whitespace-wrap">
                      Layanan berbasis teknologi dengan fitur transparasi harga,
                      titik jemput, strategis dan kemudahan pemesanan.
                    </p>
                  </div>
                </motion.li>

                <motion.li
                  className="flex items-center gap-x-4"
                  variants={slideUp}
                >
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
                </motion.li>

                <motion.li
                  className="flex items-center gap-x-4"
                  variants={slideUp}
                >
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
                </motion.li>
              </motion.ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Choose Transportation*/}
        <motion.div
          ref={serviceRef}
          className="container mt-10 md:mt-24 px-4 md:px-10 mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-center"
            variants={slideDown}
          >
            Pilih layanan sesuai kebutuhanmu
          </motion.h1>

          {/* Tabs */}
          <motion.div
            className="mt-6 md:mt-12"
            variants={slideUp}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full min-h-max justify-normal md:justify-center overflow-x-auto">
                <TabsTrigger
                  value="angkot"
                  className="grow flex-col min-h-max data-[state=active]:text-[#0897B1]"
                >
                  <CarFront className="!w-8 !h-8" />
                  <span className="font-bold uppercase text-base">Angkot</span>
                </TabsTrigger>
                <TabsTrigger
                  value="hiace_commuter"
                  className="grow flex-col min-h-max data-[state=active]:text-[#0897B1]"
                >
                  <BusFront className="!w-8 !h-8" />
                  <span className="font-bold uppercase text-base">
                    HIACE Commuter
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="hiace_premio"
                  className="grow flex-col min-h-max data-[state=active]:text-[#0897B1]"
                >
                  <BusFront className="!w-8 !h-8" />
                  <span className="font-bold uppercase text-base">
                    HIACE Premio
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="elf"
                  className="grow flex-col min-h-max data-[state=active]:text-[#0897B1]"
                >
                  <Bus className="!w-8 !h-8" />
                  <span className="font-bold uppercase text-base">Elf</span>
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="angkot" key="angkot">
                  <motion.div
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Transportation />
                  </motion.div>
                </TabsContent>

                <TabsContent value="hiace_commuter" key="hiace_commuter">
                  <motion.div
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <HiaceCommuter />
                  </motion.div>
                </TabsContent>

                <TabsContent value="hiace_premio" key="hiace_premio">
                  <motion.div
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <HiacePremio />
                  </motion.div>
                </TabsContent>

                <TabsContent value="elf" key="elf">
                  <motion.div
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Elf />
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </motion.div>

        {/* Tour Packages */}
        <motion.div
          className="container mt-10 md:mt-24 px-0 md:px-6 mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={slideUp}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-center px-4"
            variants={slideDown}
          >
            Paket Wisata Malang
          </motion.h1>

          <motion.div
            className="mt-6 md:mt-12"
            variants={fadeIn}
          >
            <TourPackages />
          </motion.div>
        </motion.div>

        {/* Articles */}
        <div
          ref={articleRef}
          className="container mx-auto mt-10 md:mt-24 px-4 md:px-10"
        >
          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={slideDown}
          >
            <h1 className="text-3xl md:text-4xl text-center font-bold">
              Artikel
            </h1>

            <div className="absolute top-1/2 -translate-y-1/2 right-0">
              <Button
                variant="link"
                onClick={() => router.push("/articles")}
                className="text-[#0897B1] hover:text-[#0897B1]/80"
              >
                Lihat Semua
              </Button>
            </div>
          </motion.div>

          {isLoadingArticles ? (
            <div className="flex justify-center mt-6 md:mt-12">Loading...</div>
          ) : articlesError ? (
            <div className="flex justify-center mt-6 md:mt-12 text-red-500">
              Error loading articles
            </div>
          ) : !articlesData?.data?.length ? (
            <div className="flex justify-center mt-6 md:mt-12">
              Tidak ada artikel yang tersedia
            </div>
          ) : (
            <div className="flex items-center overflow-x-auto gap-x-4 mt-6 md:mt-12">
              {articlesData.data.slice(0, 10).map((article: Article, index: number) => (
                <motion.div
                  key={article.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={scaleIn}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/articles/${article.id}`}>
                    <Card className="min-w-xs max-w-xs md:min-w-md md:max-w-md">
                      <CardContent>
                        <Image
                          className="object-cover rounded-xl min-h-36 h-36 max-h-36 md:min-h-52 md:h-52 md:max-h-52"
                          src={
                            article.mainImgUrl || "/images/angkot/angkot_2.png"
                          }
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
                          {new Date(article.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Trusted By */}
        <motion.div
          className="container mt-10 md:mt-24 px-0 md:px-6 mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={slideUp}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-center px-4"
            variants={slideDown}
          >
            Telah dipercaya oleh
          </motion.h1>

          <motion.div
            className="mt-6 md:mt-12"
            variants={fadeIn}
          >
            <TrustedBy />
          </motion.div>
        </motion.div>

        {/* Achievement */}
        <motion.div
          className="container mt-10 md:mt-24 px-0 md:px-6 mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={slideUp}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-center px-4"
            variants={slideDown}
          >
            Prestasi
          </motion.h1>

          <motion.div
            className="mt-6 md:mt-12"
            variants={fadeIn}
          >
            <Achievement />
          </motion.div>
        </motion.div>

        {/* Review */}
        {/* <motion.div
          ref={reviewRef}
          className="container mx-auto mt-10 md:mt-24 px-4 md:px-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <motion.h1
            className="text-center text-3xl md:text-4xl font-bold"
            variants={slideDown}
          >
            Review
          </motion.h1>

          {isLoadingReviews ? (
            <div className="flex justify-center mt-6 md:mt-12">Loading...</div>
          ) : reviewsError ? (
            <div className="flex justify-center mt-6 md:mt-12 text-red-500">
              Error loading reviews
            </div>
          ) : !reviewsData?.data?.length ? (
            <div className="flex justify-center mt-6 md:mt-12">
              Tidak ada review yang tersedia
            </div>
          ) : (
            <motion.div variants={slideUp}>
              <Carousel
                opts={{
                  align: "center",
                }}
                className="w-full mt-3 md:mt-9"
              >
                <CarouselContent className="py-3">
                  {reviewsData.data.map((review: Review) => (
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
                  ))}
                </CarouselContent>
              </Carousel>
            </motion.div>
          )}
        </motion.div> */}

        {/* Contact */}
        <motion.div
          className="container mx-auto my-10 md:my-24 px-4 md:px-10 grid grid-cols-12 gap-x-0 md:gap-x-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div
            className="col-span-12 md:col-span-6"
            variants={slideLeft}
          >
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg md:text-xl">
                  Berapa kisaran harga untuk layanan transportasi?
                </AccordionTrigger>
                <AccordionContent className="text-base md:text-lg">
                  Harga untuk angkot mulai 100k, untuk Hiace mulai dari 999k
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg md:text-xl">
                  Include apa saja pesanan rental angkot, HIACE, dan ELF di
                  TRANSPO?
                </AccordionTrigger>
                <AccordionContent className="text-base md:text-lg">
                  <ul className="list-inside list-disc">
                    <li>Bahan bakar</li>
                    <li>Supir yang ramah dalam bertugas</li>
                    <li>Bisa request mampir untuk makan & beli oleh-oleh</li>
                    <li>Ketepatan waktu penjemputan</li>
                    <li>
                      Armada yang layak, bersih, nyaman, dan bebas asap rokok
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg md:text-xl">
                  Bagaimana jika ada barang ketinggalan di armada?
                </AccordionTrigger>
                <AccordionContent className="text-base md:text-lg">
                  Tenang, setiap barang yang ketinggalan di armada angkot, HIACE
                  atau ELF pasti kita amankan. Kalian bisa ambil secara langsung
                  di pool kami (harus menghubungi narahubung admin di WA
                  terlebih dahulu) atau juga bisa request untuk bisa diantar,
                  namun dikenakan biaya mulai dari Rp 50.000 (harga disesuaikan
                  dengan jarak tempuh pengantaran).
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>

          <motion.div
            className="col-span-12 md:col-span-6 mt-4 md:mt-0"
            variants={slideRight}
          >
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
          </motion.div>
        </motion.div>
      </main>

      <Footer
        scrollToAdvantage={scrollToAdvantage}
        scrollToHowToOrder={scrollToHowToOrder}
        scrollToService={scrollToService}
        scrollToArticle={scrollToArticle}
        scrollToReview={scrollToReview}
      />
    </>
  );
};

export default Home;
