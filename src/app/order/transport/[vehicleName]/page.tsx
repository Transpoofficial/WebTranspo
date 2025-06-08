"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { totalmem } from "os";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Step1 from "./components/step-1";
import Step2 from "./components/step-2";
import Step3 from "./components/step-3";
import Step4 from "./components/step-4";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export interface OrderData {
  userData: {
    name: string;
    phone: string;
    email: string;
    totalPassangers: number;
    totalVehicles: number;
  };
  trip: {
    date: Date;
    location: {
      lat: number | null;
      lng: number | null;
      address: string;
      time: string | null;
    }[];
    distance?: number;
    duration?: number;
    startTime: string;
  }[];
  totalDuration: number;
  totalDistance: number;
  note: string;
  vehicleTypeId: string;
  totalPrice: number;
}

const getStartDate = (vehicleName: string) => {
  // Create a new Date object for today
  const today = new Date();

  switch (vehicleName) {
    case "angkot":
      // Set date 2 days from now
      return new Date(today.setDate(today.getDate() + 2));
    default:
      // Set date 5 days from now
      return new Date(today.setDate(today.getDate() + 5));
  }
};

const OrderTransportPage = () => {
  const params = useParams();

  const vehicleName = params.vehicleName;
  const startDate = getStartDate(vehicleName as string);

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState<OrderData>({
    userData: {
      name: "",
      phone: "",
      email: "",
      totalPassangers: 0,
      totalVehicles: 0,
    },
    trip: [
      {
        date: startDate,
        location: [{ lat: null, lng: null, address: "", time: null }],
        startTime: "",
        distance: 0,
        duration: 0,
      },
    ],
    totalDuration: 0,
    totalDistance: 0,
    note: "",
    vehicleTypeId: "",
    totalPrice: 0,
  });
  const [paymentData, setPaymentData] = useState<{
    id: string;
    amount: number;
  } | null>(null);

  const isValidVehicleName = [
    "angkot",
    "hiace-commuter",
    "hiace-premio",
    "elf",
  ].includes(vehicleName as string);

  useEffect(() => {
    if (!isValidVehicleName) {
      router.push("/");
    }
  }, [isValidVehicleName, router]);

  useEffect(() => {
    if (step === 1) {
      // Deduplicate destinations based on unique dates
      const dateMap = new Map();

      orderData.trip.forEach((dest) => {
        const dateStr = format(dest.date, "yyyy-MM-dd");
        // Only keep the first occurrence of each date
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, dest);
        }
      });

      // If we have duplicates, update the state
      if (dateMap.size < orderData.trip.length) {
        setOrderData((prev) => ({
          ...prev,
          trip: Array.from(dateMap.values()),
        }));
      }
    }
  }, [step, orderData.trip]);

  const handleNextStep = (paymentData?: { id: string; amount: number }) => {
    if (step === 3 && paymentData) {
      setPaymentData(paymentData);
    }
    setStep(step + 1);
  };
  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  useQuery({
    queryKey: ["orderTransport", vehicleName],
    queryFn: async () => {
      const response = await axios.get(
        `/api/vehicle-types?search=${vehicleName}`
      );
      if (response.status !== 200) {
        toast.error("Failed to fetch vehicle type data");
      }
      const vehicleTypeData = response.data.data[0];
      setOrderData((prevData) => ({
        ...prevData,
        vehicleTypeId: vehicleTypeData.id,
      }));
      return response.data.data[0];
    },
  });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            startDate={startDate}
            onBack={handlePreviousStep}
            orderData={orderData}
            setOrderData={setOrderData}
            onContinue={handleNextStep}
          />
        );
      case 2:
        return (
          <Step2
            orderData={orderData}
            setOrderData={setOrderData}
            onContinue={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 3:
        return (
          <Step3
            orderData={orderData}
            setOrderData={setOrderData}
            onContinue={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 4:
        return paymentData ? (
          <Step4 paymentData={paymentData} onBack={handlePreviousStep} />
        ) : (
          // If somehow we got here without payment data, go back to step 3
          <div className="text-center py-8">
            <p>Data pembayaran tidak ditemukan.</p>
            <Button onClick={handlePreviousStep} className="mt-4">
              Kembali
            </Button>
          </div>
        );
      default:
        return (
          <Step1
            startDate={startDate}
            onBack={handlePreviousStep}
            orderData={orderData}
            setOrderData={setOrderData}
            onContinue={handleNextStep}
          />
        );
    }
  };
  console.log({ orderData });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="bg-teal-500 p-2 rounded-full">
            <div className="text-white font-bold">TRANSPO</div>
          </div>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline">Pesanan Saya</Button>
          <Button variant="outline">Profil</Button>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div
                className={cn(
                  "rounded-full w-12 h-12 flex items-center justify-center border-2",
                  step === stepNumber
                    ? "border-teal-500 text-teal-500 font-bold"
                    : "border-gray-300 text-gray-300"
                )}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className="flex mx-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full mx-1",
                        step >= stepNumber ? "bg-teal-500" : "bg-gray-300"
                      )}
                    />
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {renderStep()}
    </div>
  );
};

export default OrderTransportPage;
