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

interface PaymentVerificationProps {
  fullName?: string;
}

export const PaymentVerification = ({
  fullName = "",
}: PaymentVerificationProps) => (
  <Html>
    <Head />
    <Preview>Verifikasi Pembayaran</Preview>
    <Tailwind>
      <Body className="bg-[#0897B1] m-0 p-0 pt-10">
        <Container className="bg-[#0897B1] max-w-2xl mx-auto p-8 rounded-2xl font-sans">
          <Section className="bg-white rounded-xl p-6 mb-6">
            <Text className="text-3xl font-bold m-0 text-center pt-8 px-8">
              Transpo
            </Text>

            <Text className="text-2xl font-bold mb-4 text-center px-8">
              Verifikasi Pembayaran
            </Text>
            <Text className="text-lg font-light leading-8 px-8">
              Yth. {fullName}, <br />
              Terima kasih atas konfirmasi pembayaran Anda. Kami telah menerima
              bukti transfer dan sedang melakukan proses verifikasi.
              <br />
              <br />
              Mohon menunggu maksimal 1x24 jam untuk proses validasi. Kami akan
              segera menginformasikan status pemesanan Anda setelah proses
              selesai.
              <br />
              <br />
              Hormat kami,
            </Text>
            <br />
            <Text className="text-lg font-bold mb-6 px-8">Tim TRANSPO.</Text>
          </Section>
          <Section>
            <Text className="text-white tracking-wide text-base pb-4">
              Anda menerima email ini karena telah melakukan pembayaran di
              TRANSPO. Jika Anda merasa tidak melakukan pembayaran, silakan
              abaikan email ini.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default PaymentVerification;
