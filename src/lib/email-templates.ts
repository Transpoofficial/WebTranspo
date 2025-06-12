import { render } from "@react-email/render";
import { sendMail } from "@/lib/nodemailer";
import PaymentVerification from "@/components/email/payment-verification";
import OrderVerification from "@/components/email/order-confirmation";
import PaymentRemainder from "@/components/email/payment-remainder";
import RegisterVerification from "@/components/email/register-verification";
import Thanks from "@/components/email/thanks";
import ForgotPasswordEmail from "@/components/email/forgot-password";

export type EmailTemplateType =
  | "payment-verification"
  | "order-confirmation"
  | "payment-remainder"
  | "register-verification"
  | "thanks"
  | "forgot-password";

export interface BaseEmailData {
  to: string;
  fullName: string;
}

export interface PaymentVerificationData extends BaseEmailData {
  type: "payment-verification";
}

export interface OrderConfirmationData extends BaseEmailData {
  type: "order-confirmation";
  orderData: Array<{
    text: string;
    value: string | number;
  }>;
}

export interface PaymentRemainderData extends BaseEmailData {
  type: "payment-remainder";
  percentage: number;
  dueDate: string;
}

export interface RegisterVerificationData extends BaseEmailData {
  type: "register-verification";
}

export interface ThanksData extends BaseEmailData {
  type: "thanks";
  reviewUrl: string;
}

export interface ForgotPasswordData extends BaseEmailData {
  type: "forgot-password";
  resetLink: string;
}

export type EmailData =
  | PaymentVerificationData
  | OrderConfirmationData
  | PaymentRemainderData
  | RegisterVerificationData
  | ThanksData
  | ForgotPasswordData;

/**
 * Utility function untuk mengirim email dengan template yang sesuai
 */
export async function sendTemplateEmail(emailData: EmailData): Promise<void> {
  const { to, fullName, type } = emailData;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new Error(`Invalid email format: ${to}`);
  }

  let subject = "";
  let htmlContent = "";
  let textContent = "";

  // Generate content based on email type
  switch (type) {
    case "payment-verification": {
      subject = "Verifikasi Pembayaran - TRANSPO";
      htmlContent = await render(PaymentVerification({ fullName }));
      textContent = `Yth. ${fullName}, Terima kasih atas konfirmasi pembayaran Anda. Kami telah menerima bukti transfer dan sedang melakukan proses verifikasi.`;
      break;
    }

    case "order-confirmation": {
      const data = emailData as OrderConfirmationData;
      subject = "Pesanan Anda Telah Dikonfirmasi - TRANSPO";
      htmlContent = await render(
        OrderVerification({
          fullName,
          orderData: data.orderData,
        })
      );
      textContent = `Yth. ${fullName}, Pesanan Anda telah berhasil dikonfirmasi dan siap berangkat.`;
      break;
    }

    case "payment-remainder": {
      const data = emailData as PaymentRemainderData;
      subject = `Pengingat Pelunasan ${data.percentage}% - TRANSPO`;
      htmlContent = await render(
        PaymentRemainder({
          fullName,
          percentage: data.percentage,
          dueDate: data.dueDate,
        })
      );
      textContent = `Yth. ${fullName}, Mohon segera melakukan pelunasan sisa ${data.percentage}% paling lambat ${data.dueDate}.`;
      break;
    }

    case "register-verification": {
      subject = "Selamat Datang di TRANSPO";
      htmlContent = await render(RegisterVerification({ fullName }));
      textContent = `Yth. ${fullName}, Terima kasih telah melakukan pendaftaran di TRANSPO. Akun Anda telah berhasil didaftarkan.`;
      break;
    }
    case "thanks": {
      const data = emailData as ThanksData;
      subject = "Terima Kasih - TRANSPO";
      htmlContent = await render(
        Thanks({
          fullName,
          reviewUrl: data.reviewUrl,
        })
      );
      textContent = `Yth. ${fullName}, Terima kasih telah mempercayakan perjalanan Anda bersama TRANSPO.`;
      break;
    }

    case "forgot-password": {
      const data = emailData as ForgotPasswordData;
      subject = "Reset Password Akun TRANSPO Anda";
      htmlContent = await render(
        ForgotPasswordEmail({
          fullName,
          resetLink: data.resetLink,
        })
      );
      textContent = `Yth. ${fullName}, Kami menerima permintaan untuk mereset password akun TRANSPO Anda. Klik link berikut untuk membuat password baru: ${data.resetLink}`;
      break;
    }

    default:
      throw new Error(`Unsupported email template type: ${type}`);
  }

  // Send the email
  await sendMail({
    to,
    subject,
    text: textContent,
    html: htmlContent,
  });

  console.log(`Email sent successfully: ${type} to ${to}`);
}

/**
 * Quick functions untuk setiap jenis email
 */
export const emailTemplates = {
  async sendPaymentVerification(to: string, fullName: string) {
    return sendTemplateEmail({ type: "payment-verification", to, fullName });
  },

  async sendOrderConfirmation(to: string, fullName: string, orderData: any[]) {
    return sendTemplateEmail({
      type: "order-confirmation",
      to,
      fullName,
      orderData,
    });
  },

  async sendPaymentRemainder(
    to: string,
    fullName: string,
    percentage: number,
    dueDate: string
  ) {
    return sendTemplateEmail({
      type: "payment-remainder",
      to,
      fullName,
      percentage,
      dueDate,
    });
  },

  async sendRegisterVerification(to: string, fullName: string) {
    return sendTemplateEmail({ type: "register-verification", to, fullName });
  },
  async sendThanks(to: string, fullName: string, reviewUrl: string) {
    return sendTemplateEmail({ type: "thanks", to, fullName, reviewUrl });
  },

  async sendForgotPassword(to: string, fullName: string, resetLink: string) {
    return sendTemplateEmail({
      type: "forgot-password",
      to,
      fullName,
      resetLink,
    });
  },
};
