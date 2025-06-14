import { render } from "@react-email/render";
import { sendMail } from "@/lib/nodemailer";
import PaymentVerification from "@/components/email/payment-verification";
import OrderVerification from "@/components/email/order-confirmation";
import PaymentRemainder from "@/components/email/payment-remainder";
import RegisterVerification from "@/components/email/register-verification";
import Thanks from "@/components/email/thanks";
import ForgotPasswordEmail from "@/components/email/forgot-password";
import PaymentApproval from "@/components/email/payment-approval";
import PaymentRejection from "@/components/email/payment-rejection";

export type EmailTemplateType =
  | "payment-verification"
  | "order-confirmation"
  | "payment-remainder"
  | "register-verification"
  | "thanks"
  | "forgot-password"
  | "payment-approval"
  | "payment-rejection";

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

export interface PaymentApprovalData extends BaseEmailData {
  type: "payment-approval";
  orderType: string;
  totalAmount: number;
  invoiceNumber: string;
  paymentDate: string;
  invoiceBuffer: Buffer;
}

export interface PaymentRejectionData extends BaseEmailData {
  type: "payment-rejection";
  reason: string;
  orderType: string;
  totalAmount: number;
}

export type EmailData =
  | PaymentVerificationData
  | OrderConfirmationData
  | PaymentRemainderData
  | RegisterVerificationData
  | ThanksData
  | ForgotPasswordData
  | PaymentApprovalData
  | PaymentRejectionData;

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
  const attachments: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }> = [];

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
    case "payment-approval": {
      const data = emailData as PaymentApprovalData;
      subject = "Pembayaran Disetujui - Invoice Terlampir - TRANSPO";
      htmlContent = await render(
        PaymentApproval({
          fullName,
          orderType: data.orderType,
          totalAmount: data.totalAmount,
          invoiceNumber: data.invoiceNumber,
          paymentDate: data.paymentDate,
        })
      );
      textContent = `Yth. ${fullName}, Selamat! Pembayaran Anda telah disetujui. Invoice No: ${data.invoiceNumber} terlampir dalam email ini.`;

      // Add PDF invoice as attachment
      attachments.push({
        filename: `Invoice-${data.invoiceNumber}.pdf`,
        content: data.invoiceBuffer,
        contentType: "application/pdf",
      });
      break;
    }

    case "payment-rejection": {
      const data = emailData as PaymentRejectionData;
      subject = "Pembayaran Ditolak - TRANSPO";
      htmlContent = await render(
        PaymentRejection({
          fullName,
          reason: data.reason,
          orderType: data.orderType,
          totalAmount: data.totalAmount,
        })
      );
      textContent = `Yth. ${fullName}, Mohon maaf, pembayaran Anda untuk pesanan ${data.orderType} tidak dapat disetujui. Alasan: ${data.reason}. Tim kami akan menghubungi Anda segera.`;
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
    attachments: attachments.length > 0 ? attachments : undefined,
  });
}

/**
 * Quick functions untuk setiap jenis email
 */
export const emailTemplates = {
  async sendPaymentVerification(to: string, fullName: string) {
    return sendTemplateEmail({ type: "payment-verification", to, fullName });
  },
  async sendOrderConfirmation(
    to: string,
    fullName: string,
    orderData: Array<{ text: string; value: string | number }>
  ) {
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
  async sendPaymentApproval(
    to: string,
    fullName: string,
    orderType: string,
    totalAmount: number,
    invoiceNumber: string,
    paymentDate: string,
    invoiceBuffer: Buffer
  ) {
    return sendTemplateEmail({
      type: "payment-approval",
      to,
      fullName,
      orderType,
      totalAmount,
      invoiceNumber,
      paymentDate,
      invoiceBuffer,
    });
  },

  async sendPaymentRejection(
    to: string,
    fullName: string,
    reason: string,
    orderType: string,
    totalAmount: number
  ) {
    return sendTemplateEmail({
      type: "payment-rejection",
      to,
      fullName,
      reason,
      orderType,
      totalAmount,
    });
  },
};
