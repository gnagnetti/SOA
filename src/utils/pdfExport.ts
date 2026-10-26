import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CollectionReportData, ColorVariant } from '../types/fashion';

/**
 * Generates and downloads a luxury PDF report for Luisa Spagnoli Sell out Analisys:
 * - Header: "Luisa Spagnoli Sell out Analisys"
 * - Background & Colors: Warm Crema, Beige, Oro, and Marrone
 * - Color variants ordered strictly from highest to lowest Sell-Out %
 * - Zero comments / subjective text
 */
export async function downloadCollectionReportPDF(reportData: CollectionReportData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Luisa Spagnoli Warm Luxury Palette
  const marroneDeep: [number, number, number] = [45, 31, 23];        // #2D1F17 deep espresso
  const marroneMid: [number, number, number] = [61, 41, 31];         // #3D291F warm chocolate
  const oroCaldo: [number, number, number] = [197, 160, 89];         // #C5A059 luxury warm gold
  const beigeBorder: [number, number, number] = [229, 218, 200];     // #E5DAC8 warm neutral beige
  const cremaBg: [number, number, number] = [249, 246, 240];         // #F9F6F0 warm crema
  const cremaAltRow: [number, number, number] = [255, 255, 255];     // pure ivory
  const textMuted: [number, number, number] = [122, 100, 85];        // #7A6455 warm taupe
  const oliveGreen: [number, number, number] = [36, 78, 43];         // #244E2B warm olive green for best sellers
  const terracottaRed: [number, number, number] = [142, 59, 43];     // #8E3B2B warm terracotta for flops

  // Helper for Top Banner
  const addDocumentHeader = (title: string, subtitle?: string) => {
    // Fill background with warm crema
    doc.setFillColor(...cremaBg);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Top banner in deep luxury marrone
    doc.setFillColor(...marroneDeep);
    doc.rect(0, 0, pageWidth, 24, 'F');

    // Gold decorative accent line
    doc.setFillColor(...oroCaldo);
    doc.rect(0, 23, pageWidth, 1, 'F');

    // Title: Luisa Spagnoli
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('LUISA SPAGNOLI', 14, 11);

    // Subtitle: Sell out Analisys
    doc.setTextColor(...oroCaldo);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('SELL OUT ANALISYS — REPORT VARIANTI COLORE', 14, 18);

    // Date & File
    doc.setTextColor(230, 220, 210);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Data: ${reportData.importedAt}`, pageWidth - 14, 11, { align: 'right' });
    doc.text(`File: ${reportData.fileName.slice(0, 32)}`, pageWidth - 14, 18, { align: 'right' });

    let currentY = 33;
    if (title) {
      doc.setTextColor(...marroneDeep);
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text(title, 14, currentY);
      currentY += 5;
    }
    if (subtitle) {
      doc.setTextColor(...textMuted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(subtitle, 14, currentY);
      currentY += 6;
    }
    return currentY;
  };

  // --- PAGE 1: RIEPILOGO QUANTITATIVO (ZERO COMMENTI) ---
  let y = addDocumentHeader(
    'Riepilogo Quantitativo di Collezione',
    `Dati aggregati di vendita: ${reportData.grandTotalProduced.toLocaleString('it-IT')} unità inserite, ${reportData.grandTotalSold.toLocaleString('it-IT')} vendute, Sell-Out medio ${reportData.grandTotalSellOut}%`
  );

  const globalSummaryData = [
    ['Unità Totali Inserite / Prodotte (Приход)', `${reportData.grandTotalProduced.toLocaleString('it-IT')} pz`],
    ['Unità Totali Vendute (Расход)', `${reportData.grandTotalSold.toLocaleString('it-IT')} pz`],
    ['Sell-Out Medio Globale %', `${reportData.grandTotalSellOut}%`],
    ['Totale Modelli a Catalogo', `${reportData.modelsCount} stili`],
    ['Totale Varianti Colore (SKU) Analizzate', `${reportData.allVariants.length} varianti`],
    ['Varianti Colore con Sell-Out >= 50% (Best Seller)', `${reportData.allVariants.filter((v) => v.sellOutPercent >= 50).length} varianti`],
    ['Varianti Colore con Sell-Out < 25% (Flop)', `${reportData.allVariants.filter((v) => v.sellOutPercent < 25).length} varianti`],
  ];

  autoTable(doc, {
    startY: y + 2,
    head: [['Metrica di Collezione', 'Dato Rilevato']],
    body: globalSummaryData,
    theme: 'grid',
    headStyles: {
      fillColor: marroneDeep,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: marroneDeep,
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [250, 247, 242],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 105 },
      1: { cellWidth: 77, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Category Breakdown Table
  doc.setTextColor(...marroneDeep);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('Performance Quantitative per Categoria Merceologica', 14, y);
  y += 4;

  const categoryTableData = reportData.categories.map((c, i) => {
    const catVariants = reportData.allVariants.filter((v) => v.category === c.category);
    const bestVariants = catVariants.filter((v) => v.sellOutPercent >= 50).length;
    return [
      `0${i + 1}. ${c.displayName}`,
      `${c.totalStyles}`,
      `${catVariants.length}`,
      `${c.totalProduced}`,
      `${c.totalSold}`,
      `${c.sellOutPercent}%`,
      `${bestVariants} / ${catVariants.length}`,
      c.sellOutPercent >= 50 ? '>= 50%' : c.sellOutPercent >= 25 ? '25 - 50%' : '< 25%',
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Categoria', 'Modelli', 'Varianti', 'Inserite', 'Vendute', 'Sell-Out %', 'Best Colori (>=50%)', 'Fascia']],
    body: categoryTableData,
    theme: 'grid',
    headStyles: {
      fillColor: marroneMid,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: marroneDeep,
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [250, 247, 242],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 46 },
      1: { halign: 'center', cellWidth: 16 },
      2: { halign: 'center', cellWidth: 16 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'center', cellWidth: 18 },
      5: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 26 },
      7: { halign: 'center', fontStyle: 'bold', cellWidth: 22 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const val = parseFloat(data.cell.raw as string);
        if (val >= 50) {
          data.cell.styles.textColor = oliveGreen;
        } else if (val < 25) {
          data.cell.styles.textColor = terracottaRed;
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // --- SUBSEQUENT SECTIONS: COLOR VARIANTS TABLES BY CATEGORY SORTED BY SELL-OUT % DESCENDING ---
  for (const cat of reportData.categories) {
    const catVariants: ColorVariant[] = reportData.allVariants
      .filter((v) => v.category === cat.category)
      .sort((a, b) => b.sellOutPercent - a.sellOutPercent || b.unitsSold - a.unitsSold);

    if (catVariants.length === 0) continue;

    doc.addPage();
    let catY = addDocumentHeader(
      `Categoria: ${cat.displayName.toUpperCase()}`,
      `Varianti Colore ordinate dal Sell-Out % più alto al più basso (${catVariants.length} varianti · ${cat.totalSold}/${cat.totalProduced} pz venduti)`
    );

    const variantRows = catVariants.map((v, index) => {
      const statusLabel =
        v.sellOutPercent >= 50
          ? 'BEST SELLER (>=50%)'
          : v.sellOutPercent >= 25
          ? 'STANDARD (25-50%)'
          : v.sellOutPercent > 0
          ? 'FLOP (<25%)'
          : 'ZERO VENDITE (0%)';

      return [
        `#${index + 1}`,
        v.modelName,
        v.colorCode || '-',
        v.silhouette,
        v.linesheet.replace('Fw 2026 - ', ''),
        `${v.unitsProduced}`,
        `${v.unitsSold}`,
        `${v.sellOutPercent.toFixed(1)}%`,
        statusLabel,
      ];
    });

    autoTable(doc, {
      startY: catY,
      head: [
        ['#', 'Modello', 'Cod. Colore', 'Silhouette', 'Linesheet', 'Inserite', 'Vendute', 'Sell-Out %', 'Status'],
      ],
      body: variantRows,
      theme: 'grid',
      headStyles: {
        fillColor: marroneDeep,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7,
        textColor: marroneDeep,
        fillColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [250, 247, 242],
      },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', cellWidth: 10 },
        1: { fontStyle: 'bold', cellWidth: 32 },
        2: { halign: 'center', fontStyle: 'bold', cellWidth: 24 },
        3: { cellWidth: 26 },
        4: { cellWidth: 24 },
        5: { halign: 'center', cellWidth: 14 },
        6: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
        7: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
        8: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.column.index === 7) {
            const val = parseFloat(data.cell.raw as string);
            if (val >= 50) {
              data.cell.styles.textColor = oliveGreen;
              data.cell.styles.fontStyle = 'bold';
            } else if (val < 25) {
              data.cell.styles.textColor = terracottaRed;
            }
          }
          if (data.column.index === 8) {
            const raw = data.cell.raw as string;
            if (raw.includes('BEST SELLER')) {
              data.cell.styles.textColor = oliveGreen;
            } else if (raw.includes('FLOP') || raw.includes('ZERO')) {
              data.cell.styles.textColor = terracottaRed;
            } else {
              data.cell.styles.textColor = textMuted;
            }
          }
        }
      },
      margin: { left: 14, right: 14 },
    });
  }

  // --- FINAL SECTION: GRADUATORIA GENERALE TUTTE LE VARIANTI ---
  const allCollectionVariantsSorted: ColorVariant[] = [...reportData.allVariants].sort(
    (a, b) => b.sellOutPercent - a.sellOutPercent || b.unitsSold - a.unitsSold
  );

  doc.addPage();
  let globalY = addDocumentHeader(
    'Graduatoria Generale: Tutte le Varianti Colore della Collezione',
    `Elenco integrale di tutte le ${allCollectionVariantsSorted.length} varianti colore della collezione, ordinate rigorosamente per Sell-Out % decrescente`
  );

  const allVariantRows = allCollectionVariantsSorted.map((v, index) => {
    const statusLabel =
      v.sellOutPercent >= 50
        ? 'BEST SELLER (>=50%)'
        : v.sellOutPercent >= 25
        ? 'STANDARD'
        : v.sellOutPercent > 0
        ? 'FLOP'
        : 'ZERO VENDITE';

    return [
      `#${index + 1}`,
      v.modelName,
      v.colorCode || '-',
      v.category,
      v.silhouette,
      `${v.unitsProduced}`,
      `${v.unitsSold}`,
      `${v.sellOutPercent.toFixed(1)}%`,
      statusLabel,
    ];
  });

  autoTable(doc, {
    startY: globalY,
    head: [['#', 'Modello', 'Cod. Colore', 'Categoria', 'Silhouette', 'Inserite', 'Vendute', 'Sell-Out %', 'Status']],
    body: allVariantRows,
    theme: 'grid',
    headStyles: {
      fillColor: marroneDeep,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: marroneDeep,
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [250, 247, 242],
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 32 },
      2: { halign: 'center', fontStyle: 'bold', cellWidth: 22 },
      3: { cellWidth: 30 },
      4: { cellWidth: 24 },
      5: { halign: 'center', cellWidth: 14 },
      6: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
      7: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
      8: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.column.index === 7) {
          const val = parseFloat(data.cell.raw as string);
          if (val >= 50) {
            data.cell.styles.textColor = oliveGreen;
            data.cell.styles.fontStyle = 'bold';
          } else if (val < 25) {
            data.cell.styles.textColor = terracottaRed;
          }
        }
        if (data.column.index === 8) {
          const raw = data.cell.raw as string;
          if (raw.includes('BEST SELLER')) {
            data.cell.styles.textColor = oliveGreen;
          } else if (raw.includes('FLOP') || raw.includes('ZERO')) {
            data.cell.styles.textColor = terracottaRed;
          } else {
            data.cell.styles.textColor = textMuted;
          }
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // Page Numbers Footer on each page
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(
      `Pagina ${i} di ${totalPages} — Luisa Spagnoli Sell out Analisys // Graduatoria Varianti Colore per Sell-Out %`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Luisa_Spagnoli_Sell_out_Analisys_${dateStr}.pdf`);
}

/**
 * Extracts and cleans "Pre o Main" from the linesheet text
 */
export function extractPreOrMain(linesheet: string): string {
  if (!linesheet) return 'Main Collection';
  const clean = linesheet.replace(/Fw\s*\d+\s*[-–]\s*/i, '').trim();
  const lower = clean.toLowerCase();
  if (lower.includes('pre')) return 'Pre Collection';
  if (lower.includes('main')) return 'Main Collection';
  if (lower.includes('sfilata')) return 'Sfilata';
  if (lower.includes('carryover')) return 'Carryover';
  return clean || 'Main Collection';
}

/**
 * Loads an image from URL into Base64 for jsPDF
 */
async function loadBase64Image(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:image')) return url;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 80;
        canvas.height = img.naturalHeight || 100;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    // timeout after 1.5 seconds per image to avoid slowing generation
    setTimeout(() => resolve(null), 1500);
    img.src = url;
  });
}

/**
 * Draws a luxury fallback frame if image cannot be rendered
 */
function drawModelPlaceholder(
  doc: jsPDF,
  modelName: string,
  x: number,
  y: number,
  w: number,
  h: number
) {
  // background
  doc.setFillColor(242, 237, 228);
  doc.setDrawColor(213, 194, 176);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 1, 1, 'FD');

  // initials
  const initials = modelName.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'LS';
  doc.setTextColor(140, 104, 38);
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.text(initials, x + w / 2, y + h / 2 + 1, { align: 'center' });
}

/**
 * Generates and downloads a dedicated PDF for a single filtered category:
 * - Header: "Luisa Spagnoli Sell out Analisys"
 * - Background & Colors: Warm Crema, Beige, Oro, Marrone
 * - Columns: Foto del modello, Nome del modello, Pre o main, Percentuale di sell out
 * - Ordered strictly from highest to lowest Sell-Out % (dal più alto al più basso)
 * - ZERO COMMENTS / no subjective notes
 */
export async function downloadFilteredCategoryPDF(
  categorySummary: import('../types/fashion').CategorySummary
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Luisa Spagnoli Warm Luxury Palette
  const marroneDeep: [number, number, number] = [45, 31, 23];        // #2D1F17 deep espresso
  const oroCaldo: [number, number, number] = [197, 160, 89];         // #C5A059 luxury warm gold
  const cremaBg: [number, number, number] = [249, 246, 240];         // #F9F6F0 warm crema
  const textMuted: [number, number, number] = [122, 100, 85];        // #7A6455 warm taupe
  const oliveGreen: [number, number, number] = [36, 78, 43];         // #244E2B warm olive green for best sellers
  const terracottaRed: [number, number, number] = [142, 59, 43];     // #8E3B2B warm terracotta for flops

  // Sort models strictly from highest Sell-Out % to lowest
  const sortedModels = [...categorySummary.allModels].sort(
    (a, b) => b.sellOutPercent - a.sellOutPercent || b.totalSold - a.totalSold
  );

  // Preload model thumbnails in parallel
  const imageMap = new Map<string, string | null>();
  await Promise.all(
    sortedModels.map(async (m) => {
      if (m.imageUrl) {
        const base64 = await loadBase64Image(m.imageUrl);
        imageMap.set(m.modelName, base64);
      }
    })
  );

  // Helper for Top Banner
  const addCategoryHeader = (isFirstPage: boolean) => {
    // Fill background with warm crema
    doc.setFillColor(...cremaBg);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Top banner in deep luxury marrone
    doc.setFillColor(...marroneDeep);
    doc.rect(0, 0, pageWidth, 24, 'F');

    // Gold decorative accent line
    doc.setFillColor(...oroCaldo);
    doc.rect(0, 23, pageWidth, 1, 'F');

    // Title: Luisa Spagnoli
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('LUISA SPAGNOLI', 14, 11);

    // Subtitle: Luisa Spagnoli Sell out Analisys
    doc.setTextColor(...oroCaldo);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('LUISA SPAGNOLI SELL OUT ANALISYS', 14, 18);

    // Right details
    doc.setTextColor(230, 220, 210);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Categoria: ${categorySummary.displayName.split(' ')[0]}`, pageWidth - 14, 11, { align: 'right' });
    doc.text(`Sell-Out Medio: ${categorySummary.sellOutPercent}%`, pageWidth - 14, 18, { align: 'right' });

    let currentY = 32;
    if (isFirstPage) {
      doc.setTextColor(...marroneDeep);
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text(`CATEGORIA: ${categorySummary.displayName.toUpperCase()}`, 14, currentY);
      currentY += 5;

      doc.setTextColor(...textMuted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(
        `Graduatoria Modelli ordinati per Sell-Out % dal più alto al più basso · Totale Modelli: ${sortedModels.length} · Inserite: ${categorySummary.totalProduced} pz · Vendute: ${categorySummary.totalSold} pz`,
        14,
        currentY
      );
      currentY += 6;
    }
    return currentY;
  };

  const startY = addCategoryHeader(true);

  // Table rows with strictly:
  // 1. Foto del modello (Thumbnail)
  // 2. Nome del modello
  // 3. Pre o main
  // 4. Percentuale di sell out
  const tableData = sortedModels.map((m) => [
    '', // Image rendered in didDrawCell
    m.modelName,
    extractPreOrMain(m.linesheet),
    `${m.sellOutPercent.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: startY,
    head: [['Foto del Modello', 'Nome del Modello', 'Pre o Main', '% Sell-Out']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: marroneDeep,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: marroneDeep,
      fillColor: [255, 255, 255],
      minCellHeight: 22,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [250, 247, 242],
    },
    columnStyles: {
      0: { cellWidth: 24, halign: 'center' },
      1: { cellWidth: 80, fontStyle: 'bold' },
      2: { cellWidth: 44, halign: 'center' },
      3: { cellWidth: 34, halign: 'center', fontStyle: 'bold', fontSize: 9.5 },
    },
    didDrawPage: (data) => {
      // For pages after page 1, draw the header background
      if (data.pageNumber > 1) {
        // Redraw top banner
        doc.setFillColor(...cremaBg);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        doc.setFillColor(...marroneDeep);
        doc.rect(0, 0, pageWidth, 24, 'F');

        doc.setFillColor(...oroCaldo);
        doc.rect(0, 23, pageWidth, 1, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('LUISA SPAGNOLI', 14, 11);

        doc.setTextColor(...oroCaldo);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('LUISA SPAGNOLI SELL OUT ANALISYS', 14, 18);

        doc.setTextColor(230, 220, 210);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Categoria: ${categorySummary.displayName.split(' ')[0]}`, pageWidth - 14, 11, { align: 'right' });
        doc.text(`Pagina ${data.pageNumber}`, pageWidth - 14, 18, { align: 'right' });
      }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const model = sortedModels[data.row.index];
        if (model) {
          const imgBase64 = imageMap.get(model.modelName);
          const cell = data.cell;
          const imgW = 16;
          const imgH = 19;
          const x = cell.x + (cell.width - imgW) / 2;
          const y = cell.y + (cell.height - imgH) / 2;

          if (imgBase64) {
            try {
              doc.addImage(imgBase64, 'JPEG', x, y, imgW, imgH);
              // Border around thumbnail
              doc.setDrawColor(213, 194, 176);
              doc.setLineWidth(0.2);
              doc.rect(x, y, imgW, imgH);
            } catch {
              drawModelPlaceholder(doc, model.modelName, x, y, imgW, imgH);
            }
          } else {
            drawModelPlaceholder(doc, model.modelName, x, y, imgW, imgH);
          }
        }
      }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.column.index === 3) {
          const val = parseFloat(data.cell.raw as string);
          if (val >= 50) {
            data.cell.styles.textColor = oliveGreen;
            data.cell.styles.fontStyle = 'bold';
          } else if (val < 25) {
            data.cell.styles.textColor = terracottaRed;
          } else {
            data.cell.styles.textColor = marroneDeep;
          }
        }
      }
    },
    margin: { top: 28, left: 14, right: 14, bottom: 12 },
  });

  // Page Numbers Footer on each page
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(
      `Pagina ${i} di ${totalPages} — Luisa Spagnoli Sell out Analisys // Categoria: ${categorySummary.displayName} (Ordinamento Sell-Out % decrescente)`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // File name
  const cleanCatName = categorySummary.category.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Luisa_Spagnoli_Sell_out_Analisys_${cleanCatName}_${dateStr}.pdf`);
}

/**
 * Triggers styled browser print for the filtered category:
 * Perfect high-definition native printing of images without canvas CORS restrictions.
 * Contains strictly: Foto del modello, Nome del modello, Pre o main, Percentuale di sell out.
 * Ordered strictly from highest to lowest Sell-Out %. Zero comments.
 */
export function printFilteredCategory(categorySummary: import('../types/fashion').CategorySummary): void {
  const sortedModels = [...categorySummary.allModels].sort(
    (a, b) => b.sellOutPercent - a.sellOutPercent || b.totalSold - a.totalSold
  );

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Impossibile aprire la finestra di stampa. Permetti i popup nel browser.');
    return;
  }

  const tableRowsHtml = sortedModels
    .map((m, idx) => {
      const isBest = m.sellOutPercent >= 50;
      const isLow = m.sellOutPercent < 25;
      const percentColor = isBest ? '#244E2B' : isLow ? '#8E3B2B' : '#2D1F17';
      const badgeBg = isBest ? '#F2F7F2' : isLow ? '#FDF6F4' : '#FAF7F2';
      const badgeBorder = isBest ? '#C5D8C7' : isLow ? '#E8CDC7' : '#E5DAC8';
      const preOrMain = extractPreOrMain(m.linesheet);

      return `
      <tr style="border-bottom: 1px solid #EADBCE; background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#FAF7F2'};">
        <td style="padding: 10px; width: 70px; text-align: center; vertical-align: middle;">
          <img 
            src="${m.imageUrl}" 
            alt="${m.modelName}" 
            style="width: 52px; height: 68px; object-fit: cover; border-radius: 4px; border: 1px solid #D5C2B0; display: block; margin: 0 auto; background: #EFE7DA;"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
          <div style="display: none; width: 52px; height: 68px; border-radius: 4px; border: 1px solid #D5C2B0; background: #EFE7DA; align-items: center; justify-content: center; font-family: serif; font-weight: bold; color: #8C6826; font-size: 14px; margin: 0 auto;">
            ${m.modelName.slice(0, 2).toUpperCase()}
          </div>
        </td>
        <td style="padding: 10px 14px; vertical-align: middle;">
          <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: bold; color: #2D1F17; letter-spacing: 0.2px;">
            ${m.modelName}
          </div>
          <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #7A6455; margin-top: 2px;">
            ${m.silhouette}
          </div>
        </td>
        <td style="padding: 10px 14px; text-align: center; vertical-align: middle; font-family: 'Courier New', monospace; font-size: 12px; color: #4A3528;">
          <span style="display: inline-block; padding: 3px 10px; border-radius: 6px; background-color: #EFE7DA; border: 1px solid #D8CABE; font-weight: 600;">
            ${preOrMain}
          </span>
        </td>
        <td style="padding: 10px 14px; text-align: center; vertical-align: middle;">
          <span style="display: inline-block; font-family: 'Courier New', monospace; font-size: 14px; font-weight: bold; color: ${percentColor}; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; padding: 4px 12px; border-radius: 9999px;">
            ${m.sellOutPercent.toFixed(1)}%
          </span>
        </td>
      </tr>
      `;
    })
    .join('');

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="it">
  <head>
    <meta charset="UTF-8" />
    <title>Luisa Spagnoli Sell out Analisys - ${categorySummary.displayName}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 12mm 10mm;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #F9F6F0;
        color: #2D1F17;
        margin: 0;
        padding: 20px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .header-card {
        background-color: #2D1F17;
        color: #FFFFFF;
        padding: 16px 20px;
        border-radius: 8px;
        border-bottom: 3px solid #C5A059;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .brand-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 1px;
      }
      .sub-title {
        font-family: 'Courier New', monospace;
        font-size: 11px;
        color: #C5A059;
        font-weight: bold;
        margin-top: 3px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .meta-info {
        font-family: 'Courier New', monospace;
        font-size: 11px;
        color: #E6DCD2;
        text-align: right;
      }
      .category-info {
        margin-bottom: 14px;
        padding-left: 2px;
      }
      .category-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 18px;
        font-weight: bold;
        color: #2D1F17;
        margin: 0 0 4px 0;
      }
      .category-desc {
        font-family: 'Courier New', monospace;
        font-size: 11px;
        color: #7A6455;
        margin: 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        background: #FFFFFF;
        border: 1px solid #E5DAC8;
        border-radius: 8px;
        overflow: hidden;
      }
      th {
        background-color: #3D291F;
        color: #FFFFFF;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 10px 14px;
        border-bottom: 2px solid #C5A059;
      }
      .no-print-bar {
        margin-bottom: 16px;
        display: flex;
        gap: 10px;
      }
      .btn {
        padding: 8px 16px;
        background: #C5A059;
        color: #2D1F17;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        font-size: 12px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
      @media print {
        .no-print-bar {
          display: none;
        }
        body {
          padding: 0;
          background: #FFFFFF;
        }
      }
    </style>
  </head>
  <body>
    <div class="no-print-bar">
      <button class="btn" onclick="window.print()">Stampa / Salva in PDF</button>
      <button class="btn" style="background: #EFE7DA; color: #4A3528;" onclick="window.close()">Chiudi</button>
    </div>

    <div class="header-card">
      <div>
        <div class="brand-title">LUISA SPAGNOLI</div>
        <div class="sub-title">Luisa Spagnoli Sell out Analisys</div>
      </div>
      <div class="meta-info">
        <div>CATEGORIA: ${categorySummary.displayName.toUpperCase()}</div>
        <div style="color: #C5A059; font-weight: bold; margin-top: 2px;">Sell-Out Medio: ${categorySummary.sellOutPercent}%</div>
      </div>
    </div>

    <div class="category-info">
      <h2 class="category-title">Graduatoria Modelli — ${categorySummary.displayName}</h2>
      <p class="category-desc">Ordinati per Sell-Out % decrescente (dal più alto al più basso) · ${sortedModels.length} Modelli analizzati</p>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 70px; text-align: center;">Foto</th>
          <th style="text-align: left;">Nome del Modello</th>
          <th style="text-align: center; width: 140px;">Pre o Main</th>
          <th style="text-align: center; width: 130px;">% Sell-Out</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>

    <div style="margin-top: 16px; font-family: 'Courier New', monospace; font-size: 10px; color: #7A6455; text-align: center;">
      Luisa Spagnoli Sell out Analisys — Documento confidenziale per l'Ufficio Stile
    </div>
  </body>
  </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Generates and downloads a clean PDF for the entire collection ("Tutti"):
 * - Header: "Luisa Spagnoli Sell out Analisys"
 * - Background & Colors: Warm Crema, Beige, Oro, Marrone
 * - Columns: Foto del Modello, Nome del Modello, Pre o Main (o Categoria · Pre o Main), Percentuale di Sell-Out
 * - Ordered strictly from highest to lowest Sell-Out % (dal più alto al più basso)
 * - ZERO COMMENTS / no subjective notes
 */
export async function downloadAllModelsCleanPDF(reportData: CollectionReportData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Luisa Spagnoli Warm Luxury Palette
  const marroneDeep: [number, number, number] = [45, 31, 23];        // #2D1F17 deep espresso
  const oroCaldo: [number, number, number] = [197, 160, 89];         // #C5A059 luxury warm gold
  const cremaBg: [number, number, number] = [249, 246, 240];         // #F9F6F0 warm crema
  const textMuted: [number, number, number] = [122, 100, 85];        // #7A6455 warm taupe
  const oliveGreen: [number, number, number] = [36, 78, 43];         // #244E2B warm olive green for best sellers
  const terracottaRed: [number, number, number] = [142, 59, 43];     // #8E3B2B warm terracotta for flops

  // Sort ALL models strictly from highest Sell-Out % to lowest
  const sortedModels = [...reportData.allModels].sort(
    (a, b) => b.sellOutPercent - a.sellOutPercent || b.totalSold - a.totalSold
  );

  // Preload model thumbnails in parallel
  const imageMap = new Map<string, string | null>();
  await Promise.all(
    sortedModels.map(async (m) => {
      if (m.imageUrl) {
        const base64 = await loadBase64Image(m.imageUrl);
        imageMap.set(m.modelName, base64);
      }
    })
  );

  // Helper for Top Banner
  const addDocumentHeader = (isFirstPage: boolean) => {
    // Fill background with warm crema
    doc.setFillColor(...cremaBg);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Top banner in deep luxury marrone
    doc.setFillColor(...marroneDeep);
    doc.rect(0, 0, pageWidth, 24, 'F');

    // Gold decorative accent line
    doc.setFillColor(...oroCaldo);
    doc.rect(0, 23, pageWidth, 1, 'F');

    // Title: Luisa Spagnoli
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('LUISA SPAGNOLI', 14, 11);

    // Subtitle: Luisa Spagnoli Sell out Analisys
    doc.setTextColor(...oroCaldo);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('LUISA SPAGNOLI SELL OUT ANALISYS', 14, 18);

    // Right details
    doc.setTextColor(230, 220, 210);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Tutta la Collezione (${sortedModels.length} stili)`, pageWidth - 14, 11, { align: 'right' });
    doc.text(`Sell-Out Medio: ${reportData.grandTotalSellOut}%`, pageWidth - 14, 18, { align: 'right' });

    let currentY = 32;
    if (isFirstPage) {
      doc.setTextColor(...marroneDeep);
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text('TUTTA LA COLLEZIONE — GRADUATORIA MODELLI', 14, currentY);
      currentY += 5;

      doc.setTextColor(...textMuted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(
        `Graduatoria integrale di tutti i modelli per Sell-Out % decrescente · Totale: ${sortedModels.length} modelli · Inserite: ${reportData.grandTotalProduced.toLocaleString('it-IT')} pz · Vendute: ${reportData.grandTotalSold.toLocaleString('it-IT')} pz`,
        14,
        currentY
      );
      currentY += 6;
    }
    return currentY;
  };

  const startY = addDocumentHeader(true);

  // Table rows with strictly:
  // 1. Foto del modello (Thumbnail)
  // 2. Nome del modello
  // 3. Pre o Main (con categoria)
  // 4. Percentuale di sell out
  const tableData = sortedModels.map((m) => [
    '', // Image rendered in didDrawCell
    m.modelName,
    `${m.category} · ${extractPreOrMain(m.linesheet)}`,
    `${m.sellOutPercent.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: startY,
    head: [['Foto del Modello', 'Nome del Modello', 'Categoria · Pre o Main', '% Sell-Out']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: marroneDeep,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: marroneDeep,
      fillColor: [255, 255, 255],
      minCellHeight: 22,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [250, 247, 242],
    },
    columnStyles: {
      0: { cellWidth: 24, halign: 'center' },
      1: { cellWidth: 70, fontStyle: 'bold' },
      2: { cellWidth: 54, halign: 'center' },
      3: { cellWidth: 34, halign: 'center', fontStyle: 'bold', fontSize: 9.5 },
    },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        doc.setFillColor(...cremaBg);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        doc.setFillColor(...marroneDeep);
        doc.rect(0, 0, pageWidth, 24, 'F');

        doc.setFillColor(...oroCaldo);
        doc.rect(0, 23, pageWidth, 1, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('LUISA SPAGNOLI', 14, 11);

        doc.setTextColor(...oroCaldo);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('LUISA SPAGNOLI SELL OUT ANALISYS', 14, 18);

        doc.setTextColor(230, 220, 210);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Tutta la Collezione (${sortedModels.length} stili)`, pageWidth - 14, 11, { align: 'right' });
        doc.text(`Pagina ${data.pageNumber}`, pageWidth - 14, 18, { align: 'right' });
      }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const model = sortedModels[data.row.index];
        if (model) {
          const imgBase64 = imageMap.get(model.modelName);
          const cell = data.cell;
          const imgW = 16;
          const imgH = 19;
          const x = cell.x + (cell.width - imgW) / 2;
          const y = cell.y + (cell.height - imgH) / 2;

          if (imgBase64) {
            try {
              doc.addImage(imgBase64, 'JPEG', x, y, imgW, imgH);
              doc.setDrawColor(213, 194, 176);
              doc.setLineWidth(0.2);
              doc.rect(x, y, imgW, imgH);
            } catch {
              drawModelPlaceholder(doc, model.modelName, x, y, imgW, imgH);
            }
          } else {
            drawModelPlaceholder(doc, model.modelName, x, y, imgW, imgH);
          }
        }
      }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.column.index === 3) {
          const val = parseFloat(data.cell.raw as string);
          if (val >= 50) {
            data.cell.styles.textColor = oliveGreen;
            data.cell.styles.fontStyle = 'bold';
          } else if (val < 25) {
            data.cell.styles.textColor = terracottaRed;
          } else {
            data.cell.styles.textColor = marroneDeep;
          }
        }
      }
    },
    margin: { top: 28, left: 14, right: 14, bottom: 12 },
  });

  // Page Numbers Footer on each page
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(
      `Pagina ${i} di ${totalPages} — Luisa Spagnoli Sell out Analisys // Tutta la Collezione (Ordinamento Sell-Out % decrescente)`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Luisa_Spagnoli_Sell_out_Analisys_TUTTI_${dateStr}.pdf`);
}


