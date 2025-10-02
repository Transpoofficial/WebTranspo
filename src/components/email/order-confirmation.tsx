import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface OrderData {
  text: string;
  value: string | number;
}

interface OrderVerificationProps {
  fullName: string;
  orderData: OrderData[];
}

export const OrderVerification = ({
  fullName = "",
  orderData = [],
}: OrderVerificationProps) => (
  <Html>
    <Head />
    <Preview>Pesanan Anda Telah Dikonfirmasi</Preview>
    <Tailwind>
      <Body className="bg-[#0897B1] m-0 p-0 py-6">
        <Container className="bg-[#0897B1] w-full max-w-xl mx-auto p-6 rounded-xl font-sans">
          {" "}
          <Section className="bg-white rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <Img
                src={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/images/logo/logo_3.png`}
                alt="TRANSPO Logo"
                width="80"
                height="80"
                className="mx-auto"
              />
            </div>
            <Text className="text-2xl font-bold m-0 text-center pt-2 px-6 text-[#0897B1]">
              TRANSPO
            </Text>

            <Text className="text-xl font-bold mb-4 text-center px-6">
              Pesanan Anda Telah Dikonfirmasi
            </Text>
            <Text className="text-base font-light leading-6 px-6">
              Yth. {fullName}, <br />
              Pesanan Anda dengan detail sebagai berikut telah berhasil
              dikonfirmasi dan siap berangkat:
              <br />
              <br />
              <ul className="list-disc list-inside px-6 mb-4">
                {orderData.map((item, index) => (
                  <li
                    key={index}
                    className="text-base font-light leading-6 mb-1"
                  >
                    <span className="font-medium">{item.text}:</span>{" "}
                    <span>{item.value}</span>
                  </li>
                ))}
              </ul>
              <br />
              Tim kami akan menghubungi Anda kembali menjelang hari
              keberangkatan untuk memastikan semua kebutuhan telah sesuai.
              <br />
              <br />
              Hormat kami,
            </Text>
            <br />
            <Text className="text-base font-bold mb-6 px-6">Tim TRANSPO.</Text>
          </Section>
          <Section>
            <Text className="text-white tracking-wide text-sm pb-4 px-4">
              Email ini dikirim karena Anda telah melakukan pemesanan di
              TRANSPO. Jika Anda tidak merasa melakukan pemesanan, silakan
              abaikan email ini.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default OrderVerification;
