import * as XLSX from 'xlsx';
import { ColorVariant, ProductModel, MerchCategory, CategorySummary, CollectionReportData } from '../types/fashion';

/**
 * Maps silhouette to the 5 official merchandise categories (+ Accessori & Complementi)
 */
export function mapSilhouetteToCategory(silhouetteRaw: string): MerchCategory {
  const s = (silhouetteRaw || '').trim().toLowerCase();

  // 1. Outerwear (Capispalla):
  // Cape, Coat, Fur, Mantle, Padded Jacket, Parka, Pea Coat, Quilted Jacket, Trench, Winter Jacket
  if (
    s.includes('padded') ||
    s.includes('quilted') ||
    s.includes('winter ja') ||
    s.includes('winter jacket') ||
    s.includes('pea coat') ||
    s.includes('peacoat') ||
    s.includes('coat') ||
    s.includes('overcoat') ||
    s.includes('trench') ||
    s.includes('parka') ||
    s.includes('cape') ||
    s.includes('mantle') ||
    s.includes('mantella') ||
    s.includes('fur') ||
    s.includes('pelliccia')
  ) {
    return 'Outerwear';
  }

  // 2. Giacche (Jackets):
  // Jacket, Waistcoat
  if (
    s.includes('waistcoat') ||
    s.includes('gilet') ||
    s.includes('panciotto') ||
    s.includes('jacket') ||
    s.includes('giacca') ||
    s.includes('blazer')
  ) {
    return 'Giacche';
  }

  // 3. Maglieria (Knitwear):
  // Cardigan, Pullover
  if (
    s.includes('pullover') ||
    s.includes('maglione') ||
    s.includes('cardigan') ||
    s.includes('sweater')
  ) {
    return 'Maglieria';
  }

  // 4. Abiti (Dresses):
  // Dress, Tunic
  if (
    s.includes('dress') ||
    s.includes('abito') ||
    s.includes('vestito') ||
    s.includes('tunic') ||
    s.includes('tunica')
  ) {
    return 'Abiti';
  }

  // 5. Pantaloni (Trousers):
  // Trousers
  if (
    s.includes('trouser') ||
    s.includes('pantalon') ||
    s.includes('pant') ||
    s.includes('jean')
  ) {
    return 'Pantaloni';
  }

  // 6. Gonne (Skirts):
  // Skirt
  if (
    s.includes('skirt') ||
    s.includes('gonna')
  ) {
    return 'Gonne';
  }

  // 7. Top & Camicie (Tops & Shirts):
  // Blouse Shirt, Corset, Polo Shirt, Top
  if (
    s.includes('blouse') ||
    s.includes('camicia') ||
    s.includes('shirt') ||
    s.includes('polo') ||
    s.includes('corset') ||
    s.includes('corsetto') ||
    s.includes('top')
  ) {
    return 'Top & Camicie';
  }

  // 8. Accessori & Gioielli (Accessories & Jewelry):
  // Bag, Belt, Bracelet, Brooch, Cap, Collar, Earring, Foulard, Gloves, Hat, Key Ring, Necklace, Scarf, Shoes, Sunglasses, Tie
  return 'Accessori & Gioielli';
}

/**
 * Generate specific Product Manager guidance for the Styling Office
 */
export function generateStyleOfficeNote(model: {
  modelName: string;
  silhouette: string;
  category: MerchCategory;
  sellOutPercent: number;
  totalSold: number;
  totalProduced: number;
  bestColor?: string;
}): { note: string; action: 'MUST-HAVE' | 'EVOLUZIONE' | 'RIVEDERE' | 'DA ELIMINARE' } {
  const so = model.sellOutPercent;
  const name = model.modelName.replace(/\/?W\d+$/i, '');
  const bestColorStr = model.bestColor ? ` (variante guida: ${model.bestColor})` : '';

  if (so >= 70) {
    return {
      note: `SUPER BEST SELLER (${so.toFixed(1)}%). Replicare identica vestibilità e volume${bestColorStr}. Consolidare come carry-over fisso ed esplorare capsule coordinata in nuova cartella colori FW27.`,
      action: 'MUST-HAVE'
    };
  } else if (so >= 50) {
    return {
      note: `BEST SELLER STRATEGICO (${so.toFixed(1)}%). Replicare la base modellistica e sviluppare varianti di dettaglio${bestColorStr} (es. scollo, rifiniture interne o alternativa materica con filato/tessuto più caldo).`,
      action: 'EVOLUZIONE'
    };
  } else if (so >= 30) {
    return {
      note: `PERFORMANCE MEDIA (${so.toFixed(1)}%). Mantenere solo i colori performanti. Calibrare il posizionamento prezzo e testare un fitting leggermente più morbido o rifinitura alleggerita.`,
      action: 'RIVEDERE'
    };
  } else {
    return {
      note: `SOTTO-PERFORMANTE / FLOP (${so.toFixed(1)}%). Scarso assorbimento a sell-out. Da eliminare dalla collezione principale o reinterpretare totalmente tessuto e pesantezza per liberare SKU budget.`,
      action: 'DA ELIMINARE'
    };
  }
}

