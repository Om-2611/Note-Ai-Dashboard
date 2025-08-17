import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateSummaryPDF(summary: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const fontSize = 12;
  const margin = 50;
  const maxWidth = 500;
  let y = 700;

  page.drawText("Meeting Summary", {
    x: margin,
    y: 750,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  });

  // ✅ Break summary into words and wrap manually
  const words = summary.split(/\s+/);
  let line = "";

  for (const word of words) {
    const testLine = line + word + " ";
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width > maxWidth) {
      // Draw current line
      page.drawText(line.trim(), {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      line = word + " ";
      y -= 18; // Move down for next line
    } else {
      line = testLine;
    }
  }

  // Draw remaining line
  if (line.length > 0) {
    page.drawText(line.trim(), {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return pdfDoc.save();
}
