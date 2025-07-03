"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import Step1 from "./components/step-1";
import Step3 from "./components/step-3";
import Step4 from "./components/step-4";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { useSession } from "next-auth/react";

// Constants
const PAYMENT_ID_KEY = "tour_payment_id";

export interface OrderData {
  userData: {
    name: string;
    phone: string;
    email: string;
  };
  packageData: {
    id: string;
    name: string;
    type: boolean;
    price: number;
    description: string;
    itinerary: string[];
    inclusions: string[];
  };
  tripDetails: {
    departureDate: Date;
    people?: number; // Only for private trip
    note: string;
  };
  totalPrice: number;
}

const OrderTourPackagePage = () => {
  const searchParams = useSearchParams();
  const { data, status } = useSession();
  const router = useRouter();

  // Get query params
  const packageId = searchParams.get("packageId");
  const people = searchParams.get("people");
  const departureDate = searchParams.get("departureDate");

  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState<OrderData>({
    userData: {
      name: "",
      phone: "",
      email: "",
    },
    packageData: {
      id: "",
      name: "",
      type: false,
      price: 0,
      description: "",
      itinerary: [],
      inclusions: [],
    },
    tripDetails: {
      departureDate: departureDate ? new Date(departureDate) : new Date(),
      people: people ? parseInt(people) : undefined,
      note: "",
    },
    totalPrice: 0,
  });
  const [paymentData, setPaymentData] = useState<{
    id: string;
    amount: number;
  } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (data?.user && status === "authenticated") {
      const shouldUpdateUserData =
        !orderData.userData.name ||
        !orderData.userData.email ||
        !orderData.userData.phone;

      if (shouldUpdateUserData) {
        const fetchUserData = async () => {
          try {
            const response = await axios.get(`/api/users/${data.user.id}`);
            if (response.status === 200) {
              setOrderData((prev) => ({
                ...prev,
                userData: {
                  name: data.user.fullName || prev.userData.name,
                  email: data.user.email || prev.userData.email,
                  phone: data.user.phoneNumber || prev.userData.phone,
                },
              }));
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setOrderData((prev) => ({
              ...prev,
              userData: {
                ...prev.userData,
                name: data.user.fullName || prev.userData.name,
                email: data.user.email || prev.userData.email,
              },
            }));
          }
        };
        fetchUserData();
      }
    }
  }, [data, status, orderData.userData.name, orderData.userData.email, orderData.userData.phone]);

  // Check for payment ID in localStorage
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (typeof window === "undefined") return;

      try {
        const storedPaymentId = localStorage.getItem(PAYMENT_ID_KEY);
        if (storedPaymentId) {
          const response = await axios.get(`/api/payments/${storedPaymentId}`);
          if (response.status === 200 && response.data.data) {
            router.push("/settings/order");
          }
          localStorage.removeItem(PAYMENT_ID_KEY);
        }
      } catch (error) {
        console.error("Error fetching payment:", error);
        localStorage.removeItem(PAYMENT_ID_KEY);
      } finally {
        setIsInitializing(false);
      }
    };

    checkPaymentStatus();
  }, [router]);

  // In the useQuery for fetching package data:
  useQuery({
    queryKey: ["tourPackage", packageId],
    queryFn: async () => {
      if (!packageId) {
        toast.error("Package ID is missing");
        router.push("/tour-packages");
        return null;
      }

      const response = await axios.get(`/api/tour-packages/${packageId}`);
      if (response.status !== 200) {
        toast.error("Failed to fetch package data");
        router.push("/tour-packages");
        return null;
      }

      const packageData = response.data.data;
      const totalPrice =
        packageData.is_private === true && orderData.tripDetails.people
          ? packageData.price * orderData.tripDetails.people
          : packageData.price;

      setOrderData((prev) => ({
        ...prev,
        packageData: {
          id: packageData.id,
          name: packageData.name,
          type: packageData.is_private,
          price: packageData.price, // Price per person for private trips
          description: packageData.description,
          itinerary: packageData.itinerary,
          inclusions: packageData.inclusions,
        },
        totalPrice: totalPrice,
      }));

      return packageData;
    },
    enabled: !!packageId && !isInitializing,
  });

  const handleNextStep = (paymentData?: { id: string; amount: number }) => {
    if (step === 2 && paymentData) {
      setPaymentData(paymentData);
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    if (step === 1) {
      router.back();
    }
    setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            orderData={orderData}
            setOrderData={setOrderData}
            onContinue={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 2:
        return (
          <Step3
            orderData={orderData}
            setOrderData={setOrderData}
            onContinue={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 3:
        return paymentData ? (
          <Step4 paymentData={paymentData} onBack={handlePreviousStep} />
        ) : (
          <div className="text-center py-8">
            <p>Payment data not found.</p>
            <Button onClick={handlePreviousStep} className="mt-4">
              Back
            </Button>
          </div>
        );
      default:
        return (
          <Step1
            orderData={orderData}
            setOrderData={setOrderData}
            onContinue={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
    }
  };

  if (isInitializing) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Header isLandingPage={false} />
      <div className="container mx-auto py-8">
        {/* Progress steps - simplified to 3 steps */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-row items-center justify-center w-full max-w-4xl">
            {[
              { number: 1, label: "Order Details" },
              { number: 2, label: "Confirmation" },
              { number: 3, label: "Payment" },
            ].map((stepItem) => (
              <React.Fragment key={stepItem.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "rounded-full w-12 h-12 flex items-center justify-center border-2 transition-all duration-300",
                      step === stepItem.number
                        ? "border-transpo-primary text-transpo-primary font-bold scale-110"
                        : stepItem.number < step
                          ? "border-transpo-primary bg-transpo-primary text-white"
                          : "border-gray-300 text-gray-300"
                    )}
                  >
                    {stepItem.number}
                  </div>
                  <div
                    className={cn(
                      "mt-2 text-sm font-medium text-center px-2 transition-colors duration-300 hidden md:block",
                      step === stepItem.number
                        ? "text-transpo-primary"
                        : stepItem.number < step
                          ? "text-transpo-primary"
                          : "text-gray-400"
                    )}
                  >
                    {stepItem.label}
                  </div>
                </div>
                {stepItem.number < 3 && (
                  <div className="flex mx-2 md:mx-4">
                    <div className="flex">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-full mx-1 transition-colors duration-300",
                            step > stepItem.number
                              ? "bg-transpo-primary"
                              : step === stepItem.number
                                ? i < 2
                                  ? "bg-transpo-primary"
                                  : "bg-gray-300"
                                : "bg-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="px-4">{renderStep()}</div>
      </div>
    </>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <OrderTourPackagePage />
    </Suspense>
  )
}

export default Page;
