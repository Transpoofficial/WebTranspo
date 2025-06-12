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

interface ThanksProps {
  fullName: string;
  reviewUrl: string;
}

export const Thanks = ({ fullName, reviewUrl }: ThanksProps) => (
  <Html>
    <Head />
    <Preview>Terima Kasih Telah Menggunakan Layanan Kami</Preview>
    <Tailwind>
      <Body className="bg-[#0897B1] m-0 p-0 pt-10">
        <Container className="bg-[#0897B1] max-w-2xl mx-auto p-8 rounded-2xl font-sans">
          <Section className="bg-white rounded-xl p-6 mb-6">
            <Text className="text-3xl font-bold m-0 text-center pt-8 px-8">
              Transpo
            </Text>

            <Text className="text-2xl font-bold mb-4 text-center px-8">
              Terima Kasih Telah Menggunakan Layanan Kami
            </Text>
            <Text className="text-lg font-light leading-8 px-8">
              Yth. {fullName}, <br />
              Terima kasih telah mempercayakan perjalanan Anda bersama TRANSPO.
              Kami harap Anda mendapatkan pengalaman yang menyenangkan.
              <br />
              <br />
              Kami sangat menghargai masukan Anda. Silakan luangkan waktu
              sejenak untuk memberikan penilaian atau saran melalui tautan
              berikut:{" "}
              <a
                className="text-blue-500 hover:underline"
                target="blank"
                href={reviewUrl}
              >
                Review Disini
              </a>
              <br />
              <br />
              Hormat kami,
            </Text>
            <br />
            <Text className="text-lg font-bold mb-6 px-8">Tim TRANSPO.</Text>
          </Section>
          <Section>
            <Text className="text-white tracking-wide text-base pb-4">
              Email ini dikirim sebagai konfirmasi atas pembayaran yang Anda
              lakukan di TRANSPO. Jika Anda merasa tidak melakukan transaksi
              ini, silakan abaikan email ini atau hubungi tim kami untuk
              klarifikasi lebih lanjut.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default Thanks;
