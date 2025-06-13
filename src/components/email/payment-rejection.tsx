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

interface PaymentRejectionProps {
  fullName: string;
  reason: string;
  orderType: string;
  totalAmount: number;
}

export const PaymentRejection = ({
  fullName,
  reason,
  orderType,
  totalAmount,
}: PaymentRejectionProps) => (
  <Html>
    <Head />
    <Preview>Pembayaran Ditolak - TRANSPO</Preview>
    <Tailwind>
      <Body className="bg-[#0897B1] m-0 p-0 py-6">
        <Container className="bg-[#0897B1] w-full max-w-xl mx-auto p-6 rounded-xl font-sans">
          <Section className="bg-white rounded-lg p-6 mb-6">
            <Text className="text-2xl font-bold m-0 text-center pt-6 px-6 text-[#0897B1]">
              TRANSPO
            </Text>
            <Text className="text-sm text-center px-6 text-gray-600">
              PT. Transpo Indonesia Mandiri
            </Text>
            <Text className="text-xl font-bold mb-4 text-center px-6 text-red-600">
              Pembayaran Ditolak
            </Text>{" "}
            <Text className="text-base font-light leading-6 px-6 text-justify">
              Yth. {fullName},
            </Text>
            <Text className="text-base font-light leading-6 px-6 text-justify mt-4">
              Mohon maaf, kami harus menginformasikan bahwa pembayaran Anda
              untuk pesanan {orderType} dengan total sebesar{" "}
              <span className="font-bold">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totalAmount)}
              </span>{" "}
              tidak dapat kami setujui.
            </Text>
            <Text className="text-base font-bold leading-6 px-6 mt-4">
              Alasan penolakan:
            </Text>
            <div className="mx-6 my-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md">
              <Text className="text-red-700 font-medium m-0 text-sm leading-relaxed">
                {reason}
              </Text>
            </div>
            <Text className="text-base font-light leading-6 px-6 text-justify mt-4">
              Tim admin kami akan segera menghubungi Anda melalui WhatsApp atau
              telepon untuk membahas langkah selanjutnya terkait pengembalian
              dana dan klarifikasi lebih lanjut.
            </Text>
            <Text className="text-base font-light leading-6 px-6 text-justify mt-4">
              Jika Anda memiliki pertanyaan atau ingin melakukan pembayaran
              ulang dengan dokumen yang benar, silakan hubungi tim customer
              service kami.
            </Text>
            <Text className="text-base font-light leading-6 px-6 text-justify mt-4">
              Terima kasih atas pengertian Anda.
            </Text>
            <Text className="text-base font-light leading-6 px-6 mt-4">
              Hormat kami,
            </Text>
            <br />
            <Text className="text-base font-bold mb-6 px-6">Tim TRANSPO.</Text>
          </Section>
          <Section>
            <Text className="text-white tracking-wide text-sm pb-4 px-4">
              Email ini dikirim karena ada perubahan status pembayaran Anda di
              TRANSPO. Jika Anda memiliki pertanyaan, jangan ragu untuk
              menghubungi tim customer service kami.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default PaymentRejection;
