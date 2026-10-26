import { CollectionReportData } from '../types/fashion';

/**
 * Generates a full markdown report structured according to the prompt requirements
 */
export function generateMarkdownReport(data: CollectionReportData): string {
  let md = `# LUISA SPAGNOLI SELL OUT ANALISYS
**Stagione di Riferimento:** FW 2026 (Analisi Sell-Out) → Linee Guida FW 2027
**Data Elaborazione:** ${data.importedAt}
**Dataset Origine:** ${data.fileName}

---

## EXECUTIVE SUMMARY & KPI GLOBALI
- **Unità Inserite / Prodotte a Budget:** ${data.grandTotalProduced.toLocaleString('it-IT')} pz
- **Unità Vendute (Riassorbimento Retail):** ${data.grandTotalSold.toLocaleString('it-IT')} pz
- **Sell-Out Medio di Collezione:** **${data.grandTotalSellOut}%**
- **Totale Modelli / Cartamodelli:** ${data.modelsCount} stili (${data.variantsCount} SKU colore)
- **Best Seller Qualificati (Sell-Out > 50%):** **${data.bestSellersCount} modelli** (Target Prioritario: "REPLICA E SVILUPPA")

---

`;

  // Process each category in strict order
  for (const cat of data.categories) {
    md += `## Categoria: ${cat.displayName.toUpperCase()}\n\n`;
    
    // 1. Panoramica
    md += `### 1. Panoramica Categoria\n`;
    md += `${cat.overviewTwoSentences}\n\n`;

    // 2. Top Performer & Best Seller (>50%)
    md += `### 2. Top Performer & Best Seller (Sell-Out > 50%)\n`;
    if (cat.bestSellers.length === 0) {
      md += `*Nessun capo ha superato la soglia del 50% di sell-out in questa categoria.*\n\n`;
    } else {
      md += `| Foto | Nome Modello / Silhouette | Varianti Colore | Inserite | Vendute | Sell-Out % | Indicazione per l'Ufficio Stile |\n`;
      md += `| :--- | :--- | :--- | :---: | :---: | :---: | :--- |\n`;
      for (const m of cat.bestSellers) {
        const colors = m.variants.map((v) => v.colorCode).join(', ');
        const imgMd = m.imageUrl ? `![](${m.imageUrl})` : `[Foto]`;
        md += `| ${imgMd} | **${m.modelName}** (${m.silhouette}) | ${colors} | ${m.totalProduced} | ${m.totalSold} | **🟢 ${m.sellOutPercent}%** | **[${m.collectionAction}]** ${m.styleOfficeNote} |\n`;
      }
      md += `\n`;
    }

    // 3. In-Depth / Flop (<50%)
    md += `### 3. In-Depth / Flop (Sell-Out < 50%)\n`;
    if (cat.flops.length === 0) {
      md += `*Nessun modello sotto-performante registrato.*\n\n`;
    } else {
      md += `| Modello | Silhouette | Inserite | Vendute | Sell-Out % | Diagnosi Criticità Ufficio Stile |\n`;
      md += `| :--- | :--- | :---: | :---: | :---: | :--- |\n`;
      for (const f of cat.flops.slice(0, 6)) {
        md += `| ${f.modelName} | ${f.silhouette} | ${f.totalProduced} | ${f.totalSold} | ${f.sellOutPercent}% | ${f.sellOutPercent < 20 ? 'Volume o pesantezza fuori target. Ritiro immediato.' : 'Performance sotto media. Eliminare varianti deboli.'} |\n`;
      }
      md += `\n`;
    }

    // 4. Linee Guida di Collezione
    md += `### 4. Linee Guida di Collezione per la Prossima Stagione (Actionable Takeaways)\n`;
    
    // MUST-HAVE
    md += `- **MUST-HAVE (Carry-over):** `;
    if (cat.mustHaves.length > 0) {
      md += cat.mustHaves.map((m) => `**${m.modelName}** (${m.sellOutPercent}%)`).join(', ') + `. Modelli da riproporre identici nella modellistica perché colonne portanti del sell-out.\n`;
    } else {
      md += `Consolidare i capi migliori con Sell-Out > 50% come carry-over con continuità di fornitura tessuto.\n`;
    }

    // EVOLUZIONI
    md += `- **EVOLUZIONI:** `;
    if (cat.evolutions.length > 0) {
      md += cat.evolutions.map((m) => `**${m.modelName}** (${m.sellOutPercent}%)`).join(', ') + `. Sviluppare nuove varianti sartoriali (tessuto stretch, colli differenti, declinazioni lunghe/corte).\n`;
    } else {
      md += `Sviluppare varianti di colore e pesi medi sui modelli trainanti.\n`;
    }

    // DA ELIMINARE / RIVEDERE
    md += `- **DA ELIMINARE / RIVEDERE:** `;
    if (cat.toEliminateOrRevise.length > 0) {
      md += cat.toEliminateOrRevise.slice(0, 5).map((m) => `**${m.modelName}** (${m.sellOutPercent}%)`).join(', ') + `. Volumi o tessuti con assorbimento deludente; depennare per non bloccare giacenze di magazzino.\n\n`;
    } else {
      md += `Nessun capo critico da eliminare.\n\n`;
    }

    md += `---\n\n`;
  }

  md += `*Report generato con Atelier Merch Analytics — Riservato per Direzione Generale & Ufficio Stile.*`;
  return md;
}
