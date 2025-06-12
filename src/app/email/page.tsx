import OrderVerification from "@/components/email/order-confirmation";
import PaymentRemainder from "@/components/email/payment-remainder";
import PaymentVerification from "@/components/email/payment-verification";
import RegisterVerification from "@/components/email/register-verification";
import Thanks from "@/components/email/thanks";
import React from "react";

const orderData = [
  {
    text: "Tanggal Keberangkatan",
    value: "2023-10-01",
  },
  {
    text: "Jumlah Hari",
    value: 3,
  },
  {
    text: "Kendaraan",
    value: "Bus",
  },
  {
    text: "Jumlah Armada",
    value: 2,
  },
  {
    text: "Jumlah Penumpang",
    value: 50,
  },
  {
    text: "Titik Jemput",
    value: "Jakarta",
  },
];

const TempPage = () => {
  return (
    <div>
      {/* <RegisterVerification fullName="Ahmad Reza Adrian" /> */}
      {/* <PaymentVerification fullName="Ahmad Reza Adrian" /> */}
      {/* <OrderVerification orderData={orderData} fullName="Ahmad Reza Adrian" /> */}
      {/* <PaymentRemainder
        fullName="Ahmad Reza Adrian"
        dueDate="10-5-2025"
        percentage={75}
      /> */}
      <Thanks
        fullName="Ahmad Reza Adrian"
        reviewUrl="https://www.instagram.com"
      />
    </div>
  );
};

export default TempPage;
