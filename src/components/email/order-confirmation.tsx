import {
  Body,
  Container,
  Head,
  Html,
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
      <Body className="bg-[#0897B1] m-0 p-0 pt-10">
        <Container className="bg-[#0897B1] max-w-2xl mx-auto p-8 rounded-2xl font-sans">
          <Section className="bg-white rounded-xl p-6 mb-6">
            <Text className="text-3xl font-bold m-0 text-center pt-8 px-8">
              Transpo
            </Text>

            <Text className="text-2xl font-bold mb-4 text-center px-8">
              Pesanan Anda Telah Dikonfirmasi
            </Text>
            <Text className="text-lg font-light leading-8 px-8">
              Yth. {fullName}, <br />
              Pesanan Anda dengan detail sebagai berikut telah berhasil
              dikonfirmasi dan siap berangkat:
              <br />
              <br />
              <ul className="list-disc list-inside px-8 mb-4">
                {orderData.map((item, index) => (
                  <li key={index} className="text-lg font-light leading-8">
                    {item.text}: <span>{item.value}</span>
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
            <Text className="text-lg font-bold mb-6 px-8">Tim TRANSPO.</Text>
          </Section>
          <Section>
            <Text className="text-white tracking-wide text-base pb-4">
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
