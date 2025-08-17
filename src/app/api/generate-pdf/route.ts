import { NextResponse } from "next/server";
import { generateSummaryPDF } from "@/lib/pdf-generator";

export const runtime = "nodejs"; // ✅ Ensure Node.js runtime, not Edge

export async function POST(req: Request) {
  try {
    const { summary } = await req.json();
    if (!summary) {
      return NextResponse.json({ error: "Missing summary" }, { status: 400 });
    }

    const pdfBytes = await generateSummaryPDF(summary);

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="summary.pdf"',
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Error:", error); // ✅ Log error on server
    return NextResponse.json({ error: error.message || "PDF generation failed" }, { status: 500 });
  }
}
