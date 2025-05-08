import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  FlagTriangleRight,
  StarIcon,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OrderDetailProps {
  id: string;
  openSheet: string | null;
  handleSheetToggle: (value: string) => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  id,
  openSheet,
  handleSheetToggle,
}) => {
  return (
    <>
      <Sheet open={openSheet === id} onOpenChange={() => handleSheetToggle(id)}>
        <SheetContent className="w-[384px] sm:max-w-full sm:w-[576px]">
          <SheetHeader>
            <SheetTitle>Detail pesanan</SheetTitle>
          </SheetHeader>
          <div className="p-4 pt-0 overflow-y-auto">
            <div className="flex items-start gap-x-10 w-full whitespace-nowrap overflow-x-auto">
              {/* Created At */}
              <div className="flex flex-col gap-y-4">
                <p className="text-xs text-[#6A6A6A]">Tanggal pemesanan</p>
                <p className="text-sm">Rabu, 7 Mei 2025 pukul 07:00</p>
              </div>

              {/* Payment Status */}
              <div className="flex flex-col gap-y-4">
                <p className="text-xs text-[#6A6A6A]">Status pembayaran</p>
                <Badge className="block first-letter:uppercase">approved</Badge>
              </div>

              {/* Order Status */}
              <div className="flex flex-col gap-y-4">
                <p className="text-xs text-[#6A6A6A]">Status</p>
                <Badge className="block first-letter:uppercase">pending</Badge>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Customer */}
            <div className="flex flex-col gap-y-4">
              <p className="text-xs text-[#6A6A6A]">Pemesan</p>

              <div className="flex flex-col gap-y-2">
                <p className="text-sm">Fathan Alfariel Adhyaksa</p>
                <p className="text-sm">example@gmail.com</p>
                <p className="text-sm">+6281234567</p>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Destination */}
            <div className="flex flex-col gap-y-4">
              <p className="text-xs text-[#6A6A6A]">Destinasi (Transport)</p>

              {/* Destination list */}
              <div className="flex flex-col max-h-52 overflow-y-auto">
                <div className="flex items-stretch gap-x-3.5">
                  <div className="w-6 flex flex-col items-center pt-1">
                    <span className="inline-flex justify-center items-center border border-dashed rounded-full p-1 border-black">
                      <FlagTriangleRight size={14} />
                    </span>

                    <div className="h-full pt-1">
                      <Separator orientation="vertical" />
                    </div>
                  </div>

                  <div className="inline-flex flex-col">
                    <p className="text-sm font-medium line-clamp-2">Malang</p>
                    <p className="text-xs text-[#6A6A6A]">Lokasi penjemputan</p>
                    <p className="text-xs text-[#6A6A6A] mt-1">
                      7 Mei 2025 pukul 07:00 WIB
                    </p>
                  </div>
                </div>

                <div className="w-6 h-6 inline-flex justify-center items-center">
                  <Separator orientation="vertical" />
                </div>

                <div className="flex items-stretch gap-x-3.5">
                  <div className="w-6 h-full flex flex-col items-center pt-1">
                    <span className="w-6 h-6 inline-flex justify-center items-center border border-dashed rounded-full p-1 border-black text-xs font-bold">
                      1
                    </span>

                    <div className="h-full pt-1">
                      <Separator orientation="vertical" />
                    </div>
                  </div>

                  <div className="inline-flex flex-col">
                    <p className="text-sm font-medium line-clamp-2">Surabaya</p>
                    <p className="text-xs text-[#6A6A6A]">Lokasi 1</p>
                    <p className="text-xs text-[#6A6A6A] mt-1">
                      7 Mei 2025 pukul 07:00 WIB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-stretch gap-x-2">
                <Image
                  className="aspect-3/2 object-cover rounded-lg"
                  src="/bg.png"
                  alt="bg.png"
                  width={100}
                  height={100}
                />

                <div className="flex flex-col justify-between items-start">
                  <p
                    title="Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna &
                    Sendang Biru"
                    className="text-sm font-medium line-clamp-2"
                  >
                    Rasakan Sensasi Keunikan Wisata Alam di Pantai Tiga Warna &
                    Sendang Biru
                  </p>

                  <div className="inline-flex items-center">
                    <span className="inline-flex items-center gap-x-1.5 text-xs text-[#6A6A6A]">
                      <UsersRound size={14} /> 8 orang dewasa
                    </span>

                    <Separator orientation="vertical" className="mx-2" />

                    <span className="inline-flex items-center gap-x-1.5 text-xs text-[#6A6A6A]">
                      <CalendarDays size={14} /> 1-3 Maret 2025
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Payment */}
            <div className="flex flex-col gap-y-4">
              <p className="text-xs text-[#6A6A6A]">Pembayaran</p>

              {/* Paid & Outstanding & Total*/}
              <div className="flex flex-col">
                {/* Paid */}
                <div className="inline-flex justify-between items-center">
                  <p className="text-sm font-semibold">Terbayar</p>
                  <p className="text-sm">
                    {(200000).toLocaleString("id", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </p>
                </div>

                {/* Outstanding */}
                <div className="inline-flex justify-between items-center mt-2.5">
                  <p className="text-sm font-semibold">Belum terbayar</p>
                  <p className="text-sm">
                    {(200000).toLocaleString("id", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Outstanding */}
                <div className="inline-flex justify-between items-center">
                  <p className="text-sm font-semibold">Total</p>
                  <p className="text-sm">
                    {(400000).toLocaleString("id", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Review */}
            <div className="flex flex-col gap-y-4">
              <p className="text-xs text-[#6A6A6A]">Review</p>

              <div>
                {/* User */}
                <div className="flex items-center gap-x-2">
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>

                  <div className="inline-flex flex-col">
                    <p className="text-xs md:text-sm font-medium">
                      Fathan Alfariel Adhyaksa
                    </p>
                    <p className="text-xs text-[#6A6A6A]">
                      8 Mei 2025 pukul 19.33
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-4 h-4 ${
                        star <= 4
                          ? "stroke-yellow-500 fill-yellow-500"
                          : "stroke-gray-300 fill-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <div className="mt-2 text-xs md:text-sm">
                Good experience, but there is room for improvement.
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default OrderDetail;
