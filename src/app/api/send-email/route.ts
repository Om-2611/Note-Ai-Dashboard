import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateSummaryPDF } from "@/lib/pdf-generator";

export async function POST(req: Request) {
  try {
    const { summary, email } = await req.json();

    if (!email || !summary) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ Generate PDF
    const pdfBytes = await generateSummaryPDF(summary);

    // ✅ Setup mail transport (Gmail example)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Send email with PDF attachment
    console.log(`Attempting to send email to: ${email}`); // Add this line
    await transporter.sendMail({
      from: `"Note AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Meeting Summary",
      text: "Please find attached the meeting summary in PDF format.",
      attachments: [
        {
          filename: "Meeting Summary.pdf", // Changed filename for clarity
          content: Buffer.from(pdfBytes), // convert Uint8Array → Buffer
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email Error:", error); // Changed console log message
    return NextResponse.json(
      { error: error.message || "Email sending failed" }, // More informative error message
      { status: 500 }
    );
  }
}