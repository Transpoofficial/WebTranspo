import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { ReportPeriod } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") as ReportPeriod | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where = {
      ...(period && { reportPeriod: period }),
      ...(startDate && endDate && {
        AND: [
          { startDate: { gte: new Date(startDate) } },
          { endDate: { lte: new Date(endDate) } },
        ],
      }),
    };

    const reports = await prisma.report.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group reports by period
    const groupedReports = {
      DAILY: reports.filter(report => report.reportPeriod === 'DAILY'),
      WEEKLY: reports.filter(report => report.reportPeriod === 'WEEKLY'),
      MONTHLY: reports.filter(report => report.reportPeriod === 'MONTHLY'),
      YEARLY: reports.filter(report => report.reportPeriod === 'YEARLY'),
    };  

    return NextResponse.json({
      success: true, 
      message: "Reports Retrieved Successfully", 
      data: groupedReports
    });

  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
