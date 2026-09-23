import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  filename?: string;
  projectTitle?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'letter' | 'a4';
  companyName?: string;
  currency?: string;
  fitToSinglePage?: boolean;
}

/**
 * Exports an HTML element (or element ID) to a polished, professional PDF document.
 */
export async function exportElementToPdf(
  target: HTMLElement | string,
  options: PdfExportOptions
): Promise<boolean> {
  try {
    const element = typeof target === 'string' ? document.getElementById(target) : target;
    if (!element) {
      console.error(`PDF export failed: element not found (${target})`);
      return false;
    }

    const targetIdStr = typeof target === 'string' ? target : (element.id || '');
    const isMultiPageDocument = targetIdStr === 'notes-defense-pdf-root';

    // Default format to 'a4' as requested
    const format = options.format || 'a4';

    // fitToSinglePage is true for all individual statements, ratios, schedules, and assumptions
    const fitToSinglePage = options.fitToSinglePage !== undefined
      ? options.fitToSinglePage
      : !isMultiPageDocument;

    // Determine orientation: landscape for all single page tables / statements / schedules / ratios
    const naturalWidth = element.scrollWidth;
    const defaultOrientation = (fitToSinglePage || naturalWidth > 750) ? 'landscape' : 'portrait';
    const orientation = options.orientation || defaultOrientation;
    const isLandscape = orientation === 'landscape';

    // Page dimensions in mm
    let pageWidth: number;
    let pageHeight: number;

    if (format === 'a4') {
      pageWidth = isLandscape ? 297 : 210;
      pageHeight = isLandscape ? 210 : 297;
    } else {
      pageWidth = isLandscape ? 279.4 : 215.9;
      pageHeight = isLandscape ? 215.9 : 279.4;
    }

    // Tighter, cleaner margins for single page A4 landscape
    const marginX = fitToSinglePage ? 10 : 12; // 10mm horizontal margin
    const marginTop = fitToSinglePage ? 14 : 20; // top margin for header
    const marginBottom = fitToSinglePage ? 9 : 14; // bottom margin for footer
    const contentWidthMm = pageWidth - marginX * 2;
    const contentHeightMm = pageHeight - marginTop - marginBottom;

    // Clone element into an off-screen sandbox container with max-content width
    // to ensure no horizontal scroll clipping occurs regardless of screen size
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove or hide interactive and non-printable elements in the clone
    const elementsToHide = clone.querySelectorAll(
      '.no-print, .pdf-exclude, button:not(.pdf-keep), input[type="file"]'
    );
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    // Replace input/select elements with clean plain text in the clone so values render sharply
    const originalInputs = element.querySelectorAll('input, select, textarea');
    const clonedInputs = clone.querySelectorAll('input, select, textarea');
    originalInputs.forEach((orig, idx) => {
      const cloned = clonedInputs[idx];
      if (cloned) {
        const val = (orig as HTMLInputElement).value || '';
        const span = document.createElement('span');
        span.textContent = val;
        span.className = cloned.className;
        span.style.cssText = (cloned as HTMLElement).style.cssText;
        cloned.parentNode?.replaceChild(span, cloned);
      }
    });

    // Sandbox container
    const sandbox = document.createElement('div');
    sandbox.style.position = 'fixed';
    sandbox.style.left = '-99999px';
    sandbox.style.top = '0';
    sandbox.style.backgroundColor = '#ffffff';
    sandbox.style.boxSizing = 'border-box';
    sandbox.style.zIndex = '-9999';

    if (fitToSinglePage) {
      // In single-page A4 landscape mode:
      // We apply adjusted font sizes and compact spacing so content fits on 1 A4 landscape page!
      sandbox.style.width = '1060px';
      sandbox.style.minWidth = '1060px';
      sandbox.style.maxWidth = '1060px';
      sandbox.style.padding = '8px 12px';

      const compactStyle = document.createElement('style');
      compactStyle.textContent = `
        .pdf-single-page-export {
          width: 1060px !important;
          max-width: 1060px !important;
          box-sizing: border-box !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          background: #ffffff !important;
          color: #0f172a !important;
        }
        .pdf-single-page-export * {
          box-sizing: border-box !important;
        }
        /* Titles & Header block */
        .pdf-single-page-export h1,
        .pdf-single-page-export h2 {
          font-size: 13px !important;
          line-height: 1.2 !important;
          margin-top: 1px !important;
          margin-bottom: 2px !important;
        }
        .pdf-single-page-export h3 {
          font-size: 11.5px !important;
          line-height: 1.2 !important;
          margin-top: 1px !important;
          margin-bottom: 2px !important;
        }
        .pdf-single-page-export h4 {
          font-size: 10px !important;
          line-height: 1.2 !important;
          margin-top: 1px !important;
          margin-bottom: 1px !important;
        }
        .pdf-single-page-export p,
        .pdf-single-page-export span,
        .pdf-single-page-export label {
          font-size: 8.5px !important;
          line-height: 1.15 !important;
        }
        /* Tables & Cell padding */
        .pdf-single-page-export table {
          width: 100% !important;
          border-collapse: collapse !important;
          table-layout: auto !important;
          margin-top: 2px !important;
          margin-bottom: 2px !important;
        }
        .pdf-single-page-export th {
          font-size: 8.5px !important;
          padding: 2.5px 3.5px !important;
          line-height: 1.15 !important;
        }
        .pdf-single-page-export td {
          font-size: 8px !important;
          padding: 1.5px 3.5px !important;
          line-height: 1.15 !important;
        }
        /* Spacing & margins */
        .pdf-single-page-export .mb-4,
        .pdf-single-page-export .mb-5,
        .pdf-single-page-export .mb-6,
        .pdf-single-page-export .mb-8,
        .pdf-single-page-export .my-4,
        .pdf-single-page-export .my-6 {
          margin-top: 2px !important;
          margin-bottom: 2px !important;
        }
        .pdf-single-page-export .mt-4,
        .pdf-single-page-export .mt-5,
        .pdf-single-page-export .mt-6,
        .pdf-single-page-export .mt-8 {
          margin-top: 2px !important;
        }
        .pdf-single-page-export .p-4,
        .pdf-single-page-export .p-5,
        .pdf-single-page-export .p-6 {
          padding: 3px 5px !important;
        }
        .pdf-single-page-export .py-3,
        .pdf-single-page-export .py-2.5,
        .pdf-single-page-export .py-2,
        .pdf-single-page-export .py-1.5 {
          padding-top: 1.5px !important;
          padding-bottom: 1.5px !important;
        }
        .pdf-single-page-export .space-y-4 > :not([hidden]) ~ :not([hidden]),
        .pdf-single-page-export .space-y-5 > :not([hidden]) ~ :not([hidden]),
        .pdf-single-page-export .space-y-6 > :not([hidden]) ~ :not([hidden]),
        .pdf-single-page-export .space-y-8 > :not([hidden]) ~ :not([hidden]),
        .pdf-single-page-export .space-y-10 > :not([hidden]) ~ :not([hidden]) {
          margin-top: 3px !important;
        }
        .pdf-single-page-export .gap-4,
        .pdf-single-page-export .gap-6,
        .pdf-single-page-export .gap-8 {
          gap: 3px !important;
        }
        .pdf-single-page-export .gap-3 {
          gap: 2px !important;
        }
        .pdf-single-page-export .rounded-2xl,
        .pdf-single-page-export .rounded-xl {
          border-radius: 4px !important;
        }
        .pdf-single-page-export .overflow-x-auto {
          overflow: visible !important;
        }
        .pdf-single-page-export svg {
          max-width: 14px !important;
          max-height: 14px !important;
        }
      `;
      sandbox.appendChild(compactStyle);
      clone.classList.add('pdf-single-page-export');
    } else {
      sandbox.style.width = 'max-content';
      sandbox.style.minWidth = format === 'a4' ? '1000px' : '950px';
      sandbox.style.maxWidth = '1400px';
      sandbox.style.padding = '16px';
    }

    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    let canvas: HTMLCanvasElement;
    let rawBreakPositionsPx: number[] = [];
    interface ExtractedTextItem {
      text: string;
      leftPx: number;
      topPx: number;
      widthPx: number;
      heightPx: number;
      fontSizePt: number;
      isBold: boolean;
    }
    const extractedTextItems: ExtractedTextItem[] = [];
    let cloneWidth = 1;
    let cloneHeight = 1;

    try {
      // Capture element child boundaries to find natural break points
      const cloneRect = clone.getBoundingClientRect();
      cloneWidth = cloneRect.width || 1;
      cloneHeight = cloneRect.height || 1;
      const breakCandidates: number[] = [];

      // Look for notes, cards, sections, headers, paragraphs, and table rows
      const targetSelectors =
        'div[id^="note-"], section, .pdf-section, tr, h1, h2, h3, h4, p, table, ul, ol, .border-t, div[class*="rounded"]';
      const blockEls = clone.querySelectorAll<HTMLElement>(targetSelectors);

      blockEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        const topRel = r.top - cloneRect.top;
        if (topRel > 15 && topRel < cloneRect.height - 15) {
          breakCandidates.push(topRel);
        }
      });

      // Walk all text nodes inside clone to extract text and bounding boxes for highlightable copy-paste in PDF
      try {
        const walker = document.createTreeWalker(
          clone,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              if (!node.textContent || !node.textContent.trim()) {
                return NodeFilter.FILTER_REJECT;
              }
              const p = node.parentElement;
              if (!p) return NodeFilter.FILTER_REJECT;
              if (p.closest('.no-print, .pdf-exclude, button:not(.pdf-keep), script, style')) {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            },
          }
        );

        let textNode: Node | null;
        while ((textNode = walker.nextNode())) {
          const rawText = textNode.textContent || '';
          const cleanText = rawText.replace(/[\r\n\t]+/g, ' ');
          if (!cleanText.trim()) continue;

          const parent = textNode.parentElement;
          if (!parent) continue;

          const style = window.getComputedStyle(parent);
          const isBold =
            style.fontWeight === 'bold' ||
            style.fontWeight === '700' ||
            style.fontWeight === '600' ||
            style.fontWeight === '800' ||
            parseInt(style.fontWeight, 10) >= 600;

          const fontSizePx = parseFloat(style.fontSize) || 12;
          const fontSizePt = (fontSizePx * 72) / 96;

          const range = document.createRange();
          range.selectNodeContents(textNode);
          const rects = range.getClientRects();

          if (rects && rects.length > 0) {
            if (rects.length === 1) {
              const r = rects[0];
              if (r.width > 0 && r.height > 0) {
                extractedTextItems.push({
                  text: cleanText.trim(),
                  leftPx: r.left - cloneRect.left,
                  topPx: r.top - cloneRect.top,
                  widthPx: r.width,
                  heightPx: r.height,
                  fontSizePt,
                  isBold,
                });
              }
            } else {
              // Multi-line text block: split into words to retain precise line/word coordinates
              const words = cleanText.split(/(\s+)/);
              let charOffset = 0;
              for (let w = 0; w < words.length; w++) {
                const word = words[w];
                const wordLen = word.length;
                if (word.trim()) {
                  try {
                    const wordRange = document.createRange();
                    wordRange.setStart(textNode, charOffset);
                    wordRange.setEnd(textNode, charOffset + wordLen);
                    const wRect = wordRange.getBoundingClientRect();
                    if (wRect.width > 0 && wRect.height > 0) {
                      extractedTextItems.push({
                        text: word.trim(),
                        leftPx: wRect.left - cloneRect.left,
                        topPx: wRect.top - cloneRect.top,
                        widthPx: wRect.width,
                        heightPx: wRect.height,
                        fontSizePt,
                        isBold,
                      });
                    }
                  } catch {
                    // ignore range offset error
                  }
                }
                charOffset += wordLen;
              }
            }
          }
        }
      } catch (textExtractErr) {
        console.warn('Text extraction for highlightable PDF skipped:', textExtractErr);
      }

      // Capture using html2canvas-pro with full oklch/color support
      canvas = await html2canvas(clone, {
        scale: 2, // 2x DPI for crisp high-res text and numbers
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: Math.max(sandbox.scrollWidth, 1200),
        ignoreElements: (el) =>
          el.classList.contains('no-print') || el.classList.contains('pdf-exclude'),
      });

      // Translate relative tops to canvas pixel coordinates
      const scaleY = canvas.height / (cloneRect.height || 1);
      rawBreakPositionsPx = Array.from(new Set(breakCandidates.map((y) => Math.round(y * scaleY)))).sort(
        (a, b) => a - b
      );
    } finally {
      // Clean up sandbox
      if (sandbox.parentNode) {
        sandbox.parentNode.removeChild(sandbox);
      }
    }

    // Initialize jsPDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress: true,
    });

    const totalCanvasWidth = canvas.width;
    const totalCanvasHeight = canvas.height;

    // Maximum height in canvas pixels that can physically fit on one page
    const maxSliceCanvasHeightPx = Math.floor((contentHeightMm / contentWidthMm) * totalCanvasWidth);

    // Page slicing logic:
    // If fitToSinglePage is enabled, strictly 1 page slice
    // Otherwise, perform smart non-cutting page slicing
    const pageSlices: { startY: number; heightPx: number }[] = [];

    if (fitToSinglePage) {
      pageSlices.push({ startY: 0, heightPx: totalCanvasHeight });
    } else {
      let currentY = 0;

      // Helper to check if a row in canvas is mostly whitespace/blank
      const isRowBlank = (ctx: CanvasRenderingContext2D, y: number, width: number): boolean => {
        try {
          const sampleStep = 24;
          const rowData = ctx.getImageData(Math.floor(width * 0.05), y, Math.floor(width * 0.9), 1).data;
          for (let i = 0; i < rowData.length; i += 4 * sampleStep) {
            const r = rowData[i];
            const g = rowData[i + 1];
            const b = rowData[i + 2];
            // If pixel is darker than off-white, row is not blank
            if (r < 240 || g < 240 || b < 240) {
              return false;
            }
          }
          return true;
        } catch {
          return false;
        }
      };

      const canvasCtx = canvas.getContext('2d', { willReadFrequently: true });

      while (currentY < totalCanvasHeight) {
        const remainingHeight = totalCanvasHeight - currentY;
        if (remainingHeight <= maxSliceCanvasHeightPx) {
          // Fits entirely on this page
          pageSlices.push({ startY: currentY, heightPx: remainingHeight });
          break;
        }

        // We need to find a break point before currentY + maxSliceCanvasHeightPx
        const maxAllowedEnd = currentY + maxSliceCanvasHeightPx;
        const minAllowedEnd = currentY + Math.floor(maxSliceCanvasHeightPx * 0.62);

        // Find candidates within [minAllowedEnd, maxAllowedEnd]
        const candidatesInRange = rawBreakPositionsPx.filter(
          (pos) => pos >= minAllowedEnd && pos <= maxAllowedEnd
        );

        let chosenEnd = maxAllowedEnd;
        let foundCleanBreak = false;

        // Try candidate DOM element tops in reverse order (largest to smallest to maximize page use)
        for (let i = candidatesInRange.length - 1; i >= 0; i--) {
          const cand = candidatesInRange[i];

          // Check if there is blank row around cand (within 15px above)
          if (canvasCtx) {
            for (let dy = 0; dy <= 20; dy++) {
              const testY = cand - dy;
              if (testY >= minAllowedEnd && isRowBlank(canvasCtx, testY, totalCanvasWidth)) {
                chosenEnd = testY;
                foundCleanBreak = true;
                break;
              }
            }
          }

          if (foundCleanBreak) break;

          // Even without an exact blank row, breaking right at the element top avoids cutting through it
          if (!foundCleanBreak) {
            chosenEnd = cand;
            foundCleanBreak = true;
            break;
          }
        }

        // If no candidate was found in range, scan canvas rows for any blank row
        if (!foundCleanBreak && canvasCtx) {
          for (let scanY = maxAllowedEnd; scanY >= minAllowedEnd; scanY -= 4) {
            if (isRowBlank(canvasCtx, scanY, totalCanvasWidth)) {
              chosenEnd = scanY;
              foundCleanBreak = true;
              break;
            }
          }
        }

        const sliceHeightPx = Math.max(100, chosenEnd - currentY);
        pageSlices.push({ startY: currentY, heightPx: sliceHeightPx });
        currentY += sliceHeightPx;
      }
    }

    const totalPages = pageSlices.length || 1;

    const safeProjectTitle = options.projectTitle || 'Feasibility Study';
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage(format, orientation);
      }

      if (fitToSinglePage) {
        // Compact single-page A4 landscape header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.setTextColor(30, 41, 59); // Slate 800
        pdf.text(safeProjectTitle, marginX, 7);

        if (options.companyName) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          pdf.setTextColor(100, 116, 139);
          pdf.text(options.companyName, marginX, 10.5);
        }

        // Title & Subtitle right-aligned
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.setTextColor(15, 23, 42); // Slate 900
        const titleWidth = pdf.getTextWidth(options.title);
        pdf.text(options.title, pageWidth - marginX - titleWidth, 7);

        if (options.subtitle) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          pdf.setTextColor(100, 116, 139);
          const subWidth = pdf.getTextWidth(options.subtitle);
          pdf.text(options.subtitle, pageWidth - marginX - subWidth, 10.5);
        }

        // Header divider line
        pdf.setDrawColor(226, 232, 240); // Slate 200
        pdf.setLineWidth(0.3);
        pdf.line(marginX, 12, pageWidth - marginX, 12);

        // Image & Text calculation with 1-page scaling safeguard
        const naturalHeightMm = (totalCanvasHeight / totalCanvasWidth) * contentWidthMm;
        let finalWidthMm = contentWidthMm;
        let finalHeightMm = naturalHeightMm;
        let finalMarginX = marginX;
        let finalMarginTop = marginTop;

        if (naturalHeightMm > contentHeightMm) {
          // Proportionally scale to strictly fit the 1 single page!
          const scale = contentHeightMm / naturalHeightMm;
          finalWidthMm = contentWidthMm * scale;
          finalHeightMm = contentHeightMm;
          finalMarginX = marginX + (contentWidthMm - finalWidthMm) / 2;
        }

        const pageImgData = canvas.toDataURL('image/png', 0.95);
        pdf.addImage(
          pageImgData,
          'PNG',
          finalMarginX,
          finalMarginTop,
          finalWidthMm,
          finalHeightMm,
          undefined,
          'FAST'
        );

        // Render invisible text overlay with accurate proportional coordinates
        for (const item of extractedTextItems) {
          const itemTopCanvas = (item.topPx / cloneHeight) * totalCanvasHeight;
          const itemHeightCanvas = (item.heightPx / cloneHeight) * totalCanvasHeight;
          const itemLeftCanvas = (item.leftPx / cloneWidth) * totalCanvasWidth;

          const xMm = finalMarginX + (itemLeftCanvas / totalCanvasWidth) * finalWidthMm;
          const yMm = finalMarginTop + (itemTopCanvas / totalCanvasHeight) * finalHeightMm;
          const hMm = (itemHeightCanvas / totalCanvasHeight) * finalHeightMm;
          const baselineYMm = yMm + hMm * 0.78;

          if (
            xMm >= finalMarginX - 1 &&
            xMm < pageWidth - marginX + 1 &&
            baselineYMm >= finalMarginTop &&
            baselineYMm <= pageHeight - marginBottom
          ) {
            const fontPt = Math.max(3.5, Math.min(22, (hMm / 25.4) * 72 * 0.82));
            try {
              pdf.setFont('helvetica', item.isBold ? 'bold' : 'normal');
              pdf.setFontSize(fontPt);
              pdf.text(item.text, xMm, baselineYMm, { renderingMode: 'invisible' });
            } catch {
              // Ignore any unencodable character safely
            }
          }
        }
      } else {
        // Multi-page header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(30, 41, 59); // Slate 800
        pdf.text(safeProjectTitle, marginX, 10);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 116, 139); // Slate 500
        if (options.companyName) {
          pdf.text(options.companyName, marginX, 14);
        }

        // Title & Subtitle
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(15, 23, 42); // Slate 900
        const titleText = options.title;
        const titleWidth = pdf.getTextWidth(titleText);
        pdf.text(titleText, pageWidth - marginX - titleWidth, 10);

        if (options.subtitle) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          const subWidth = pdf.getTextWidth(options.subtitle);
          pdf.text(options.subtitle, pageWidth - marginX - subWidth, 14);
        }

        // Header divider line
        pdf.setDrawColor(226, 232, 240); // Slate 200
        pdf.setLineWidth(0.4);
        pdf.line(marginX, 17, pageWidth - marginX, 17);

        // Create slice of canvas for current page
        const { startY: sliceYPx, heightPx: actualSliceHeightPx } = pageSlices[page];

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = totalCanvasWidth;
        pageCanvas.height = actualSliceHeightPx;
        const ctx = pageCanvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            sliceYPx,
            totalCanvasWidth,
            actualSliceHeightPx,
            0,
            0,
            totalCanvasWidth,
            actualSliceHeightPx
          );

          const pageImgData = pageCanvas.toDataURL('image/png', 0.95);
          const pageImgHeightMm = (actualSliceHeightPx / totalCanvasWidth) * contentWidthMm;

          pdf.addImage(
            pageImgData,
            'PNG',
            marginX,
            marginTop,
            contentWidthMm,
            pageImgHeightMm,
            undefined,
            'FAST'
          );

          // Embed invisible text overlay on this page slice so text is 100% highlightable, selectable, and copy-pastable
          for (const item of extractedTextItems) {
            const itemTopCanvas = (item.topPx / cloneHeight) * totalCanvasHeight;
            const itemHeightCanvas = (item.heightPx / cloneHeight) * totalCanvasHeight;
            const itemBottomCanvas = itemTopCanvas + itemHeightCanvas;

            // Check if item falls on this page slice
            if (itemBottomCanvas >= sliceYPx && itemTopCanvas < sliceYPx + actualSliceHeightPx) {
              const itemLeftCanvas = (item.leftPx / cloneWidth) * totalCanvasWidth;
              const xMm = marginX + (itemLeftCanvas / totalCanvasWidth) * contentWidthMm;
              const yMm = marginTop + ((itemTopCanvas - sliceYPx) / totalCanvasWidth) * contentWidthMm;
              const hMm = (itemHeightCanvas / totalCanvasWidth) * contentWidthMm;
              const baselineYMm = yMm + hMm * 0.78;

              if (
                xMm >= marginX - 1 &&
                xMm < pageWidth - marginX + 1 &&
                baselineYMm >= marginTop &&
                baselineYMm <= pageHeight - marginBottom
              ) {
                const fontPt = Math.max(5, Math.min(24, (hMm / 25.4) * 72 * 0.82));
                try {
                  pdf.setFont('helvetica', item.isBold ? 'bold' : 'normal');
                  pdf.setFontSize(fontPt);
                  pdf.text(item.text, xMm, baselineYMm, { renderingMode: 'invisible' });
                } catch {
                  // Ignore any unencodable character safely
                }
              }
            }
          }
        }
      }

      // Footer divider line
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.3);
      pdf.line(
        marginX,
        pageHeight - (fitToSinglePage ? 7 : 9),
        pageWidth - marginX,
        pageHeight - (fitToSinglePage ? 7 : 9)
      );

      // Draw footer
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184); // Slate 400
      pdf.text(
        `Generated on ${currentDate} • NoBSFeasibility`,
        marginX,
        pageHeight - (fitToSinglePage ? 3.5 : 5)
      );

      const pageNumText = fitToSinglePage
        ? 'Page 1 of 1'
        : `Page ${page + 1} of ${totalPages}`;
      const pageNumWidth = pdf.getTextWidth(pageNumText);
      pdf.text(
        pageNumText,
        pageWidth - marginX - pageNumWidth,
        pageHeight - (fitToSinglePage ? 3.5 : 5)
      );
    }

    // Save the PDF
    const safeFilename =
      options.filename ||
      `${options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`;
    pdf.save(safeFilename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return false;
  }
}
