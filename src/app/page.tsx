import { Separator } from "@/components/ui/separator";
import {
  BanknoteArrowUp,
  CreditCard,
  Handshake,
  Keyboard,
  ListChecks,
  LogIn,
  MapPinned,
  Phone,
  Quote,
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
import Map2 from "./components/map-2";

const Home = () => {
  return (
    <>
      {/* <Header /> */}

      <main>
        <Map2 />

        {/* Advantages */}
        <div className="mt-10 md:mt-24 px-4 md:px-10">
          <h1 className="block md:hidden text-3xl md:text-4xl text-center md:text-left font-bold">
            Kelebihan
          </h1>

          <div className="grid grid-cols-12 gap-x-0 md:gap-x-12 mt-6 md:mt-0">
            <div className="col-span-12 md:col-span-5">
              <Image
                className="w-full h-full object-cover rounded-3xl"
                src="/bg.png"
                alt=""
                width={100}
                height={100}
              />
            </div>
            <div className="col-span-12 md:col-span-7 mt-6 md:mt-0">
              <h1 className="hidden md:block text-3xl md:text-4xl text-center md:text-left font-bold">
                Kelebihan
              </h1>

              <ul className="md:mt-6 flex flex-col gap-y-3">
                <li className="flex items-start gap-x-4">
                  <div className="w-auto">
                    <MapPinned className="w-8 h-8 md:w-10 md:h-10" />
                  </div>

                  <div className="flex flex-col justify-start max-w-full">
                    <h5 className="text-base md:text-lg font-medium">
                      Aksesibilas Mudah
                    </h5>
                    <p className="text-sm md:text-base whitespace-wrap">
                      Layanan berbasis teknologi dengan fitur transparasi harga,
                      titik jemput, strategis dan kemudahan pemesanan.
                    </p>
                  </div>
                </li>

                <li className="flex items-center gap-x-4">
                  <div className="w-auto">
                    <Handshake className="w-8 h-8 md:w-10 md:h-10" />
                  </div>

                  <div className="flex flex-col justify-start">
                    <h5 className="text-base md:text-lg font-medium">
                      Pemberdayaan Lokal
                    </h5>
                    <p className="text-sm md:text-base">
                      Melibatkan pengemudi dan tempat wisata lokal untuk
                      pemberdayaan ekonomi.
                    </p>
                  </div>
                </li>

                <li className="flex items-center gap-x-4">
                  <div className="w-auto">
                    <UsersRound className="w-8 h-8 md:w-10 md:h-10" />
                  </div>

                  <div className="flex flex-col justify-start">
                    <h5 className="text-lg font-medium">
                      Fleksibilitas Layanan
                    </h5>
                    <p className="text-base">
                      Menyediakan opsi sewa untuk kebutuhan kelompok ataupun
                      acara khusus.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How to Order */}
        <div className="flex flex-col items-center mt-10 md:mt-24 px-4 md:px-10">
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

        {/* Contact */}
        <div className="mt-10 md:mt-24 px-4 md:px-10 grid grid-cols-12 gap-x-0 md:gap-x-12">
          <div className="col-span-12 md:col-span-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg md:text-xl">
                  Harga?
                </AccordionTrigger>
                <AccordionContent className="text-base md:text-lg">
                  Sekitar 2 ribuan.
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

        {/* Review */}
        <div className="max-w-7xl mx-auto mt-10 md:mt-24 px-4 md:px-10">
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

        {/* Partnership */}
        <div className="max-w-7xl mx-auto mt-10 md:mt-24 px-4 md:px-10">
          <h1 className="text-center text-3xl md:text-4xl font-bold">
            Partnership
          </h1>

          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full mt-3 md:mt-9"
          >
            <CarouselContent className="py-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 border">
                    <div className="flex aspect-square items-center justify-center p-2">
                      <span className="text-3xl font-semibold">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Home;
