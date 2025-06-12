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

interface PaymentRemainderProps {
  fullName: string;
  percentage: number;
  dueDate: string;
}

export const PaymentRemainder = ({
  fullName,
  percentage,
  dueDate,
}: PaymentRemainderProps) => (
  <Html>
    <Head />
    <Preview>Pengingat Pelunasan {`${percentage}%`}</Preview>
    <Tailwind>
      <Body className="bg-[#0897B1] m-0 p-0 pt-10">
        <Container className="bg-[#0897B1] max-w-2xl mx-auto p-8 rounded-2xl font-sans">
          <Section className="bg-white rounded-xl p-6 mb-6">
            <Text className="text-3xl font-bold m-0 text-center pt-8 px-8">
              Transpo
            </Text>

            <Text className="text-2xl font-bold mb-4 text-center px-8">
              Pengingat Pelunasan {`${percentage}%`}
            </Text>
            <Text className="text-lg font-light leading-8 px-8">
              Yth. {fullName}, <br />
              Kami menginformasikan bahwa saat ini Anda telah melakukan
              pembayaran sebesar{" "}
              <span className="font-bold">{100 - percentage}% </span> dari total
              biaya pemesanan. Mohon segera melakukan pelunasan sisa{" "}
              <span className="font-bold">{percentage}% </span> paling lambat{" "}
              <span className="font-bold">{dueDate}</span> agar pemesanan dapat
              diproses sesuai jadwal.
              <br />
              <br />
              Informasi rekening dan jumlah yang harus dibayarkan dapat dilihat
              melalui halaman pemesanan Anda.
              <br />
              <br />
              Hormat kami,
            </Text>
            <br />
            <Text className="text-lg font-bold mb-6 px-8">Tim TRANSPO.</Text>
          </Section>
          <Section>
            <Text className="text-white tracking-wide text-base pb-4">
              Email ini dikirim karena Anda telah melakukan pembayaran di
              TRANSPO. Jika Anda tidak merasa melakukan pembayaran, silakan
              abaikan email ini atau hubungi tim kami untuk klarifikasi.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default PaymentRemainder;
