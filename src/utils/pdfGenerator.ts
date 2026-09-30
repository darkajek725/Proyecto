import html2canvas from 'html2canvas-pro';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export interface GeneratePdfOptions {
  fileName: string;
  title?: string;
  onProgress?: (progress: string) => void;
}

/**
 * Generates and downloads a real PDF from any HTML container element.
 * Uses html2canvas-pro (which natively supports modern CSS oklch/lab colors used by Tailwind CSS 4)
 * with an automatic fallback to html-to-image (browser-native SVG foreignObject) and jsPDF.
 */
export async function generatePdfFromElement(
  element: HTMLElement,
  options: GeneratePdfOptions
): Promise<boolean> {
  const { fileName, onProgress } = options;
  const sanitizedFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  try {
    onProgress?.('Preparando documento...');

    // Wait a brief moment to ensure fonts and images are settled
    await new Promise((resolve) => setTimeout(resolve, 150));

    let imgData: string;
    let imgWidth: number;
    let imgHeight: number;

    try {
      onProgress?.('Renderizando alta resolución...');

      // Render DOM node to high-res canvas using html2canvas-pro (with oklch support)
      const canvas = await html2canvas(element, {
        scale: 2, // 2x for sharp print quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth || 1100,
        imageTimeout: 10000,
      });

      imgData = canvas.toDataURL('image/jpeg', 0.95);
      imgWidth = canvas.width;
      imgHeight = canvas.height;
    } catch (primaryErr) {
      console.warn('html2canvas-pro render error, trying html-to-image fallback:', primaryErr);
      onProgress?.('Renderizando con motor alternativo...');

      // Fallback to html-to-image which relies on native browser SVG foreignObject rendering
      imgData = await toJpeg(element, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
      });

      const tempImg = new Image();
      tempImg.src = imgData;
      await new Promise<void>((resolve) => {
        if (tempImg.complete) {
          resolve();
        } else {
          tempImg.onload = () => resolve();
          tempImg.onerror = () => resolve();
        }
      });

      imgWidth = tempImg.naturalWidth || (element.scrollWidth || 1024) * 2;
      imgHeight = tempImg.naturalHeight || (element.scrollHeight || 1400) * 2;
    }

    onProgress?.('Generando archivo PDF...');

    // Standard Letter page dimensions in mm
    const pdfPageWidth = 215.9;
    const pdfPageHeight = 279.4;
    const margin = 8; // 8mm margin
    const contentWidth = pdfPageWidth - margin * 2;
    const contentHeight = (imgHeight * contentWidth) / imgWidth;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    // If content fits on one page (with slight tolerance)
    if (contentHeight <= pdfPageHeight - margin * 2 + 5) {
      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);
    } else {
      // Multi-page slicing
      let heightLeft = contentHeight;
      let position = margin;
      const usableHeight = pdfPageHeight - margin * 2;

      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= usableHeight;

      while (heightLeft > 5) {
        position -= usableHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
        heightLeft -= usableHeight;
      }
    }

    onProgress?.('Descargando PDF...');
    pdf.save(sanitizedFileName);
    return true;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    // Fallback: download as clean self-contained HTML file
    downloadHtmlFallback(element, sanitizedFileName.replace(/\.pdf$/, '.html'), options.title);
    return false;
  }
}

/**
 * Attempts to print the element cleanly.
 * If running inside an iframe where window.print() is blocked by sandbox policies,
 * it automatically falls back to generating and downloading the PDF.
 */
export async function printOrDownloadPdf(
  element: HTMLElement,
  options: GeneratePdfOptions
): Promise<{ method: 'print' | 'download_pdf'; success: boolean }> {
  // Check if we can safely use window.print() in current window context
  let printSucceeded = false;

  try {
    // If inside an iframe without allow-modals, window.print() throws or fails
    const isIframe = window.self !== window.top;

    if (!isIframe) {
      // Direct window print can work if media print styles are applied
      window.print();
      return { method: 'print', success: true };
    }

    // Inside iframe: try hidden iframe printing first
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${options.title || 'Ficha Técnica'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: letter; margin: 10mm; }
            body { font-family: ui-sans-serif, system-ui, sans-serif; background: #fff; color: #000; padding: 10px; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
        </html>
      `);
      frameDoc.close();

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (printFrame.contentWindow) {
        try {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
          printSucceeded = true;
        } catch (iframeErr) {
          console.warn('Iframe print blocked by sandbox policies:', iframeErr);
          printSucceeded = false;
        }
      }
    }

    // Clean up
    setTimeout(() => {
      if (document.body.contains(printFrame)) {
        document.body.removeChild(printFrame);
      }
    }, 2000);

    if (printSucceeded) {
      return { method: 'print', success: true };
    }
  } catch (err) {
    console.warn('Direct print failed, falling back to PDF generation:', err);
  }

  // If print was blocked or failed, generate high-quality PDF directly
  const pdfSuccess = await generatePdfFromElement(element, options);
  return { method: 'download_pdf', success: pdfSuccess };
}

/**
 * Fallback to download self-contained HTML that can be printed from any browser.
 */
function downloadHtmlFallback(element: HTMLElement, fileName: string, title?: string) {
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${title || 'Ficha Técnica'}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @page { size: letter; margin: 10mm; }
        body { font-family: ui-sans-serif, system-ui, sans-serif; color: #0f172a; background: #ffffff; padding: 12px; }
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
    </html>
  `;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
