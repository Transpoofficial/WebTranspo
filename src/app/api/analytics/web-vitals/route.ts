import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, value, id, path, timestamp } = body;

    // Log the web vitals data
    console.log("Web Vitals Data:", {
      metric,
      value,
      id,
      path,
      timestamp,
      userAgent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
    });

    // Here you can store the data to your database
    // or send it to external analytics services

    // Example: Store to database
    // await prisma.webVitals.create({
    //   data: {
    //     metric,
    //     value,
    //     id,
    //     path,
    //     timestamp: new Date(timestamp),
    //     userAgent: request.headers.get('user-agent'),
    //     referer: request.headers.get('referer'),
    //   }
    // });

    // Example: Send to external service
    // await fetch('https://analytics-service.com/api/web-vitals', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`
    //   },
    //   body: JSON.stringify(body)
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing web vitals data:", error);
    return NextResponse.json(
      { error: "Failed to process web vitals data" },
      { status: 500 }
    );
  }
}
