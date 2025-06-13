//// filepath: /c:/Next.Js Project/intervyou/lib/nodemailer.ts
import nodemailer from "nodemailer";

// Use environment variables for sensitive information
const transporter = nodemailer.createTransport({
  from: process.env.SMTP_FROM, // e.g., "no
  host: process.env.SMTP_HOST, // e.g., smtp.gmail.com or smtp.mailtrap.io
  port: Number(process.env.SMTP_PORT), // e.g., 465 for SSL or 587 for TLS
  secure: process.env.SMTP_SECURE === "true", // true for SSL, false for TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async ({
  from = process.env.SMTP_FROM ?? "",
  to,
  subject,
  text,
  html,
  attachments,
}: {
  from?: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}) => {
  try {
    return transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      attachments,
    });
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email");
  }
};

export default transporter;
