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

export const generatePDF = (client: ClientInfo, cart: CartItem[], total: number) => {
  const doc = new jsPDF();
  
  // CYLO Header
  doc.setFontSize(22);
  doc.setTextColor(30, 58, 138); // Dark blue
  doc.text("CYLO Guatemala", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Cotización Oficial", 14, 28);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-GT')}`, 14, 34);

  // Client Info Section
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Datos del Cliente", 14, 45);
  doc.setFontSize(10);
  doc.text(`Nombre: ${client.name || 'N/A'}`, 14, 52);
  doc.text(`NIT: ${client.nit || 'C/F'}`, 14, 58);
  doc.text(`Dirección: ${client.address || 'N/A'}`, 14, 64);
  doc.text(`Tiempo de Entrega: ${client.deliveryTime || 'Inmediato'}`, 14, 70);

  // Table
  const tableData = cart.map(item => [
    item.producto.codigo,
    item.producto.producto,
    item.cantidad.toString(),
    `Q${item.producto.precio_unitario?.toFixed(2)}`,
    `Q${(item.producto.precio_unitario * item.cantidad).toFixed(2)}`
  ]);

  (doc as any).autoTable({
    startY: 80,
    head: [['Código', 'Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138] },
    columnStyles: {
      0: { cellWidth: 30 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 80;

  // Totals & Terms
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: Q${total.toFixed(2)}`, 140, finalY + 10);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Impuestos ya incluidos.", 14, finalY + 10);
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Contacto: ventas@cyloguatemala.me | WhatsApp: 4054 5591", 14, pageHeight - 10);

  doc.save(`Cotizacion_CYLO_${client.name ? client.name.replace(/\s+/g, '_') : 'Cliente'}.pdf`);
};
