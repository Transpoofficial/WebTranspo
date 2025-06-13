import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Button,
} from "@react-email/components";
import * as React from "react";

interface PaymentApprovalProps {
  fullName?: string;
  orderType?: string;
  totalAmount?: number;
  invoiceNumber?: string;
  paymentDate?: string;
}

export const PaymentApproval = ({
  fullName = "",
  orderType = "",
  totalAmount = 0,
  invoiceNumber = "",
  paymentDate = "",
}: PaymentApprovalProps) => (
  <Html>
    <Head />
    <Preview>Pembayaran Anda Telah Disetujui - Invoice Terlampir</Preview>
    <Tailwind>
      <Body className="bg-[#0897B1] m-0 p-0 py-6">
        <Container className="bg-[#0897B1] w-full max-w-xl mx-auto p-6 rounded-xl font-sans">
          <Section className="bg-white rounded-lg p-6 mb-6">
            <Text className="text-2xl font-bold m-0 text-center pt-6 px-6">
              Transpo
            </Text>

            <Text className="text-xl font-bold mb-4 text-center px-6 text-green-600">
              ✅ Pembayaran Disetujui
            </Text>

            <Text className="text-base font-light leading-6 px-6">
              Yth. {fullName}, <br />
              <br />
              Selamat! Pembayaran Anda telah berhasil diverifikasi dan disetujui
              oleh tim kami.
              <br />
              <br />
              <strong>Detail Pembayaran:</strong>
              <br />• Layanan:{" "}
              {orderType === "TRANSPORT" ? "Transportasi" : "Paket Wisata"}
              <br />• Total Pembayaran: Rp {totalAmount.toLocaleString("id-ID")}
              <br />• No. Invoice: {invoiceNumber}
              <br />• Tanggal Pembayaran: {paymentDate}
              <br />
              <br />
              Invoice resmi telah terlampir dalam email ini sebagai bukti
              pembayaran yang sah. Silakan simpan invoice ini untuk keperluan
              dokumentasi Anda.
              <br />
              <br />
              Tim kami akan segera menghubungi Anda untuk koordinasi lebih
              lanjut mengenai jadwal dan detail pelaksanaan layanan.
              <br />
              <br />
              Terima kasih atas kepercayaan Anda menggunakan layanan TRANSPO.
              <br />
              <br />
              Hormat kami,
            </Text>
            <br />
            <Text className="text-base font-bold mb-6 px-6">Tim TRANSPO.</Text>

            <Section className="text-center px-6">
              <Button
                className="bg-[#0897B1] text-white px-6 py-3 rounded-lg text-sm font-medium no-underline"
                href={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/settings/order`}
              >
                Lihat Status Pesanan
              </Button>
            </Section>
          </Section>

          <Section>
            <Text className="text-white tracking-wide text-sm pb-4 px-4">
              Anda menerima email ini karena pembayaran Anda di TRANSPO telah
              disetujui. Jika Anda memiliki pertanyaan, silakan hubungi customer
              service kami.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default PaymentApproval;