/**
 * Generate 2-sentence executive summary for category
 */
function generateCategoryOverview(
  cat: MerchCategory,
  so: number,
  prod: number,
  sold: number,
  bestSellersCount: number,
  totalStyles: number
): string {
  const soStr = so.toFixed(1);
  const bestRatio = totalStyles > 0 ? Math.round((bestSellersCount / totalStyles) * 100) : 0;

  switch (cat) {
    case 'Outerwear':
      return `La categoria Outerwear (Capispalla) registra un Sell-Out medio del ${soStr}% (${sold} capi venduti su ${prod} inseriti), trainata da piumini imbottiti, giacche trapuntate e caban. Il ${bestRatio}% dei modelli è Best Seller confermato per replica modellistica.`;

    case 'Giacche':
      return `La categoria Giacche e Gilet sartoriali segna un Sell-Out del ${soStr}% con ${sold} capi venduti su ${prod} a budget. I blazer strutturati e i panciotti formali confermano il forte DNA sartoriale Luisa Spagnoli.`;

    case 'Maglieria':
      return `La Maglieria (Pullover e Cardigan) è uno dei motori commerciali trainanti con un Sell-Out del ${soStr}% (${sold} venduti su ${prod} prodotti) e ${bestSellersCount} Best Seller, guidata da filati nobili e punti maglia a forte texture.`;

    case 'Abiti':
      return `Gli Abiti e Tuniche registrano un Sell-Out del ${soStr}% (${sold} unità vendute su ${prod} prodotte), con picchi sui modelli stampati e silhouette fluide a manica lunga.`;

    case 'Pantaloni':
      return `I Pantaloni raggiungono un Sell-Out del ${soStr}% con ${sold} unità collocate su ${prod} prodotte, trainate da tagli a palazzo e vestibilità sartoriali a vita alta.`;

    case 'Gonne':
      return `Le Gonne attestano un Sell-Out del ${soStr}% (${sold} vendute su ${prod} a catalogo), con forte predilezione per lunghezze midi e costruzioni a pieghe.`;

    case 'Top & Camicie':
      return `Il comparto Top & Camicie (Bluse, Polo, Corsetti) evidenzia un Sell-Out del ${soStr}% (${sold} vendute su ${prod} a stock), trainato dalle bluse fluide in seta e dalle polo con dettagli sartoriali.`;

    case 'Accessori & Gioielli':
    default:
      return `La categoria Accessori & Gioielli registra un Sell-Out del ${soStr}% (${sold} pezzi venduti su ${prod}), guidata da cinture in pelle, spille di sfilata e borse.`;
  }
}

/**
 * Parse raw CSV or delimited lines into structured report data
 */
