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

interface RegisterVerificationProps {
  fullName?: string;
}

export const RegisterVerification = ({
  fullName = "",
}: RegisterVerificationProps) => (
  <Html>
    <Head />
    <Preview>Verifikasi Pendaftaran Berhasil</Preview>
    <Tailwind>
      <Body className="bg-[#0897B1] m-0 p-0 py-6">
        <Container className="bg-[#0897B1] w-full max-w-xl mx-auto p-6 rounded-xl font-sans">
          <Section className="bg-white rounded-lg p-6 mb-6">
            <Text className="text-2xl font-bold m-0 text-center pt-6 px-6">
              Transpo
            </Text>

            <Text className="text-xl font-bold mb-4 text-center px-6">
              Verifikasi Pendaftaran Berhasil
            </Text>
            <Text className="text-base font-light leading-6 px-6">
              Yth. {fullName}, <br />
              Terima kasih telah melakukan pendaftaran di TRANSPO. Akun Anda
              telah berhasil didaftarkan dan siap digunakan untuk melakukan
              pemesanan kendaraan.
              <br />
              <br />
              Silakan login untuk mulai menggunakan layanan kami.
              <br />
              <br />
              Hormat kami,
            </Text>
            <br />
            <Text className="text-base font-bold mb-6 px-6">Tim TRANSPO.</Text>
          </Section>
          <Section>
            <Text className="text-white tracking-wide text-sm pb-4 px-4">
              Anda menerima email ini karena telah berhasil melakukan
              pendaftaran akun di TRANSPO. Jika Anda tidak merasa melakukan
              pendaftaran, silakan abaikan email ini.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default RegisterVerification;
