"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { FC } from "react";

interface OrderButtonProps {
  content: string;
  type: "TRANSPORT" | "TOUR_PACKAGE";
}

const OrderButton: FC<OrderButtonProps> = ({ content, type }) => {
  const router = useRouter();
  const handleOrderClick = () => {
    if (type === "TRANSPORT") {
      router.push(`/order/transport/${content}`);
    } else if (type === "TOUR_PACKAGE") {
      router.push(`/order/tour-package/${content}`);
    }
  };
  return (
    <Button
      size="lg"
      className="py-8 px-8 text-xl w-min text-[#0897B1] bg-white hover:bg-gray-100 shadow-lg"
      onClick={handleOrderClick}
      data-testid="order-button"
    >
      Pesan sekarang
    </Button>
  );
};

export default OrderButton;