export function parseCollectionData(rawContent: string, fileName: string = 'Collezione FW26'): CollectionReportData {
  const lines = rawContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    throw new Error('Il file caricato è vuoto.');
  }

  // Detect delimiter: check header line
  const firstLine = lines[0];
  let delimiter = ';';
  if ((firstLine.match(/;/g) || []).length >= 3) {
    delimiter = ';';
  } else if ((firstLine.match(/,/g) || []).length >= 3) {
    delimiter = ',';
  } else if ((firstLine.match(/\t/g) || []).length >= 3) {
    delimiter = '\t';
  }

  // Helper to split CSV row honoring quotes
  const splitRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Find header index and column positions
  let headerIndex = -1;
  let colModel = 0;
  let colColor = 1;
  let colImage = 2;
  let colLinesheet = 3;
  let colSilhouette = 4;
  let colProduced = 5;
  let colSold = 6;

  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const cols = splitRow(lines[i]);
    const lowerCols = cols.map((c) => c.toLowerCase());
    const hasImage = lowerCols.some((c) => c.includes('immag') || c.includes('image') || c.includes('foto'));
    const hasSilhouette = lowerCols.some((c) => c.includes('silhou') || c.includes('categ') || c.includes('tipo'));
    const hasProducedOrSold = lowerCols.some(
      (c) =>
        c.includes('приход') ||
        c.includes('расход') ||
        c.includes('prod') ||
        c.includes('ins') ||
        c.includes('vend') ||
        c.includes('sold')
    );

    if (hasImage || hasSilhouette || hasProducedOrSold || cols.length >= 6) {
      headerIndex = i;
      // map columns if names are recognizable
      lowerCols.forEach((name, idx) => {
        if (name.includes('immag') || name.includes('image') || name.includes('photo')) colImage = idx;
        else if (name.includes('linesheet') || name.includes('stagion') || name.includes('line')) colLinesheet = idx;
        else if (name.includes('silhou') || name.includes('articolo') || name.includes('categoria')) colSilhouette = idx;
        else if (name.includes('col') || name.includes('variante') || name.includes('color')) colColor = idx;
        else if (name.includes('mod') || name.includes('style') || name.includes('nome')) colModel = idx;
        else if (name.includes('приход') || name.includes('prod') || name.includes('ins') || name.includes('carico')) colProduced = idx;
        else if (name.includes('расход') || name.includes('vend') || name.includes('sold') || name.includes('scarico')) colSold = idx;
      });
      break;
    }
  }

  const dataRows = lines.slice(headerIndex + 1);

  interface RawRow {
    rawModel: string;
    rawColor: string;
    imageUrl: string;
    linesheet: string;
    silhouette: string;
    produced: number;
    sold: number;
    isSummary: boolean;
    isGrandTotal: boolean;
  }

  const parsedRows: RawRow[] = [];
  let currentModelName = '';

  for (const line of dataRows) {
    const cols = splitRow(line);
    if (cols.every((c) => c === '')) continue;

    let rawModel = (cols[colModel] || '').trim();
    const rawColor = (cols[colColor] || '').trim();
    const imageUrl = (cols[colImage] || '').trim();
    const linesheet = (cols[colLinesheet] || '').trim();
    const silhouette = (cols[colSilhouette] || '').trim();
    const producedStr = (cols[colProduced] || '0').replace(/[^\d.-]/g, '');
    const soldStr = (cols[colSold] || '0').replace(/[^\d.-]/g, '');

    const produced = parseFloat(producedStr) || 0;
    const sold = parseFloat(soldStr) || 0;

    const isGrandTotal =
      rawModel.toLowerCase().includes('общий') ||
      rawModel.toLowerCase().includes('grand total') ||
      (rawModel.includes('????') && produced > 1000 && sold > 1000 && rawColor === '');

    if (isGrandTotal) {
      continue;
    }

    const isSummary =
      rawModel.includes('????') ||
      rawModel.toLowerCase().includes('итог') ||
      rawModel.toLowerCase().includes('totale') ||
      rawModel.toLowerCase().includes('total');

    let cleanModelName = rawModel
      .replace(/\?{2,}/g, '')
      .replace(/итог/gi, '')
      .replace(/total/gi, '')
      .trim();

    if (!cleanModelName && currentModelName) {
      cleanModelName = currentModelName;
    } else if (cleanModelName && !isSummary) {
      currentModelName = cleanModelName;
    }

    if (!cleanModelName && !rawColor && produced === 0 && sold === 0) {
      continue;
    }

    parsedRows.push({
      rawModel: cleanModelName || currentModelName,
      rawColor,
      imageUrl,
      linesheet,
      silhouette,
      produced,
      sold,
      isSummary,
      isGrandTotal: false,
    });
  }

  // Group by clean model name
  const modelMap = new Map<
    string,
    {
      modelName: string;
      silhouette: string;
      category: MerchCategory;
      linesheet: string;
      imageUrl: string;
      summaryProduced?: number;
      summarySold?: number;
      variants: ColorVariant[];
    }
  >();

  for (const row of parsedRows) {
    if (!row.rawModel) continue;

    const category = mapSilhouetteToCategory(row.silhouette);
    if (!modelMap.has(row.rawModel)) {
      modelMap.set(row.rawModel, {
        modelName: row.rawModel,
        silhouette: row.silhouette,
        category,
        linesheet: row.linesheet,
        imageUrl: row.imageUrl,
        variants: [],
      });
    }

    const entry = modelMap.get(row.rawModel)!;
    if (row.silhouette && !entry.silhouette) {
      entry.silhouette = row.silhouette;
      entry.category = category;
    }
    if (row.imageUrl && !entry.imageUrl) {
      entry.imageUrl = row.imageUrl;
    }
    if (row.linesheet && !entry.linesheet) {
      entry.linesheet = row.linesheet;
    }

    if (row.isSummary) {
      entry.summaryProduced = row.produced;
      entry.summarySold = row.sold;
      if (row.imageUrl) entry.imageUrl = row.imageUrl;
    } else {
      const sellOutPercent = row.produced > 0 ? (row.sold / row.produced) * 100 : 0;
      const variant: ColorVariant = {
        id: `${row.rawModel}_${row.rawColor || 'default'}_${entry.variants.length}`,
        modelName: row.rawModel,
        colorCode: row.rawColor || 'Standard',
        imageUrl: row.imageUrl || entry.imageUrl,
        linesheet: row.linesheet || entry.linesheet,
        silhouette: row.silhouette || entry.silhouette,
        category: entry.category,
        unitsProduced: row.produced,
        unitsSold: row.sold,
        sellOutPercent: Math.round(sellOutPercent * 10) / 10,
        isBestSeller: sellOutPercent >= 50,
      };
      entry.variants.push(variant);
    }
  }

  // Construct ProductModel list
  const allModels: ProductModel[] = [];
  const allVariants: ColorVariant[] = [];

  for (const [_, entry] of modelMap.entries()) {
    if (entry.variants.length === 0 && (entry.summaryProduced !== undefined || entry.summarySold !== undefined)) {
      const prod = entry.summaryProduced || 0;
      const sold = entry.summarySold || 0;
      const so = prod > 0 ? (sold / prod) * 100 : 0;
      entry.variants.push({
        id: `${entry.modelName}_single`,
        modelName: entry.modelName,
        colorCode: 'Standard',
        imageUrl: entry.imageUrl,
        linesheet: entry.linesheet,
        silhouette: entry.silhouette,
        category: entry.category,
        unitsProduced: prod,
        unitsSold: sold,
        sellOutPercent: Math.round(so * 10) / 10,
        isBestSeller: so >= 50,
      });
    }

    let totalProduced = 0;
    let totalSold = 0;

    if (entry.summaryProduced !== undefined && entry.summarySold !== undefined) {
      totalProduced = entry.summaryProduced;
      totalSold = entry.summarySold;
    } else {
      totalProduced = entry.variants.reduce((acc, v) => acc + v.unitsProduced, 0);
      totalSold = entry.variants.reduce((acc, v) => acc + v.unitsSold, 0);
    }

    const sumVariantsProd = entry.variants.reduce((acc, v) => acc + v.unitsProduced, 0);
    const sumVariantsSold = entry.variants.reduce((acc, v) => acc + v.unitsSold, 0);
    if (totalProduced === 0 && sumVariantsProd > 0) {
      totalProduced = sumVariantsProd;
      totalSold = sumVariantsSold;
    }

    const sellOutPercent = totalProduced > 0 ? (totalSold / totalProduced) * 100 : 0;
    const isBestSeller = sellOutPercent >= 50;

    const sortedVariants = [...entry.variants].sort((a, b) => b.sellOutPercent - a.sellOutPercent);
    const bestColor = sortedVariants[0]?.colorCode;

    const { note, action } = generateStyleOfficeNote({
      modelName: entry.modelName,
      silhouette: entry.silhouette,
      category: entry.category,
      sellOutPercent,
      totalSold,
      totalProduced,
      bestColor,
    });

    const productModel: ProductModel = {
      modelName: entry.modelName,
      silhouette: entry.silhouette || 'Fashion Item',
      category: entry.category,
      linesheet: entry.linesheet || 'FW 2026',
      imageUrl: entry.imageUrl || (entry.variants[0] ? entry.variants[0].imageUrl : ''),
      totalProduced,
      totalSold,
      sellOutPercent: Math.round(sellOutPercent * 10) / 10,
      isBestSeller,
      variants: entry.variants,
      styleOfficeNote: note,
      collectionAction: action,
    };

    allModels.push(productModel);
    entry.variants.forEach((v) => allVariants.push(v));
  }

  // Grand totals
  const grandTotalProduced = allModels.reduce((acc, m) => acc + m.totalProduced, 0);
  const grandTotalSold = allModels.reduce((acc, m) => acc + m.totalSold, 0);
  const grandTotalSellOut =
    grandTotalProduced > 0 ? Math.round(((grandTotalSold / grandTotalProduced) * 100) * 10) / 10 : 0;
  const bestSellersCount = allModels.filter((m) => m.isBestSeller).length;

  // Official updated 8 categories
  const officialOrder: { cat: MerchCategory; display: string; italian: string; desc: string }[] = [
    {
      cat: 'Outerwear',
      display: 'Outerwear (Capispalla)',
      italian: 'Coat, Overcoat, Trench, Parka, Cape, Mantle, Padded & Quilted Jacket, Pea Coat, Fur',
      desc: 'Cappotti, trench, parka, mantelle, piumini e giacche imbottite o trapuntate.',
    },
    {
      cat: 'Giacche',
      display: 'Giacche (Jackets)',
      italian: 'Jacket & Waistcoat',
      desc: 'Giacche sartoriali, blazer e gilet / panciotti formali.',
    },
    {
      cat: 'Maglieria',
      display: 'Maglieria (Knitwear)',
      italian: 'Cardigan & Pullover',
      desc: 'Maglioni in lana/cashmere, pullover a coste e cardigan.',
    },
    {
      cat: 'Abiti',
      display: 'Abiti (Dresses)',
      italian: 'Dress & Tunic',
      desc: 'Abiti interi lunghi e midi, vestiti e tuniche fluide.',
    },
    {
      cat: 'Pantaloni',
      display: 'Pantaloni (Trousers)',
      italian: 'Trousers',
      desc: 'Pantaloni sartoriali a gamba dritta, a palazzo e cropped.',
    },
    {
      cat: 'Gonne',
      display: 'Gonne (Skirts)',
      italian: 'Skirt',
      desc: 'Gonne midi a pieghe, svasate e a tubino.',
    },
    {
      cat: 'Top & Camicie',
      display: 'Top & Camicie (Tops & Shirts)',
      italian: 'Blouse Shirt, Corset, Polo Shirt & Top',
      desc: 'Camicie, bluse fluide, corsetti, polo e top estivi/invernali.',
    },
    {
      cat: 'Accessori & Gioielli',
      display: 'Accessori & Gioielli (Accessories & Jewelry)',
      italian: 'Bag, Belt, Jewelry, Shoes, Hat, Foulard & Accessories',
      desc: 'Borse, cinture, spille, collane, bracciali, scarpe e sciarpe.',
    },
  ];

  const categories: CategorySummary[] = officialOrder.map((info) => {
    const catModels = allModels.filter((m) => m.category === info.cat);
    const catProduced = catModels.reduce((acc, m) => acc + m.totalProduced, 0);
    const catSold = catModels.reduce((acc, m) => acc + m.totalSold, 0);
    const catSellOut = catProduced > 0 ? Math.round(((catSold / catProduced) * 100) * 10) / 10 : 0;

    const catBestSellers = catModels
      .filter((m) => m.sellOutPercent >= 50)
      .sort((a, b) => b.sellOutPercent - a.sellOutPercent || b.totalSold - a.totalSold);

    const catFlops = catModels
      .filter((m) => m.sellOutPercent < 50)
      .sort((a, b) => a.sellOutPercent - b.sellOutPercent || a.totalSold - b.totalSold);

    const mustHaves = catModels.filter((m) => m.collectionAction === 'MUST-HAVE');
    const evolutions = catModels.filter((m) => m.collectionAction === 'EVOLUZIONE');
    const toEliminateOrRevise = catModels.filter(
      (m) => m.collectionAction === 'DA ELIMINARE' || m.collectionAction === 'RIVEDERE'
    );

    const overview = generateCategoryOverview(
      info.cat,
      catSellOut,
      catProduced,
      catSold,
      catBestSellers.length,
      catModels.length
    );

    return {
      category: info.cat,
      displayName: info.display,
      italianName: info.italian,
      description: info.desc,
      totalStyles: catModels.length,
      totalProduced: catProduced,
      totalSold: catSold,
      sellOutPercent: catSellOut,
      bestSellersCount: catBestSellers.length,
      flopCount: catFlops.length,
      overviewTwoSentences: overview,
      bestSellers: catBestSellers,
      flops: catFlops,
      allModels: [...catModels].sort((a, b) => b.sellOutPercent - a.sellOutPercent || b.totalSold - a.totalSold),
      mustHaves,
      evolutions,
      toEliminateOrRevise,
    };
  });

  return {
    fileName,
    importedAt: new Date().toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    grandTotalProduced,
    grandTotalSold,
    grandTotalSellOut,
    modelsCount: allModels.length,
    variantsCount: allVariants.length,
    bestSellersCount,
    categories,
    allModels,
    allVariants,
  };
}

/**
 * Parses binary excel buffer (ArrayBuffer) using XLSX
 */
export function parseExcelBuffer(buffer: ArrayBuffer, fileName: string): CollectionReportData {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  // convert worksheet to CSV text with semicolon delimiter
  const csvContent = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });
  return parseCollectionData(csvContent, fileName);
}
