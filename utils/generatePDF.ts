import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  const scaleWrapper = document.getElementById('pdf-scale-wrapper');
  
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  let originalTransform = '';
  let originalTransition = '';

  if (scaleWrapper) {
    originalTransform = scaleWrapper.style.transform;
    originalTransition = scaleWrapper.style.transition;
    // Quitamos transición y escala para evitar animaciones molestas y aplastamiento de texto
    scaleWrapper.style.transition = 'none';
    scaleWrapper.style.transform = 'none';
  }

  // Pequeña pausa para asegurar que el navegador recalculó los espacios en blanco sin la escala
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Alta resolución
      useCORS: true, // Permitir imágenes de Cloudinary
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      width: 794
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Si el contenido es más largo que una página, jsPDF por defecto lo cortará, 
    // pero para una plantilla bien diseñada (tamaño A4 fijo en CSS), encajará perfecto.
    // Si necesitamos multipágina real con html2canvas es más complejo, 
    // pero para esta cotización, ajustamos la escala.
    
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    if (pdfHeight > pageHeight) {
       // Simple multipage logic
       let heightLeft = pdfHeight;
       while (heightLeft > 0) {
         pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
         heightLeft -= pageHeight;
         position -= pageHeight;
         if (heightLeft > 0) {
           pdf.addPage();
         }
       }
    } else {
       pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Error generating PDF", error);
  } finally {
    if (scaleWrapper) {
      scaleWrapper.style.transform = originalTransform;
      // Pequeña pausa para devolver la transición y que no anime el regreso
      setTimeout(() => {
        scaleWrapper.style.transition = originalTransition;
      }, 50);
    }
  }
};
