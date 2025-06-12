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
      <Body className="bg-[#0897B1] m-0 p-0 py-6">
        <Container className="bg-[#0897B1] w-full max-w-xl mx-auto p-6 rounded-xl font-sans">
          <Section className="bg-white rounded-lg p-6 mb-6">
            <Text className="text-2xl font-bold m-0 text-center pt-6 px-6">
              Transpo
            </Text>

            <Text className="text-xl font-bold mb-4 text-center px-6">
              Terima Kasih Telah Menggunakan Layanan Kami
            </Text>
            <Text className="text-base font-light leading-6 px-6">
              Yth. {fullName}, <br />
              Terima kasih telah mempercayakan perjalanan Anda bersama TRANSPO.
              Kami harap Anda mendapatkan pengalaman yang menyenangkan.
              <br />
              <br />
              Kami sangat menghargai masukan Anda. Silakan luangkan waktu
              sejenak untuk memberikan penilaian atau saran melalui tautan
              berikut:{" "}
              <a
                className="text-blue-500 hover:underline font-medium"
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
            <Text className="text-base font-bold mb-6 px-6">Tim TRANSPO.</Text>
          </Section>
          <Section>
            <Text className="text-white tracking-wide text-sm pb-4 px-4">
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
