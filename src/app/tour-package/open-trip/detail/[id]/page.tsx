"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
  Ticket,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Footer from "@/components/footer";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "sonner";

interface TourPackage {
  id: string;
  photoUrl: Array<{ url: string }>;
  name: string;
  price: string;
  description: string;
  meetingPoint: string;
  minPersonCapacity: number;
  maxPersonCapacity: number;
  includes: Array<{ text: string }>;
  excludes: Array<{ text: string }>;
  itineraries: Array<{ text?: string; notes?: string }>;
  requirements: Array<{ text: string }>;
  tickets: Array<{ date: string }> | null;
  is_private: boolean;
  createdAt: string;
  updatedAt: string;
  ticketAvailability: Array<{
    date: string;
    totalBooked: number;
    remainingTickets: number;
  }>;
}

export default function TourDetailPage() {
  const { id } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedTicketDate, setSelectedTicketDate] = useState<string | null>(
    null
  );
  const isSmallScreen = useMediaQuery("(max-width: 1024px)");
  const router = useRouter();

  const { data, isLoading, error } = useQuery<{
    data: TourPackage;
  }>({
    queryKey: ["tour-packages", id],
    queryFn: async () => {
      const res = await axios.get(`/api/tour-packages/${id}`);
      return res.data;
    },
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number.parseInt(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAvailabilityByDate = (date: string) => {
    return data?.data.ticketAvailability?.find((item) => item.date === date);
  };

  const visibleImages = Array.isArray(data?.data.photoUrl)
    ? data.data.photoUrl.slice(0, 5)
    : [];

  const hasMoreImages = (data?.data.photoUrl?.length ?? 0) > 5;

  const handleOrder = () => {
    if (!selectedTicketDate) {
      toast.error("Mohon pilih ticket yang ingin anda pesan.");
      return;
    }

    const query = new URLSearchParams({
      packageId: data?.data?.id || "",
      departureDate: selectedTicketDate,
    });

    router.push(`/order/tour-package?${query.toString()}`);
  };

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

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error || !data || !data.data) {
    return (
      <div className="text-center mt-10 text-red-500">
        Failed to load tour details.
      </div>
    );
  }

  return (
    <>
      <Header
        scrollToAdvantage={scrollToAdvantage}
        scrollToHowToOrder={scrollToHowToOrder}
        scrollToService={scrollToService}
        scrollToArticle={scrollToArticle}
        scrollToReview={scrollToReview}
      />

      {/* Image Gallery Section */}
      <div className="container mt-10 px-4 md:px-10 mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px]">
          {/* Main Image */}
          <div className="md:col-span-2 relative overflow-hidden rounded-lg">
            <Image
              src={
                data?.data.photoUrl[selectedImageIndex]?.url ||
                "/placeholder.svg?height=500&width=800"
              }
              alt={`${data?.data.name} - Image ${selectedImageIndex + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                {data?.data.name}
              </h1>
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="md:col-span-2 grid grid-cols-2 gap-2">
            {visibleImages
              .slice(1, hasMoreImages && !false ? 5 : undefined)
              .map((photo, index) => (
                <div
                  key={index + 1}
                  className="relative overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => setSelectedImageIndex(index + 1)}
                >
                  <Image
                    src={photo.url || "/placeholder.svg"}
                    alt={`${data?.data.name} - Thumbnail ${index + 2}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  {index === 3 && hasMoreImages && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Camera className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-sm font-medium">
                          +{data?.data.photoUrl.length - 5} more
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Gallery Controls */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/80 hover:bg-white"
            onClick={() =>
              setSelectedImageIndex(
                selectedImageIndex > 0
                  ? selectedImageIndex - 1
                  : data?.data.photoUrl.length - 1
              )
            }
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/80 hover:bg-white"
            onClick={() =>
              setSelectedImageIndex(
                selectedImageIndex < data?.data.photoUrl.length - 1
                  ? selectedImageIndex + 1
                  : 0
              )
            }
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {hasMoreImages && (
          <div className="absolute bottom-4 right-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="bg-white/80 hover:bg-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Lihat semua gambar ({data?.data.photoUrl.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                  {data?.data.photoUrl.map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg"
                    >
                      <Image
                        src={photo.url || "/placeholder.svg"}
                        alt={`${data?.data.name} - Gallery ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tour Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{data?.data.name}</CardTitle>
                  <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white">
                    Open Trip
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Ticket className="w-4 h-4" />
                    <span>Maksimal: {data?.data.maxPersonCapacity} tiket</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>Meeting Point: {data?.data.meetingPoint}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {data?.data.description}
                </p>
              </CardContent>
            </Card>

            {/* Includes & Excludes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Harga Termasuk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {data?.data.includes.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <X className="w-5 h-5 text-red-600" />
                    Harga Tidak Termasuk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {data?.data.excludes.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="text-sm">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Itinerary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Itinerary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(data?.data.itineraries) &&
                  data.data.itineraries.map((day, dayIndex) => {
                    // Jika elemen adalah array (berarti daftar itinerary per hari)
                    if (Array.isArray(day)) {
                      return (
                        <div key={dayIndex} className="mb-6">
                          <h3 className="text-md font-semibold mb-2 text-primary">
                            Hari ke-{dayIndex + 1}
                          </h3>
                          {day.map((item, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="">
                                <p className="text-sm font-medium text-primary">
                                  {item.time}
                                </p>
                                <div className="flex justify-center py-2">
                                  {index < day.length - 1 && (
                                    <div className="w-px h-4 bg-border" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">{item.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    // Jika bukan array, berarti object `notes`
                    if (typeof day === "object" && day.notes) {
                      return (
                        <Alert
                          key={dayIndex}
                          className="bg-blue-50 border-blue-200"
                        >
                          <Clock className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            <strong>Catatan:</strong> {day.notes}
                          </AlertDescription>
                        </Alert>
                      );
                    }

                    return null;
                  })}
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Persyaratan</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data?.data.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{req.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          {isSmallScreen ? (
            <div className="fixed left-0 bottom-0 bg-white shadow-lg border border-t w-full">
              <div className="container mx-auto px-4">
                <Drawer>
                  <DrawerTrigger className="flex justify-between items-center w-full py-3">
                    <div className="space-y-0.5">
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(data.data.price)}
                        <span className="text-sm text-muted-foreground font-normal">
                          {" "}
                          / per orang
                        </span>
                      </div>
                      <div className="flex items-center justify-start gap-1">
                        <Ticket className="w-4 h-4" />
                        <span className="text-xs">
                          Maksimal: {data?.data.maxPersonCapacity} tiket
                        </span>
                      </div>
                      <p className="text-left text-xs">
                        Tiket yang tersedia: {data?.data.minPersonCapacity}{" "}
                        tiket
                      </p>
                    </div>

                    <div className="flex items-center gap-x-2">
                      <Button variant="outline" size="icon">
                        <ChevronUp />
                      </Button>
                      <Button onClick={handleOrder}>Pesan Sekarang</Button>
                    </div>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="px-4 space-y-4 mt-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {formatPrice(data.data.price)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          per orang
                        </p>
                      </div>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {Array.isArray(data?.data.tickets) &&
                          data.data.tickets.map((ticket, index) => {
                            const ticketDate = new Date(ticket.date);
                            ticketDate.setHours(0, 0, 0, 0);

                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const isPastDate = ticketDate < today;
                            const availability = getAvailabilityByDate(
                              ticket.date
                            );
                            const remainingTickets =
                              availability?.remainingTickets || 0;
                            const isSoldOut = remainingTickets <= 0;
                            const isUnavailable = isPastDate || isSoldOut;

                            return (
                              <label
                                key={index}
                                className={`flex items-center gap-2 p-3 border rounded-lg ${
                                  isUnavailable
                                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                                    : "hover:bg-muted/50 cursor-pointer"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="ticketDate"
                                  value={ticket.date}
                                  disabled={isUnavailable}
                                  checked={selectedTicketDate === ticket.date}
                                  onChange={() =>
                                    setSelectedTicketDate(ticket.date)
                                  }
                                  className="accent-primary"
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {formatDate(ticket.date)}
                                    {!isUnavailable && (
                                      <span className="ml-2 text-xs font-normal text-green-600">
                                        ({remainingTickets} tersedia dari{" "}
                                        {data?.data.maxPersonCapacity})
                                      </span>
                                    )}
                                  </span>
                                  {isPastDate ? (
                                    <span className="text-xs text-red-500">
                                      (tanggal sudah lewat)
                                    </span>
                                  ) : isSoldOut ? (
                                    <span className="text-xs text-red-500">
                                      (sudah habis)
                                    </span>
                                  ) : null}
                                </div>
                              </label>
                            );
                          })}
                      </div>
                    </div>
                    <DrawerFooter className="flex flex-row justify-end items-center">
                      <DrawerClose>
                        <Button variant="outline">Cancel</Button>
                      </DrawerClose>
                      <Button>Submit</Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {formatPrice(data?.data.price)}
                    </div>
                    <p className="text-sm text-muted-foreground">per orang</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Available Dates */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tiket yang tersedia
                    </h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {Array.isArray(data?.data.tickets) &&
                        data.data.tickets.map((ticket, index) => {
                          const ticketDate = new Date(ticket.date);
                          ticketDate.setHours(0, 0, 0, 0);

                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const isPastDate = ticketDate < today;
                          const availability = getAvailabilityByDate(
                            ticket.date
                          );
                          const remainingTickets =
                            availability?.remainingTickets || 0;
                          const isSoldOut = remainingTickets <= 0;
                          const isUnavailable = isPastDate || isSoldOut;

                          return (
                            <label
                              key={index}
                              className={`flex items-center gap-2 p-3 border rounded-lg ${
                                isUnavailable
                                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                                  : "hover:bg-muted/50 cursor-pointer"
                              }`}
                            >
                              <input
                                type="radio"
                                name="ticketDate"
                                value={ticket.date}
                                disabled={isUnavailable}
                                checked={selectedTicketDate === ticket.date}
                                onChange={() =>
                                  setSelectedTicketDate(ticket.date)
                                }
                                className="accent-primary"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {formatDate(ticket.date)}
                                  {!isUnavailable && (
                                    <span className="ml-2 text-xs font-normal text-green-600">
                                      ({remainingTickets} tersedia dari{" "}
                                      {data?.data.maxPersonCapacity})
                                    </span>
                                  )}
                                </span>
                                {isPastDate ? (
                                  <span className="text-xs text-red-500">
                                    (tanggal sudah lewat)
                                  </span>
                                ) : isSoldOut ? (
                                  <span className="text-xs text-red-500">
                                    (sudah habis)
                                  </span>
                                ) : null}
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  </div>

                  <Separator />

                  {/* Capacity Info */}
                  <div className="text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Ticket className="w-4 h-4" />
                      <span>
                        Maksimal: {data?.data.maxPersonCapacity} tiket
                      </span>
                    </div>
                    <p>
                      Tiket yang tersedia: {data?.data.minPersonCapacity} tiket
                    </p>
                  </div>

                  {/* Contact Options */}
                  <div className="space-y-3">
                    <Button size="lg" className="w-full" onClick={handleOrder}>
                      Pesan Sekarang
                    </Button>
                  </div>

                  {/* Quick Contact Info */}
                  <div className="bg-muted/50 p-3 rounded-lg text-center">
                    <p className="text-sm font-medium mb-1">
                      Butuh bantuan segera?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      WhatsApp: +62 812-3456-7890
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
