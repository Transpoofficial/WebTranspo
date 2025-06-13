import jsPDF from "jspdf";

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  orderType: "TRANSPORT" | "TOUR";
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
  paymentDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  destinations?: Array<{
    address: string;
    departureTime?: string;
  }>;
  tourPackage?: {
    name: string;
    destination: string;
    duration: string;
  };
  vehicleType?: string;
  notes?: string;
}

export function generateInvoicePDF(data: InvoiceData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Brand colors matching TRANSPO design system
  const primaryColor: [number, number, number] = [8, 151, 177]; // #0897B1
  const primaryDark: [number, number, number] = [36, 138, 158]; // #248a9e
  const lightGray: [number, number, number] = [245, 245, 245]; // #f5f5f5
  const darkGray: [number, number, number] = [51, 51, 51]; // #333333
  const mediumGray: [number, number, number] = [102, 102, 102]; // #666666
  const borderColor: [number, number, number] = [221, 221, 221]; // #dddddd

  // ===================
  // HEADER SECTION - Professional Design
  // ===================

  // Company header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Company info section
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("TRANSPO", margin, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Platform Transportasi Terpercaya", margin, 32);
  doc.text("Malang Raya, Jawa Timur", margin, 38);

  // Invoice title with professional styling
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  const titleWidth = doc.getTextWidth("INVOICE");
  doc.text("INVOICE", pageWidth - margin - titleWidth, 30);

  // ===================
  // INVOICE DETAILS SECTION
  // ===================
  let currentY = 65;

  // Invoice information box
  doc.setFillColor(...lightGray);
  doc.rect(pageWidth - 90, currentY - 5, 70, 35, "F");
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.rect(pageWidth - 90, currentY - 5, 70, 35);

  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("No. Invoice:", pageWidth - 85, currentY + 2);
  doc.setFont("helvetica", "normal");
  doc.text(data.invoiceNumber, pageWidth - 85, currentY + 8);

  doc.setFont("helvetica", "bold");
  doc.text("Tanggal:", pageWidth - 85, currentY + 16);
  doc.setFont("helvetica", "normal");
  doc.text(data.invoiceDate, pageWidth - 85, currentY + 22);

  // ===================
  // CUSTOMER INFORMATION
  // ===================
  currentY += 50;

  // Bill To section
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY - 8, 80, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TAGIHAN KEPADA:", margin + 5, currentY - 1);

  currentY += 10;
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.customerName, margin, currentY);

  currentY += 6;
  doc.setFont("helvetica", "normal");
  doc.text(data.customerEmail, margin, currentY);

  currentY += 6;
  doc.text(data.customerPhone, margin, currentY);

  // Address handling with proper wrapping
  if (data.customerAddress) {
    currentY += 6;
    const addressLines = doc.splitTextToSize(data.customerAddress, 120);
    addressLines.forEach((line: string) => {
      doc.text(line, margin, currentY);
      currentY += 5;
    });
  }

  // ===================
  // ORDER DETAILS SECTION
  // ===================
  currentY += 15;

  // Order info header
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY - 8, pageWidth - 2 * margin, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("DETAIL PESANAN", margin + 5, currentY - 1);

  currentY += 10;
  doc.setTextColor(...darkGray);

  // Order type and vehicle info
  const orderInfo = [
    [`Jenis Layanan:`, data.orderType === "TRANSPORT" ? "Transportasi" : "Tur"],
    [`Jenis Kendaraan:`, data.vehicleType || "-"],
    [`Tanggal Keberangkatan:`, data.orderDate],
    [`Metode Pembayaran:`, data.paymentMethod],
    [`Tanggal Pembayaran:`, data.paymentDate],
  ];

  orderInfo.forEach(([label, value]) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 45, currentY);
    currentY += 6;
  });

  // ===================
  // ITEMIZED TABLE
  // ===================
  currentY += 10;
  const tableStartY = currentY;

  // Table headers with modern design
  doc.setFillColor(...primaryDark);
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, 15, "F");

  // Table header borders
  doc.setDrawColor(...primaryDark);
  doc.setLineWidth(0.5);

  const colWidths = {
    no: 15,
    description: 80,
    qty: 20,
    price: 30,
    total: 25,
  };

  let colX = margin;

  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  doc.text("No.", colX + 2, tableStartY + 10);
  colX += colWidths.no;
  doc.text("Deskripsi", colX + 2, tableStartY + 10);
  colX += colWidths.description;
  doc.text("Qty", colX + 2, tableStartY + 10);
  colX += colWidths.qty;
  doc.text("Harga Satuan", colX + 2, tableStartY + 10);
  colX += colWidths.price;
  doc.text("Total", colX + 2, tableStartY + 10);

  // Table content with alternating row colors
  currentY = tableStartY + 15;
  doc.setTextColor(...darkGray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  data.items.forEach((item, index) => {
    const rowHeight = 15;

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, "F");
    }

    colX = margin;

    // Row content
    doc.text((index + 1).toString(), colX + 2, currentY + 10);
    colX += colWidths.no;

    // Description with text wrapping
    const descLines = doc.splitTextToSize(
      item.description,
      colWidths.description - 4
    );
    let descY = currentY + 10;
    descLines.forEach((line: string) => {
      doc.text(line, colX + 2, descY);
      descY += 5;
    });
    colX += colWidths.description;

    doc.text(item.quantity.toString(), colX + 2, currentY + 10);
    colX += colWidths.qty;

    doc.text(formatRupiah(item.unitPrice), colX + 2, currentY + 10);
    colX += colWidths.price;

    doc.text(formatRupiah(item.total), colX + 2, currentY + 10);

    currentY += Math.max(rowHeight, descLines.length * 5 + 5);
  });

  // Table borders
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, currentY - tableStartY);

  // Vertical lines
  colX = margin + colWidths.no;
  doc.line(colX, tableStartY, colX, currentY);
  colX += colWidths.description;
  doc.line(colX, tableStartY, colX, currentY);
  colX += colWidths.qty;
  doc.line(colX, tableStartY, colX, currentY);
  colX += colWidths.price;
  doc.line(colX, tableStartY, colX, currentY);

  // ===================
  // TOTAL SECTION - Professional Summary
  // ===================
  currentY += 20;

  // Total calculation box
  const totalBoxWidth = 80;
  const totalBoxHeight = 25;
  const totalBoxX = pageWidth - margin - totalBoxWidth;

  doc.setFillColor(...lightGray);
  doc.rect(totalBoxX, currentY - 5, totalBoxWidth, totalBoxHeight, "F");
  doc.setDrawColor(...borderColor);
  doc.rect(totalBoxX, currentY - 5, totalBoxWidth, totalBoxHeight);

  // Total amount
  doc.setTextColor(...darkGray);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PEMBAYARAN:", totalBoxX + 5, currentY + 5);

  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text(formatRupiah(data.totalAmount), totalBoxX + 5, currentY + 15);

  // ===================
  // DESTINATIONS/ITINERARY (if applicable)
  // ===================
  if (data.destinations && data.destinations.length > 0) {
    currentY += 40;

    doc.setFillColor(...primaryColor);
    doc.rect(margin, currentY - 8, pageWidth - 2 * margin, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("RUTE PERJALANAN", margin + 5, currentY - 1);

    currentY += 15;
    doc.setTextColor(...darkGray);
    doc.setFontSize(9);

    data.destinations.forEach((dest, index) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. `, margin, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(dest.address, margin + 8, currentY);

      if (dest.departureTime) {
        doc.setFont("helvetica", "italic");
        doc.text(`(${dest.departureTime})`, margin + 8, currentY + 5);
        currentY += 10;
      } else {
        currentY += 7;
      }
    });
  }

  // ===================
  // NOTES SECTION (if applicable)
  // ===================
  if (data.notes) {
    currentY += 20;

    doc.setFillColor(...lightGray);
    doc.rect(margin, currentY - 8, pageWidth - 2 * margin, 12, "F");
    doc.setTextColor(...darkGray);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("CATATAN:", margin + 5, currentY - 1);

    currentY += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const notesLines = doc.splitTextToSize(
      data.notes,
      pageWidth - 2 * margin - 10
    );
    notesLines.forEach((line: string) => {
      doc.text(line, margin + 5, currentY);
      currentY += 5;
    });
  }

  // ===================
  // FOOTER SECTION
  // ===================
  const footerY = pageHeight - 40;

  // Footer background
  doc.setFillColor(...lightGray);
  doc.rect(0, footerY - 5, pageWidth, 45, "F");

  // Terms and conditions
  doc.setTextColor(...mediumGray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    "* Invoice ini dibuat secara otomatis oleh sistem dan sah tanpa tanda tangan.",
    margin,
    footerY + 5
  );

  // Company contact info
  doc.setFont("helvetica", "normal");
  doc.text("TRANSPO - Platform Transportasi Terpercaya", margin, footerY + 15);
  doc.text(
    "Email: transpoofficial@gmail.com | Telp: +62 822 3137 8326",
    margin,
    footerY + 22
  );
  doc.text(
    "Alamat: Jl. Raya Karangsono No.18A, Sono Tengah, Kebonagung, Kec. Pakisaji, Kabupaten Malang, Jawa Timur 65162",
    margin,
    footerY + 29
  );

  // Generation info
  const generatedText = `Dicetak pada: ${new Date().toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )}`;
  const generatedWidth = doc.getTextWidth(generatedText);
  doc.text(generatedText, pageWidth - margin - generatedWidth, footerY + 35);

  return Buffer.from(doc.output("arraybuffer"));
}

// Helper function to format currency
function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function generateInvoiceNumber(paymentId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Format: INV-YYYYMMDD-{first 8 chars of payment ID}
  return `INV-${year}${month}${day}-${paymentId.substring(0, 8).toUpperCase()}`;
}
