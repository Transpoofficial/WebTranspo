"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React, { FC } from "react";

interface OrderButtonProps {
  content: string;
  type: "TRANSPORT" | "TOUR_PACKAGE";
  isDashboard?: boolean;
  textColor?: string;
}

const OrderButton: FC<OrderButtonProps> = ({
  content,
  type,
  isDashboard,
  textColor,
}) => {
  const router = useRouter();
  const handleOrderClick = () => {
    const encodedContent = encodeURIComponent(content);
    if (type === "TRANSPORT") {
      router.push(`/order/transport/${encodedContent}`);
    } else if (type === "TOUR_PACKAGE") {
      router.push(`/order/tour-package/${encodedContent}`);
    }
  };
  return (
    <>
      {!isDashboard && (
        <Button
          size="lg"
          className="py-8 px-8 text-xl w-min text-transpo-primary bg-white hover:bg-gray-100 shadow-lg"
          onClick={handleOrderClick}
          data-testid="order-button"
        >
          Pesan sekarang
        </Button>
      )}
      {isDashboard && (
        <Button
          size="lg"
          className={cn(
            "py-2 px-4 text-xl w-min bg-white hover:bg-gray-100 shadow-lg",
            { [textColor as string]: textColor }
          )}
          onClick={handleOrderClick}
          data-testid="order-button-dashboard"
        >
          Pesan Sekarang
        </Button>
      )}
    </>
  );
};

export default OrderButton;
