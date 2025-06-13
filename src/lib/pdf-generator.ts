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
  doc.rect(0, 0, pageWidth, 50, "F");

  // Company info section (left side)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("TRANSPO", margin, 25);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("PT. Transpo Indonesia Mandiri", margin, 35);

  doc.setFontSize(10);
  doc.text("Platform Transportasi Terpercaya", margin, 42);

  // Invoice title with professional styling (right side, aligned)
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  const titleWidth = doc.getTextWidth("INVOICE");
  doc.text("INVOICE", pageWidth - margin - titleWidth, 35);
  // ===================
  // INVOICE DETAILS SECTION
  // ===================
  let currentY = 70;

  // Invoice information box (moved to left side)
  doc.setFillColor(...lightGray);
  doc.rect(margin, currentY - 5, 70, 35, "F");
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.rect(margin, currentY - 5, 70, 35);

  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("No. Invoice:", margin + 5, currentY + 2);
  doc.setFont("helvetica", "normal");
  doc.text(data.invoiceNumber, margin + 5, currentY + 8);

  doc.setFont("helvetica", "bold");
  doc.text("Tanggal:", margin + 5, currentY + 16);
  doc.setFont("helvetica", "normal");
  doc.text(data.invoiceDate, margin + 5, currentY + 22);

  // ===================
  // CUSTOMER INFORMATION
  // ===================
  currentY += 50;

  // Bill To section
  doc.setFillColor(...primaryColor);
  // doc.rect(margin, currentY - 8, 80, 12, "F");
  doc.rect(margin, currentY - 8, pageWidth - 2 * margin, 12, "F");
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
    description: 75,
    qty: 18,
    price: 35,
    total: 35,
  };

  let colX = margin;
  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  doc.text("No.", colX + 2, tableStartY + 10);
  colX += colWidths.no;
  doc.text("Deskripsi Layanan", colX + 2, tableStartY + 10);
  colX += colWidths.description;
  doc.text("Qty", colX + 2, tableStartY + 10);
  colX += colWidths.qty;
  doc.text("Harga", colX + 2, tableStartY + 10);
  colX += colWidths.price;
  doc.text("Total", colX + 2, tableStartY + 10);
  // Table content with alternating row colors
  currentY = tableStartY + 15;
  doc.setTextColor(...darkGray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  data.items.forEach((item, index) => {
    // Calculate dynamic row height based on description lines
    const descLines = doc.splitTextToSize(
      item.description,
      colWidths.description - 4
    );
    const rowHeight = Math.max(15, descLines.length * 5 + 10);

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, "F");
    }

    colX = margin;

    // Row content with proper vertical alignment
    const contentY = currentY + Math.max(10, (rowHeight - 10) / 2 + 5);

    // No.
    doc.text((index + 1).toString(), colX + 2, contentY);
    colX += colWidths.no;

    // Description with proper text wrapping and spacing
    const descY = currentY + 8;
    descLines.forEach((line: string, lineIndex: number) => {
      doc.text(line, colX + 2, descY + lineIndex * 5);
    });
    colX += colWidths.description;

    // Quantity
    doc.text(item.quantity.toString(), colX + 2, contentY);
    colX += colWidths.qty;

    // Unit Price
    doc.text(formatRupiah(item.unitPrice), colX + 2, contentY);
    colX += colWidths.price;

    // Total
    doc.text(formatRupiah(item.total), colX + 2, contentY);

    currentY += rowHeight;
  });
  // Add total row as part of the table
  const totalRowHeight = 20;

  // Total row background (slightly darker)
  doc.setFillColor(...lightGray);
  doc.rect(margin, currentY, pageWidth - 2 * margin, totalRowHeight, "F");

  // Total row content - spanning across columns without internal borders
  colX = margin;

  // Empty cells for No. and Description
  colX += colWidths.no + colWidths.description;

  // "TOTAL" label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL PEMBAYARAN:", colX + 2, currentY + 13);

  // Total amount - positioned at the right side with more space
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  const totalText = formatRupiah(data.totalAmount);
  const totalTextWidth = doc.getTextWidth(totalText);
  doc.text(totalText, pageWidth - margin - totalTextWidth - 5, currentY + 13);

  currentY += totalRowHeight;
  // Table borders (including total row)
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, currentY - tableStartY);

  // Vertical lines (only for item rows, not total row)
  const itemRowsEndY = currentY - totalRowHeight;
  colX = margin + colWidths.no;
  doc.line(colX, tableStartY, colX, itemRowsEndY);
  colX += colWidths.description;
  doc.line(colX, tableStartY, colX, itemRowsEndY);
  colX += colWidths.qty;
  doc.line(colX, tableStartY, colX, itemRowsEndY);
  colX += colWidths.price;
  doc.line(colX, tableStartY, colX, itemRowsEndY);

  // Reset text color for next sections
  doc.setTextColor(...darkGray); // ===================
  // DESTINATIONS/ITINERARY (if applicable)
  // ===================
  if (data.destinations && data.destinations.length > 0) {
    currentY += 20;

    // Check if we need a new page for destinations
    const destinationsSectionHeight = 60 + data.destinations.length * 10;
    const footerHeight = 60; // Height needed for footer
    const remainingSpaceForDestinations = pageHeight - currentY - footerHeight;

    if (remainingSpaceForDestinations < destinationsSectionHeight) {
      doc.addPage();
      currentY = 30;
    }

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
      doc.text(dest.address, margin + 8, currentY); // Show full date (dd MMM yyyy) without time
      if (dest.departureTime) {
        try {
          // Parse the departureTime and format it to Indonesian date
          const departureDate = new Date(dest.departureTime);
          const formattedDate = departureDate.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          doc.setFont("helvetica", "italic");
          doc.text(`(${formattedDate})`, margin + 8, currentY + 5);
        } catch {
          // If parsing fails, extract date part and show it
          const dateOnly = dest.departureTime.split(" ")[0];
          doc.setFont("helvetica", "italic");
          doc.text(`(${dateOnly})`, margin + 8, currentY + 5);
        }
      } else {
        doc.setFont("helvetica", "italic");
        doc.text(`(Tanggal tidak ditentukan)`, margin + 8, currentY + 5);
      }
      currentY += 10;
    });
  } // ===================
  // IMPORTANT NOTES SECTION (Always included)
  // ===================
  currentY += 20;

  // Check if we need a new page for notes
  const notesSectionHeight = 80; // Estimated height for important notes
  const footerHeight = 60; // Height needed for footer
  const remainingSpaceForNotes = pageHeight - currentY - footerHeight;

  if (remainingSpaceForNotes < notesSectionHeight) {
    doc.addPage();
    currentY = 30;
  }

  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY - 8, pageWidth - 2 * margin, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("CATATAN PENTING:", margin + 5, currentY - 1);

  currentY += 15;
  doc.setTextColor(...darkGray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const importantNotes = [
    "• Pastikan untuk hadir tepat waktu sesuai jadwal keberangkatan yang telah ditentukan.",
    "• Kelupaan atau keterlambatan dari pihak customer BUKAN menjadi tanggung jawab TRANSPO.",
    "• Harap simpan invoice ini sebagai bukti pembayaran yang sah.",
    "• Untuk perubahan jadwal atau pembatalan, silakan hubungi customer service minimal H-1.",
    "• Barang bawaan adalah tanggung jawab masing-masing penumpang.",
    "• Dilarang membawa barang berbahaya, ilegal, atau yang dapat mengganggu perjalanan.",
    "• Pastikan nomor telepon aktif untuk koordinasi dengan driver/guide.",
  ];

  // Add custom notes if provided
  if (data.notes) {
    importantNotes.push(`• ${data.notes}`);
  }

  importantNotes.forEach((note) => {
    const noteLines = doc.splitTextToSize(note, pageWidth - 2 * margin - 10);
    noteLines.forEach((line: string) => {
      doc.text(line, margin + 5, currentY);
      currentY += 4;
    });
    currentY += 2; // Extra space between notes
  });

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
  doc.text("TRANSPO - PT. Transpo Indonesia Mandiri", margin, footerY + 15);
  doc.text(
    "Platform Transportasi Terpercaya - Malang Raya, Jawa Timur",
    margin,
    footerY + 22
  );
  doc.text(
    "Email: transpoofficial@gmail.com | Telp: +62 822 3137 8326",
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
  doc.text(generatedText, pageWidth - margin - generatedWidth, footerY + 32);

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
