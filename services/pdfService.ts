import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PDF Engine Service
 * Converts HTML elements to high-fidelity PDF documents.
 */
export const generatePdf = async (elementId: string, fileName: string): Promise<boolean> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[PDF Engine] Element not found: ${elementId}`);
    return false;
  }

  try {
    console.log(`[PDF Engine] Capturing document: ${fileName}...`);
    
    // Capture the element using html2canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better resolution (retina-like)
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions (A4)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Save the PDF
    pdf.save(`${fileName}.pdf`);
    
    console.log(`[PDF Engine] Successfully generated: ${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error("[PDF Engine] Generation failed:", error);
    return false;
  }
};
