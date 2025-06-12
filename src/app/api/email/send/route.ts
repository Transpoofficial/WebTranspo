import { NextRequest, NextResponse } from "next/server";
import { sendTemplateEmail, EmailData } from "@/lib/email-templates";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const {
      to,
      fullName,
      emailType = "payment-verification",
      ...extraData
    } = body;

    if (!to || !fullName) {
      return NextResponse.json(
        { message: "Missing required fields: to, fullName", data: [] },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { message: "Invalid email format", data: [] },
        { status: 400 }
      );
    }

    // Construct email data based on type
    let emailData: EmailData;

    switch (emailType) {
      case "payment-verification":
        emailData = { type: "payment-verification", to, fullName };
        break;

      case "order-confirmation":
        if (!extraData.orderData || !Array.isArray(extraData.orderData)) {
          return NextResponse.json(
            {
              message: "orderData is required for order-confirmation email",
              data: [],
            },
            { status: 400 }
          );
        }
        emailData = {
          type: "order-confirmation",
          to,
          fullName,
          orderData: extraData.orderData,
        };
        break;

      case "payment-remainder":
        if (!extraData.percentage || !extraData.dueDate) {
          return NextResponse.json(
            {
              message:
                "percentage and dueDate are required for payment-remainder email",
              data: [],
            },
            { status: 400 }
          );
        }
        emailData = {
          type: "payment-remainder",
          to,
          fullName,
          percentage: extraData.percentage,
          dueDate: extraData.dueDate,
        };
        break;

      case "register-verification":
        emailData = { type: "register-verification", to, fullName };
        break;

      case "thanks":
        if (!extraData.reviewUrl) {
          return NextResponse.json(
            { message: "reviewUrl is required for thanks email", data: [] },
            { status: 400 }
          );
        }
        emailData = {
          type: "thanks",
          to,
          fullName,
          reviewUrl: extraData.reviewUrl,
        };
        break;

      default:
        return NextResponse.json(
          { message: "Invalid email type", data: [] },
          { status: 400 }
        );
    }

    // Send email using the utility function
    await sendTemplateEmail(emailData);

    return NextResponse.json(
      {
        message: "Email sent successfully",
        data: { to, emailType },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Failed to send email", data: [] },
      { status: 500 }
    );
  }
};
