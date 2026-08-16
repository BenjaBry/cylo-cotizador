import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ClientInfo {
  name: string;
  nit: string;
  address: string;
  deliveryTime: string;
}

interface CartItem {
  producto: any;
  cantidad: number;
}

const getCloudinaryUrl = (codigo: string, producto: string) => {
  const formattedCode = codigo.toLowerCase().replace(/-/g, '_');
  const formattedName = producto.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return `https://res.cloudinary.com/dhew6sfwc/image/upload/v1/${formattedCode}_${formattedName}.jpg`;
};

// Convierte URL a Base64 para jsPDF
const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
};

export const generatePDF = async (client: ClientInfo, cart: CartItem[], total: number) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // --- PRELOAD IMAGES ---
  const imagesBase64: Record<string, string> = {};
  for (const item of cart) {
    const b64 = await fetchImageAsBase64(getCloudinaryUrl(item.producto.codigo, item.producto.producto));
    if (b64) {
      imagesBase64[item.producto.codigo] = b64;
    }
  }

  // --- HEADER FUNCTION ---
  const drawHeader = () => {
    // Dark Blue Background
    doc.setFillColor(11, 19, 43); // #0B132B
    doc.rect(10, 10, pageWidth - 20, 25, 'F');
    
    // Title CYLO
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.text("CYLO", 15, 29);

    // Subtitle
    doc.setFontSize(10);
    doc.text("UN ENFOQUE ECOLÓGICO", pageWidth / 2, 24, { align: 'center' });
  };

  drawHeader();

  // --- CLIENT INFO ---
  let currentY = 45;
  doc.setTextColor(180, 50, 0); // Orange/Red color for title
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("COTIZACIÓN POR COMPRA DE INSUMOS", 14, currentY);
  
  const cotNumber = `COT-${new Date().getTime().toString().slice(-8)}`;
  doc.text(cotNumber, pageWidth - 14, currentY, { align: 'right' });
  
  // Draw line
  currentY += 2;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);
  
  currentY += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50);
  doc.setFontSize(9);
  
  const addClientLine = (label: string, value: string) => {
    doc.text(label, 14, currentY);
    doc.setFont("helvetica", "bold");
    doc.text(value, 50, currentY);
    doc.setFont("helvetica", "normal");
    currentY += 2;
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.line(14, currentY, pageWidth - 14, currentY);
    currentY += 6;
  };

  addClientLine("Dirigido a:", client.name || "Cliente");
  addClientLine("Con dirección a:", client.address || "Ciudad");
  addClientLine("NIT:", client.nit || "C/F");
  addClientLine("Número de cotización:", cotNumber);
  addClientLine("Descripción de línea:", "Insumos para alimentos / Lisos.");
  addClientLine("Asesor:", "CYLO GUATEMALA");
  addClientLine("Teléfono", "+502 4054 5591");
  addClientLine("Tiempo de Entrega", client.deliveryTime || "A convenir");

  // --- TABLE SECTION ---
  currentY += 5;
  doc.setTextColor(180, 50, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLES", 14, currentY);
  
  doc.setTextColor(50);
  doc.setFontSize(8);
  doc.text("*Precios incluyen impuestos", pageWidth - 14, currentY, { align: 'right' });

  const tableData = cart.map(item => [
    item.producto.codigo,
    item.producto.producto,
    item.cantidad.toString(),
    `Q ${item.producto.precio_unitario?.toFixed(2)}`,
    `Q ${(item.producto.precio_unitario * item.cantidad).toFixed(2)}`,
    "N/A"
  ]);

  (doc as any).autoTable({
    startY: currentY + 3,
    head: [['MODELO', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'PRECIO UNIT', 'NOTA:']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, lineColor: 0 },
    bodyStyles: { textColor: [50, 50, 50], lineWidth: 0.1, lineColor: 0 },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
      5: { textColor: [255, 0, 0], fontStyle: 'bold' } // Red Note
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || currentY + 10;

  // --- TOTAL ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL", 50, finalY + 6);
  doc.text(`Q ${total.toFixed(2)}`, pageWidth - 14, finalY + 6, { align: 'right' });
  
  // Total line borders
  doc.setDrawColor(0);
  doc.setLineWidth(0.1);
  doc.line(14, finalY + 2, pageWidth - 14, finalY + 2);
  doc.line(14, finalY + 8, pageWidth - 14, finalY + 8);

  // --- TERMS / ALERT BOX ---
  const alertY = finalY + 12;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(50);
  doc.text("NOTA: DE REQUERIR UN MODELO O EMPAQUE ESPECÍFICO, PUEDE NOTIFICAR: CANTIDAD REQUERIDA MENSUALMENTE...", 14, alertY);

  const boxY = alertY + 4;
  doc.setFillColor(245, 166, 35); // Orange color
  doc.rect(14, boxY, pageWidth - 28, 15, 'F');
  
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BENEFICIOS: ENVÍO SIN COSTO ADICIONAL, ASISTENCIA Y MONITOREO DE SU PEDIDO.", pageWidth / 2, boxY + 5, { align: 'center' });
  doc.text("ENVÍO EN 24 A 72 HORAS HASTA LA PUERTA. ENVÍO EXPRESS SIN COSTOS ADICIONALES (CIUDAD CAPITAL).", pageWidth / 2, boxY + 9, { align: 'center' });
  doc.setTextColor(200, 0, 0);
  doc.text("PEDIDO PUESTO EN RUTA POSTERIOR A LA VALIDACIÓN DE SU PAGO.", pageWidth / 2, boxY + 13, { align: 'center' });


  // ==========================================
  // PAGE 2: ANEXO
  // ==========================================
  doc.addPage();
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text("ANEXO", 14, 20);

  const anexoData = cart.map(item => [
    item.producto.codigo,
    item.producto.producto,
    '', // Image placeholder
    "FOTOGRAFÍA REFERENCIAL"
  ]);

  (doc as any).autoTable({
    startY: 25,
    head: [['MODELO', 'PRODUCTO', 'IMAGEN', 'NOTA']],
    body: anexoData,
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.2, lineColor: 0 },
    bodyStyles: { minCellHeight: 40, valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 },
      3: { textColor: [255, 0, 0], fontStyle: 'bold' }
    },
    didDrawCell: function(data: any) {
      // If it's the IMAGEN column (index 2) in the body
      if (data.section === 'body' && data.column.index === 2) {
        const itemCode = data.row.raw[0];
        const base64Img = imagesBase64[itemCode];
        if (base64Img) {
          // Draw image centered in cell
          const cellWidth = data.cell.width;
          const cellHeight = data.cell.height;
          const imgWidth = 35;
          const imgHeight = 35;
          const x = data.cell.x + (cellWidth - imgWidth) / 2;
          const y = data.cell.y + (cellHeight - imgHeight) / 2;
          doc.addImage(base64Img, 'JPEG', x, y, imgWidth, imgHeight);
        }
      }
    }
  });

  doc.save(`Cotizacion_CYLO_${client.name ? client.name.replace(/\s+/g, '_') : 'Cliente'}.pdf`);
};
