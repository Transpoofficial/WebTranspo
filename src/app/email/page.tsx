import Thanks from "@/components/email/thanks";
import React from "react";

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
