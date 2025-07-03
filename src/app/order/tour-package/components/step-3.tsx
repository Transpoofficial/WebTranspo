"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { OrderData } from "../page";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Step3Props {
  orderData: OrderData;
  setOrderData: React.Dispatch<React.SetStateAction<OrderData>>;
  onContinue: (paymentData?: { id: string; amount: number }) => void;
  onBack: () => void;
}

const PAYMENT_ID_KEY = "tour_payment_id";

const Step3 = ({ orderData, onContinue, onBack }: Step3Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (!orderData.userData.name || !orderData.userData.email) {
      toast.error("Data user tidak lengkap");
      onBack();
    }
  }, [orderData, onBack]);

  // Format date as "Senin, 05 Mei 2025"
  const formatLocalizedDate = (date: Date) => {
    return format(date, "EEEE, dd MMMM yyyy", { locale: id });
  };

  // Format price as Rupiah
  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("Rp", "Rp.");
  };

  // Handle creating order
  const handleCreateOrder = async () => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("orderType", "TOUR");
      formData.append("packageId", orderData.packageData.id);
      formData.append("fullName", orderData.userData.name);
      formData.append("phoneNumber", orderData.userData.phone);
      formData.append("email", orderData.userData.email);
      formData.append(
        "departureDate",
        format(orderData.tripDetails.departureDate, "yyyy-MM-dd")
      );

      if (orderData.packageData.type === true) {
        formData.append(
          "totalPassengers",
          orderData.tripDetails.people?.toString() || "1"
        );
        formData.append(
          "pricePerPerson",
          orderData.packageData.price.toString()
        );
      }

      formData.append("totalPrice", orderData.totalPrice.toString());

      if (orderData.tripDetails.note) {
        formData.append("note", orderData.tripDetails.note);
      }

      const response = await axios.post("/api/orders", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Pesanan berhasil dibuat!");
        const paymentData = response.data.data.payment;

        if (typeof window !== "undefined") {
          localStorage.setItem(PAYMENT_ID_KEY, paymentData.id);
        }

        onContinue({
          id: paymentData.id,
          amount: parseFloat(paymentData.totalPrice),
        });
      } else {
        toast.error("Gagal membuat pesanan. Silakan coba lagi.");
      }
    } catch (error: unknown) {
      console.error("Error creating order:", error);

      let errorMessage = "Terjadi kesalahan saat membuat pesanan";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <div className="mx-auto mt-8 max-w-4xl pb-10">
        <Card
          className="shadow-lg border-0 text-gray-600"
          style={{ boxShadow: "0 5px 35px rgba(0, 0, 0, 0.2)" }}
        >
          <CardHeader className="text-center rounded-t-lg">
            <CardTitle className="text-2xl font-semibold">
              ORDER CONFIRMATION
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2 text-transpo-primary">
                Customer Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div className="space-y-1">
                  <div className="text-gray-500 text-sm">Name</div>
                  <div className="font-medium">{orderData.userData.name}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-gray-500 text-sm">Phone</div>
                  <div className="font-medium">{orderData.userData.phone}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-gray-500 text-sm">Email</div>
                  <div className="font-medium">{orderData.userData.email}</div>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2 text-transpo-primary">
                Package Information
              </h3>

              <div className="space-y-2">
                <div className="font-medium">{orderData.packageData.name}</div>
                <div className="text-gray-500">
                  Type:{" "}
                  {orderData.packageData.type === false
                    ? "Open Trip"
                    : "Private Trip"}
                </div>
                {orderData.packageData.type === true &&
                  orderData.tripDetails.people && (
                    <div className="text-gray-500">
                      Participants: {orderData.tripDetails.people} people
                    </div>
                  )}
                <div className="text-gray-500">
                  Departure Date:{" "}
                  {formatLocalizedDate(orderData.tripDetails.departureDate)}
                </div>
                <div className="text-gray-500">
                  Number of people: {orderData.tripDetails.people}
                </div>
              </div>

              {orderData.packageData.type === true &&
                orderData.tripDetails.people && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Price Breakdown
                    </h4>
                    <div className="flex justify-between">
                      <span>Price per person:</span>
                      <span>{formatRupiah(orderData.packageData.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of people:</span>
                      <span>{orderData.tripDetails.people}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-blue-300">
                      <span>Total:</span>
                      <span>{formatRupiah(orderData.totalPrice)}</span>
                    </div>
                  </div>
                )}

              {orderData.tripDetails.note && (
                <div className="mt-4">
                  <h4 className="font-medium">Additional Note:</h4>
                  <p className="text-gray-600">{orderData.tripDetails.note}</p>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Total Price:</div>
                  <div className="font-semibold text-lg text-transpo-primary">
                    {formatRupiah(orderData.packageData.price)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                onClick={() => setIsConfirmDialogOpen(true)}
                disabled={isSubmitting}
                className="bg-transpo-primary border-transpo-primary hover:bg-transpo-primary-dark disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Confirm Order"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Order</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to create a tour package order with total payment of{" "}
              {formatRupiah(orderData.totalPrice)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="text-amber-600 font-medium text-sm">
            ⚠️ Please ensure all details are correct as orders cannot be changed
            after confirmation.
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isSubmitting}
              className="border-gray-300"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateOrder}
              disabled={isSubmitting}
              className="bg-transpo-primary hover:bg-transpo-primary-dark disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Confirm Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Step3;
