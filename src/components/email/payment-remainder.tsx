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
              Pengingat Pelunasan {`${percentage}%`}
            </Text>
            <Text className="text-base font-light leading-6 px-6">
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
            <Text className="text-base font-bold mb-6 px-6">Tim TRANSPO.</Text>
          </Section>
          <Section>
            <Text className="text-white tracking-wide text-sm pb-4 px-4">
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
