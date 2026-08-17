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
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Buscamos todas las secciones que deben ir en páginas separadas
    const sections = element.querySelectorAll('.pdf-section');
    const targetElements = sections.length > 0 ? Array.from(sections) : [element];

    let isFirstPage = true;

    for (const targetEl of targetElements) {
      const canvas = await html2canvas(targetEl as HTMLElement, {
        scale: 2, // Alta resolución
        useCORS: true, // Permitir imágenes de Cloudinary
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        width: 794
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let position = 0;
      let heightLeft = pdfHeight;
      
      // Si no es la primera página del PDF total, agregamos una nueva
      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      // Imprimimos el primer chunk de esta sección
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      position -= pageHeight;

      // Multipage logic para secciones que miden más de 1 página (tolerancia 2mm)
      while (heightLeft > 2) {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
      }
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
