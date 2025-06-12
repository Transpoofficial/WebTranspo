import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ForgotPasswordEmailProps {
  fullName: string;
  resetLink: string;
}

export const ForgotPasswordEmail = ({
  fullName = "",
  resetLink = "",
}: ForgotPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset Password Akun TRANSPO Anda</Preview>
    <Tailwind>
      <Body className="bg-[#0897B1] m-0 p-0 pt-10">
        <Container className="bg-[#0897B1] max-w-2xl mx-auto p-8 rounded-2xl font-sans">
          <Section className="bg-white rounded-xl p-6 mb-6">
            <Text className="text-3xl font-bold m-0 text-center pt-8 px-8">
              Transpo
            </Text>

            <Text className="text-2xl font-bold mb-4 text-center px-8">
              Reset Password Akun Anda
            </Text>
            <Text className="text-lg font-light leading-8 px-8">
              Yth. {fullName}, <br />
              Kami menerima permintaan untuk mereset password akun TRANSPO Anda.
              Klik tombol di bawah ini untuk membuat password baru:
              <br />
              <br />
            </Text>

            <div className="text-center py-4">
              <Button
                href={resetLink}
                className="bg-[#0897B1] text-white font-semibold py-3 px-6 rounded-lg text-lg"
              >
                Reset Password
              </Button>
            </div>

            <Text className="text-lg font-light leading-8 px-8">
              <br />
              Link ini akan kadaluarsa dalam 1 jam. Jika Anda tidak meminta
              reset password, silakan abaikan email ini.
              <br />
              <br />
              Untuk keamanan akun Anda, jangan bagikan link ini kepada siapa
              pun.
              <br />
              <br />
              Hormat kami,
            </Text>
            <br />
            <Text className="text-lg font-bold mb-6 px-8">Tim TRANSPO.</Text>
          </Section>
          <Section>
            <Text className="text-white tracking-wide text-base pb-4">
              Email ini dikirim karena ada permintaan reset password untuk akun
              TRANSPO Anda. Jika Anda tidak merasa melakukan permintaan ini,
              silakan abaikan email ini atau hubungi tim support kami.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default ForgotPasswordEmail;
