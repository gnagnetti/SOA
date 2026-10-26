import React, { useState } from 'react';
import { CollectionReportData, CategorySummary, ProductModel } from '../types/fashion';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpRight,
  Flame,
  TrendingDown,
  Layers,
  Search,
  Printer,
  FileDown,
  RefreshCw,
  Filter
} from 'lucide-react';
import { downloadFilteredCategoryPDF, printFilteredCategory } from '../utils/pdfExport';

interface ExecutiveReportViewProps {
  reportData: CollectionReportData;
  onSelectModel: (model: ProductModel) => void;
}

export const ExecutiveReportView: React.FC<ExecutiveReportViewProps> = ({
  reportData,
  onSelectModel,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [downloadingCat, setDownloadingCat] = useState<string | null>(null);
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Outerwear: true,
    Giacche: true,
    Maglieria: true,
    Abiti: true,
    Pantaloni: true,
    Gonne: true,
    'Top & Camicie': true,
    'Accessori & Gioielli': true,
  });

  const [showAllModelsPerCategory, setShowAllModelsPerCategory] = useState<Record<string, boolean>>({
    Outerwear: true,
    Giacche: true,
    Maglieria: true,
    Abiti: true,
    Pantaloni: true,
    Gonne: true,
    'Top & Camicie': true,
    'Accessori & Gioielli': true,
  });

  const [categorySearches, setCategorySearches] = useState<Record<string, string>>({});

  const handleDownloadCategoryPdf = async (catSummary: CategorySummary) => {
    setDownloadingCat(catSummary.category);
    try {
      await downloadFilteredCategoryPDF(catSummary);
    } catch (err) {
      console.error('Error generating category PDF:', err);
    } finally {
      setDownloadingCat(null);
    }
  };

  const handlePrintCategory = (catSummary: CategorySummary) => {
    printFilteredCategory(catSummary);
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const toggleShowAll = (cat: string) => {
    setShowAllModelsPerCategory((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const handleSearchChange = (cat: string, value: string) => {
    setCategorySearches((prev) => ({
      ...prev,
      [cat]: value,
    }));
  };

  const categoriesToRender =
    selectedCategoryFilter === 'ALL'
      ? reportData.categories
      : reportData.categories.filter((c) => c.category === selectedCategoryFilter);

  return (
    <div className="space-y-12">
      {/* Category Quick Jump Bar in warm crema */}
      <div className="sticky top-16 z-20 flex items-center justify-between gap-3 p-2 bg-[#FAF7F2]/95 backdrop-blur-md rounded-xl border border-[#E5DAC8] shadow-xs overflow-x-auto no-print">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-[#3D291F] text-[#FAF7F2] shadow-xs'
                : 'text-[#6D5545] hover:text-[#2D1F17] hover:bg-[#EFE7DA]'
            }`}
          >
            Tutte le Categorie ({reportData.modelsCount})
          </button>
          {reportData.categories.map((c) => (
            <button
              key={c.category}
              onClick={() => setSelectedCategoryFilter(c.category)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 ${
                selectedCategoryFilter === c.category
                  ? 'bg-[#3D291F] text-[#FAF7F2] font-bold shadow-xs'
                  : 'text-[#6D5545] hover:text-[#2D1F17] hover:bg-[#EFE7DA]'
              }`}
            >
              <span>{c.displayName.split(' ')[0]}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedCategoryFilter === c.category
                  ? 'bg-[#C5A059] text-[#2D1F17]'
                  : 'bg-[#EADBCE] text-[#4A3528]'
              }`}>
                {c.sellOutPercent}%
              </span>
            </button>
          ))}
        </div>

        <div className="text-[11px] text-[#7A6455] font-mono hidden md:flex items-center gap-2 pr-2">
          <span className="flex items-center gap-1 text-[#244E2B] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#2D5A34] inline-block animate-pulse"></span>
            Best Seller &gt; 50%
          </span>
          <span className="text-[#D5C2B0]">|</span>
          <span className="text-[#8C6826] font-semibold">Tutti i modelli visibili</span>
        </div>
      </div>

      {/* Render each merchandise category */}
      {categoriesToRender.map((categorySummary, idx) => {
        const isExpanded = expandedCategories[categorySummary.category] ?? true;
        const isFullListShown = showAllModelsPerCategory[categorySummary.category] ?? true;
        const searchTerm = categorySearches[categorySummary.category] || '';

        const filteredAllModels = categorySummary.allModels.filter((m) => {
          if (!searchTerm) return true;
          const q = searchTerm.toLowerCase();
          return (
            m.modelName.toLowerCase().includes(q) ||
            m.silhouette.toLowerCase().includes(q) ||
            m.variants.some((v) => v.colorCode.toLowerCase().includes(q))
          );
        });

        return (
          <section
            key={categorySummary.category}
            id={categorySummary.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}
            className="rounded-2xl border border-[#E5DAC8] bg-[#FFFFFF] shadow-sm overflow-hidden scroll-mt-28 transition-all"
          >
            {/* Section Header */}
            <div
              onClick={() => toggleCategory(categorySummary.category)}
              className="flex items-center justify-between p-6 md:p-8 bg-gradient-to-r from-[#FAF6EE] via-[#F6EFE3] to-[#EFE8DA] border-b border-[#E5DAC8] cursor-pointer select-none group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs tracking-widest text-[#8C6826] uppercase font-bold">
                    Sezione 0{idx + 1} // Luisa Spagnoli Sell out Analisys
                  </span>
                  <span className="px-2.5 py-0.5 text-[11px] font-mono rounded-full bg-[#EADBCE] text-[#4A3528] border border-[#D5C2B0] font-semibold">
                    {categorySummary.totalStyles} Modelli ({categorySummary.totalProduced} pz totali)
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#2D1F17] tracking-tight flex items-center gap-3 group-hover:text-[#8C6826] transition-colors">
                  Categoria: {categorySummary.displayName.toUpperCase()}
                </h2>
                <p className="text-xs md:text-sm text-[#6D5545] font-sans">
                  {categorySummary.italianName} — {categorySummary.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* PDF & Print Quick Actions */}
                <div className="hidden sm:flex items-center gap-2 no-print" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleDownloadCategoryPdf(categorySummary)}
                    disabled={downloadingCat === categorySummary.category}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#C5A059] hover:bg-[#B68F46] text-[#2C1E18] flex items-center gap-1.5 transition-all shadow-xs border border-[#A67E33] disabled:opacity-50"
                    title={`Scarica il PDF di ${categorySummary.displayName} con Foto, Nome, Pre/Main e % Sell-Out (senza commenti)`}
                  >
                    {downloadingCat === categorySummary.category ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2C1E18]" />
                        <span>Generazione...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-3.5 h-3.5 text-[#2C1E18]" />
                        <span>PDF Categoria</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handlePrintCategory(categorySummary)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#EFE7DA] hover:bg-[#E5DAC8] text-[#3D291F] flex items-center gap-1.5 transition-colors border border-[#D8CABE]"
                    title={`Stampa la scheda con foto e dati di ${categorySummary.displayName}`}
                  >
                    <Printer className="w-3.5 h-3.5 text-[#6D5545]" />
                    <span>Stampa</span>
                  </button>
                </div>

                {/* Category Sell Out Badge */}
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#7A6455] font-semibold">Sell-Out Categoria</div>
                  <div className={`text-2xl font-bold font-mono ${
                    categorySummary.sellOutPercent >= 50
                      ? 'text-[#244E2B]'
                      : categorySummary.sellOutPercent >= 35
                      ? 'text-[#8C6826]'
                      : 'text-[#4A3528]'
                  }`}>
                    {categorySummary.sellOutPercent}%
                  </div>
                  <div className="text-[11px] text-[#7A6455] font-mono">
                    {categorySummary.totalSold} / {categorySummary.totalProduced} pz
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#EFE7DA] text-[#4A3528] group-hover:bg-[#E5DAC8] transition-colors no-print">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="p-6 md:p-8 space-y-10">
                {/* 1. PANORAMICA CATEGORIA */}
                <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E5DAC8] shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]"></span>
                    <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-[#8C6826]">
                      1. Panoramica Categoria & Performance Commerciale
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-[#3D291F] leading-relaxed font-sans">
                    {categorySummary.overviewTwoSentences}
                  </p>
                </div>

                {/* 2. TOP PERFORMER & BEST SELLER (Sell-Out > 50%) */}
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#E5DAC8] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#F5F8F4] text-[#2D5A34] border border-[#C5D8C7]">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-[#2D1F17] flex items-center gap-2">
                          2. Top Performer & Best Seller
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#F5F8F4] text-[#244E2B] border border-[#C5D8C7]">
                            Sell-Out &gt; 50%
                          </span>
                        </h3>
                        <p className="text-xs text-[#7A6455]">
                          {categorySummary.bestSellers.length} modelli hanno superato il target commerciale prioritario (&gt;50%). Capi confermati per replica e sviluppo.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#244E2B] font-bold self-start md:self-auto">
                      BEST SELLER / REPLICA E SVILUPPA
                    </span>
                  </div>

                  {categorySummary.bestSellers.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#E5DAC8] text-center text-[#7A6455] text-xs font-mono">
                      Nessun modello ha superato il 50% di sell-out in questa categoria specifica.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-[#E5DAC8] bg-[#FFFFFF] shadow-xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#E5DAC8] bg-[#F5EFE4] text-[#4D3A2D] font-mono uppercase text-[11px] tracking-wider">
                            <th className="py-3 px-4 w-16">Foto</th>
                            <th className="py-3 px-4">Nome Modello / Silhouette</th>
                            <th className="py-3 px-4">Colori / Varianti</th>
                            <th className="py-3 px-4 text-center">Inserite (Приход)</th>
                            <th className="py-3 px-4 text-center">Vendute (Расход)</th>
                            <th className="py-3 px-4 text-center">Sell-Out %</th>
                            <th className="py-3 px-4 min-w-[280px]">Indicazione per l'Ufficio Stile</th>
                            <th className="py-3 px-3 w-10 no-print"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE7DA] font-sans">
                          {categorySummary.bestSellers.map((model) => (
                            <tr
                              key={model.modelName}
                              onClick={() => onSelectModel(model)}
                              className="hover:bg-[#FAF6EE] transition-colors cursor-pointer group"
                            >
                              {/* Thumbnail */}
                              <td className="py-3 px-4">
                                <div className="relative w-12 h-16 rounded bg-[#F5EFE4] overflow-hidden border border-[#D5C2B0] flex-shrink-0 group-hover:border-[#C5A059] transition-colors shadow-xs">
                                  <img
                                    src={model.imageUrl}
                                    alt={model.modelName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80';
                                    }}
                                  />
                                </div>
                              </td>

                              {/* Model & Silhouette */}
                              <td className="py-3 px-4">
                                <div className="font-serif text-sm font-bold text-[#2D1F17] group-hover:text-[#8C6826] transition-colors">
                                  {model.modelName}
                                </div>
                                <div className="text-[11px] text-[#7A6455] font-mono mt-0.5">
                                  {model.silhouette} · {model.linesheet.replace('Fw 2026 - ', '')}
                                </div>
                              </td>

                              {/* Colors */}
                              <td className="py-3 px-4 font-mono text-[11px] text-[#4A3528]">
                                {model.variants.length > 1 ? (
                                  <div>
                                    <span className="font-bold text-[#2D1F17]">
                                      {model.variants.length} varianti
                                    </span>
                                    <div className="text-[#7A6455] text-[10px] truncate max-w-[140px]">
                                      {model.variants.map((v) => v.colorCode).join(', ')}
                                    </div>
                                  </div>
                                ) : (
                                  <span>{model.variants[0]?.colorCode || 'Colore base'}</span>
                                )}
                              </td>

                              {/* Produced */}
                              <td className="py-3 px-4 text-center font-mono text-[#4A3528]">
                                {model.totalProduced}
                              </td>

                              {/* Sold */}
                              <td className="py-3 px-4 text-center font-mono font-bold text-[#2D1F17]">
                                {model.totalSold}
                              </td>

                              {/* Sell Out % */}
                              <td className="py-3 px-4 text-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#F2F7F2] text-[#244E2B] border border-[#C5D8C7] shadow-xs">
                                  <strong>{model.sellOutPercent}%</strong>
                                </span>
                              </td>

                              {/* Actionable Note */}
                              <td className="py-3 px-4">
                                <div className="text-xs text-[#4A3528] leading-snug">
                                  <span className="font-bold text-[#8C6826]">
                                    [{model.collectionAction}]:{' '}
                                  </span>
                                  {model.styleOfficeNote}
                                </div>
                              </td>

                              {/* Action Icon */}
                              <td className="py-3 px-3 text-[#A69080] group-hover:text-[#8C6826] transition-colors no-print">
                                <ArrowUpRight className="w-4 h-4" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 3. IN-DEPTH / FLOP (Sell-Out < 50%) - FULL LIST */}
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#E5DAC8] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#FDF6F4] text-[#8E3B2B] border border-[#E8CDC7]">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-[#2D1F17] flex items-center gap-2">
                          3. In-Depth / Flop & Modelli Sotto-Target
                          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#EADBCE] text-[#4A3528] border border-[#D5C2B0]">
                            Sell-Out &lt; 50% ({categorySummary.flops.length} Capi)
                          </span>
                        </h3>
                        <p className="text-xs text-[#7A6455]">
                          Analisi critica di tutti i modelli con rotazione sotto target (&lt;50%) per identificare volumi, materiali o tagli da evitare per la prossima stagione.
                        </p>
                      </div>
                    </div>
                  </div>

                  {categorySummary.flops.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DAC8] text-center text-[#7A6455] text-xs font-mono">
                      Nessun flop rilevato: tutti i modelli hanno raggiunto o superato il 50% di sell-out!
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-[#E5DAC8] bg-[#FFFFFF]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#E5DAC8] bg-[#F5EFE4] text-[#4D3A2D] font-mono uppercase text-[10px] tracking-wider">
                            <th className="py-2.5 px-3 w-14">Foto</th>
                            <th className="py-2.5 px-3">Modello</th>
                            <th className="py-2.5 px-3">Silhouette / Linesheet</th>
                            <th className="py-2.5 px-3 text-center">Inserite</th>
                            <th className="py-2.5 px-3 text-center">Vendute</th>
                            <th className="py-2.5 px-3 text-center">Sell-Out %</th>
                            <th className="py-2.5 px-3">Criticità Riscontrata & Intervento Richiesto</th>
                            <th className="py-2.5 px-3 w-8 no-print"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE7DA] font-sans">
                          {categorySummary.flops.map((flop) => (
                            <tr
                              key={flop.modelName}
                              onClick={() => onSelectModel(flop)}
                              className="hover:bg-[#FAF6EE] transition-colors cursor-pointer group"
                            >
                              <td className="py-2 px-3">
                                <div className="w-10 h-13 rounded bg-[#F5EFE4] overflow-hidden border border-[#D5C2B0] flex-shrink-0">
                                  <img
                                    src={flop.imageUrl}
                                    alt={flop.modelName}
                                    className="w-full h-full object-cover grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80';
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="py-2 px-3 font-serif font-bold text-[#2D1F17] group-hover:text-[#8C6826]">
                                {flop.modelName}
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px] text-[#7A6455]">
                                {flop.silhouette} ({flop.linesheet.replace('Fw 2026 - ', '')})
                              </td>
                              <td className="py-2 px-3 text-center font-mono text-[#7A6455]">
                                {flop.totalProduced}
                              </td>
                              <td className="py-2 px-3 text-center font-mono text-[#3D291F]">
                                {flop.totalSold}
                              </td>
                              <td className="py-2 px-3 text-center font-mono font-bold">
                                <span className={flop.sellOutPercent < 20 ? 'text-[#8E3B2B]' : 'text-[#8C6826]'}>
                                  {flop.sellOutPercent}%
                                </span>
                              </td>
                              <td className="py-2 px-3 text-xs text-[#5D4A3E]">
                                {flop.sellOutPercent === 0 ? (
                                  <span className="text-[#8E3B2B] font-bold">
                                    [ZERO VENDITE] Respingimento del mercato. Ritiro immediato del cartamodello.
                                  </span>
                                ) : flop.sellOutPercent < 25 ? (
                                  <span>
                                    [FORTE SOTTOPERFORMANCE] Volume o pesantezza inadeguati. Eliminare o ripensare integralmente il fit.
                                  </span>
                                ) : (
                                  <span>
                                    [POTENZIALE INESPRESSO] Tagliare le varianti colore a zero rotazione, mantenere eventuale colore di punta.
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-[#A69080] group-hover:text-[#8C6826] transition-colors no-print">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 3b. CATALOGO INTEGRALE DI TUTTI I MODELLI DELLA CATEGORIA */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E5DAC8] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#EADBCE] text-[#4A3528] border border-[#D5C2B0]">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-[#2D1F17] flex items-center gap-2">
                          Catalogo Completo di Tutti i Modelli della Categoria
                          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#EADBCE] text-[#4A3528] border border-[#D5C2B0] font-bold">
                            {categorySummary.allModels.length} Modelli
                          </span>
                        </h3>
                        <p className="text-xs text-[#7A6455]">
                          Tutti i capi appartenenti a {categorySummary.displayName}, ordinati per Sell-Out % decrescente.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 no-print">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7A6455]" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(categorySummary.category, e.target.value)}
                          placeholder="Filtra modelli in categoria..."
                          className="pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#E5DAC8] rounded-lg text-xs font-mono text-[#2D1F17] placeholder-[#A69080] focus:outline-none focus:border-[#C5A059] w-52 shadow-xs"
                        />
                      </div>
                      <button
                        onClick={() => toggleShowAll(categorySummary.category)}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#EFE7DA] hover:bg-[#E5DAC8] text-[#3D291F] font-bold border border-[#D8CABE] flex items-center gap-1.5 transition-colors"
                      >
                        {isFullListShown ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5 text-[#3D291F]" />
                            <span>Comprimi</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5 text-[#3D291F]" />
                            <span>Espandi ({filteredAllModels.length})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {isFullListShown && (
                    <div className="overflow-x-auto rounded-xl border border-[#E5DAC8] bg-[#FFFFFF] shadow-xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#E5DAC8] bg-[#F5EFE4] text-[#4D3A2D] font-mono uppercase text-[10px] tracking-wider">
                            <th className="py-2.5 px-3 w-14">Foto</th>
                            <th className="py-2.5 px-3">Nome Modello</th>
                            <th className="py-2.5 px-3">Silhouette</th>
                            <th className="py-2.5 px-3">Linesheet</th>
                            <th className="py-2.5 px-3 text-center">Varianti</th>
                            <th className="py-2.5 px-3 text-center">Inserite</th>
                            <th className="py-2.5 px-3 text-center">Vendute</th>
                            <th className="py-2.5 px-3 text-center">Sell-Out %</th>
                            <th className="py-2.5 px-3">Status & Direttiva Ufficio Stile</th>
                            <th className="py-2.5 px-3 w-8 no-print"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE7DA] font-sans">
                          {filteredAllModels.map((model) => {
                            const isBS = model.sellOutPercent >= 50;

                            return (
                              <tr
                                key={model.modelName}
                                onClick={() => onSelectModel(model)}
                                className="hover:bg-[#FAF6EE] transition-colors cursor-pointer group"
                              >
                                <td className="py-2 px-3">
                                  <div className="w-10 h-13 rounded bg-[#F5EFE4] overflow-hidden border border-[#D5C2B0] flex-shrink-0 group-hover:border-[#C5A059] transition-colors">
                                    <img
                                      src={model.imageUrl}
                                      alt={model.modelName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80';
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="py-2 px-3 font-serif font-bold text-[#2D1F17] group-hover:text-[#8C6826] transition-colors">
                                  {model.modelName}
                                </td>
                                <td className="py-2 px-3 font-mono text-[11px] text-[#4A3528]">
                                  {model.silhouette}
                                </td>
                                <td className="py-2 px-3 font-mono text-[11px] text-[#7A6455]">
                                  {model.linesheet.replace('Fw 2026 - ', '')}
                                </td>
                                <td className="py-2 px-3 text-center font-mono text-[#4A3528]">
                                  {model.variants.length}
                                </td>
                                <td className="py-2 px-3 text-center font-mono text-[#7A6455]">
                                  {model.totalProduced}
                                </td>
                                <td className="py-2 px-3 text-center font-mono font-bold text-[#2D1F17]">
                                  {model.totalSold}
                                </td>
                                <td className="py-2 px-3 text-center font-mono font-bold">
                                  {isBS ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F2F7F2] text-[#244E2B] border border-[#C5D8C7]">
                                      {model.sellOutPercent}%
                                    </span>
                                  ) : model.sellOutPercent >= 25 ? (
                                    <span className="text-[#3D291F]">
                                      {model.sellOutPercent}%
                                    </span>
                                  ) : (
                                    <span className="text-[#8E3B2B]">
                                      {model.sellOutPercent}%
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                      model.collectionAction === 'MUST-HAVE'
                                        ? 'bg-[#F2F7F2] text-[#244E2B] border border-[#C5D8C7]'
                                        : model.collectionAction === 'EVOLUZIONE'
                                        ? 'bg-[#FAF5EC] text-[#8C6826] border border-[#E0D0B4]'
                                        : model.collectionAction === 'RIVEDERE'
                                        ? 'bg-[#FAF7F2] text-[#6D5545] border border-[#E5DAC8]'
                                        : 'bg-[#FDF6F4] text-[#8E3B2B] border border-[#E8CDC7]'
                                    }`}>
                                      {model.collectionAction}
                                    </span>
                                    <span className="text-[#5D4A3E] truncate max-w-[280px]">
                                      {model.styleOfficeNote}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-[#A69080] group-hover:text-[#8C6826] transition-colors no-print">
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 4. LINEE GUIDA DI COLLEZIONE PER LA PROSSIMA STAGIONE (Actionable Takeaways) */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-[#E5DAC8] pb-2">
                    <Sparkles className="w-4 h-4 text-[#C5A059]" />
                    <h3 className="text-base font-serif font-bold text-[#2D1F17]">
                      4. Linee Guida di Collezione per la Prossima Stagione (Actionable Takeaways)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* MUST-HAVE */}
                    <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#C5D8C7] shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#244E2B] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#2D5A34]" />
                          MUST-HAVE (Carry-over)
                        </span>
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#F2F7F2] text-[#244E2B] font-mono border border-[#C5D8C7]">
                          {categorySummary.mustHaves.length} Capi
                        </span>
                      </div>
                      <p className="text-xs text-[#5D4A3E] leading-relaxed font-sans">
                        Modelli da carry-over prioritario da riproporre uguali nella silhouette perché trainanti per il fatturato di categoria.
                      </p>
                      <div className="space-y-2 pt-2 border-t border-[#EFE7DA] max-h-60 overflow-y-auto pr-1">
                        {categorySummary.mustHaves.length === 0 ? (
                          <div className="text-[#7A6455] text-xs italic">
                            Nessun modello &gt;70% di sell-out. Utilizzare i best seller principali per carry-over.
                          </div>
                        ) : (
                          categorySummary.mustHaves.map((m) => (
                            <div
                              key={m.modelName}
                              onClick={() => onSelectModel(m)}
                              className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F5EFE4] border border-[#E5DAC8] flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="truncate mr-2">
                                <div className="text-xs font-serif font-bold text-[#2D1F17] truncate">{m.modelName}</div>
                                <div className="text-[10px] text-[#7A6455] font-mono">{m.silhouette} · {m.totalSold}/{m.totalProduced} pz</div>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-[#F2F7F2] text-[#244E2B] border border-[#C5D8C7]">
                                {m.sellOutPercent}%
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* EVOLUZIONI */}
                    <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E0D0B4] shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#8C6826] flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-[#8C6826]" />
                          EVOLUZIONI (Derivazioni)
                        </span>
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FAF5EC] text-[#8C6826] font-mono border border-[#E0D0B4]">
                          {categorySummary.evolutions.length} Capi
                        </span>
                      </div>
                      <p className="text-xs text-[#5D4A3E] leading-relaxed font-sans">
                        Modelli venduti con successo da cui derivare nuove varianti sartoriali (cambio tessuto, dettagli di scollo, lunghezze, fodere).
                      </p>
                      <div className="space-y-2 pt-2 border-t border-[#EFE7DA] max-h-60 overflow-y-auto pr-1">
                        {categorySummary.evolutions.length === 0 ? (
                          <div className="text-[#7A6455] text-xs italic">
                            Nessun modello in fascia 50-70%.
                          </div>
                        ) : (
                          categorySummary.evolutions.map((m) => (
                            <div
                              key={m.modelName}
                              onClick={() => onSelectModel(m)}
                              className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F5EFE4] border border-[#E5DAC8] flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="truncate mr-2">
                                <div className="text-xs font-serif font-bold text-[#2D1F17] truncate">{m.modelName}</div>
                                <div className="text-[10px] text-[#7A6455] font-mono">{m.silhouette} · {m.totalSold}/{m.totalProduced} pz</div>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-[#FAF5EC] text-[#8C6826] border border-[#E0D0B4]">
                                {m.sellOutPercent}%
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* DA ELIMINARE / RIVEDERE */}
                    <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E8CDC7] shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#8E3B2B] flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-[#8E3B2B]" />
                          DA ELIMINARE / RIVEDERE
                        </span>
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FDF6F4] text-[#8E3B2B] font-mono border border-[#E8CDC7]">
                          {categorySummary.toEliminateOrRevise.length} Capi
                        </span>
                      </div>
                      <p className="text-xs text-[#5D4A3E] leading-relaxed font-sans">
                        Volumi, tessuti o tagli che hanno mostrato scarso sell-out. Da depennare o revisionare drasticamente per non bloccare stock.
                      </p>
                      <div className="space-y-2 pt-2 border-t border-[#EFE7DA] max-h-60 overflow-y-auto pr-1">
                        {categorySummary.toEliminateOrRevise.map((m) => (
                          <div
                            key={m.modelName}
                            onClick={() => onSelectModel(m)}
                            className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F5EFE4] border border-[#E5DAC8] flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="truncate mr-2">
                              <div className="text-xs font-serif font-bold text-[#2D1F17] truncate">{m.modelName}</div>
                              <div className="text-[10px] text-[#7A6455] font-mono">{m.silhouette} · Sell-Out critico</div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-[#FDF6F4] text-[#8E3B2B] border border-[#E8CDC7]">
                              {m.sellOutPercent}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. SEZIONE DEDICATA: PULSANTE STAMPA & DOWNLOAD PDF CATEGORIA */}
                <div className="pt-4 border-t border-[#E5DAC8] no-print">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#FAF6EE] via-[#F6EFE3] to-[#EFE8DA] border border-[#D8CABE] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C6826] font-bold">
                          Esportazione Scheda Tecnica Categoria // Luisa Spagnoli Sell out Analisys
                        </span>
                      </div>
                      <h4 className="text-lg md:text-xl font-serif font-bold text-[#2D1F17]">
                        Stampa & Download PDF Categoria: {categorySummary.displayName.toUpperCase()}
                      </h4>
                      <p className="text-xs text-[#5D4A3E] font-sans leading-relaxed">
                        Genera il file PDF stampabile della sola categoria <strong>{categorySummary.displayName}</strong> ({categorySummary.totalStyles} modelli). Il documento include <strong>Foto del modello</strong>, <strong>Nome del modello</strong>, <strong>Pre o Main</strong> e <strong>Percentuale di Sell-Out</strong>, con ordinamento decrescente per % di sell out (dal più alto al più basso) e senza commenti.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-[#7A6455]">
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DAC8]">Foto Thumbnail</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DAC8]">Nome Modello</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DAC8]">Pre o Main</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DAC8]">% Sell-Out Decrescente</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DAC8] text-[#244E2B] font-bold">Zero Commenti</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-shrink-0">
                      <button
                        onClick={() => handleDownloadCategoryPdf(categorySummary)}
                        disabled={downloadingCat === categorySummary.category}
                        className="px-5 py-3 rounded-xl text-xs font-mono font-bold bg-[#C5A059] hover:bg-[#B68F46] text-[#2C1E18] flex items-center justify-center gap-2 transition-all shadow-sm border border-[#A67E33] disabled:opacity-50"
                        title={`Scarica PDF della categoria ${categorySummary.displayName}`}
                      >
                        {downloadingCat === categorySummary.category ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#2C1E18]" />
                            <span>Generazione PDF in corso...</span>
                          </>
                        ) : (
                          <>
                            <FileDown className="w-4 h-4 text-[#2C1E18]" />
                            <span>Scarica PDF {categorySummary.displayName.split(' ')[0]}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handlePrintCategory(categorySummary)}
                        className="px-4 py-3 rounded-xl text-xs font-mono font-semibold bg-[#EFE7DA] hover:bg-[#E5DAC8] text-[#3D291F] flex items-center justify-center gap-2 transition-colors border border-[#D8CABE]"
                        title={`Stampa scheda della categoria ${categorySummary.displayName}`}
                      >
                        <Printer className="w-4 h-4 text-[#6D5545]" />
                        <span>Stampa Scheda</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })}

      {/* Dedicated Bottom Banner when a Category is Filtered */}
      {selectedCategoryFilter !== 'ALL' && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#FFFFFF] border-2 border-[#C5A059]/40 shadow-md space-y-4 no-print">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C6826] font-bold flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
                Categoria Filtrata Attiva
              </span>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-[#2D1F17]">
                Stampa Scheda Categoria: {selectedCategoryFilter}
              </h3>
              <p className="text-xs text-[#5D4A3E]">
                Hai filtrato la categoria <strong>{selectedCategoryFilter}</strong>. Clicca sul pulsante sottostante per scaricare o stampare il file PDF con Foto del modello, Nome del modello, Pre o Main e % Sell-Out (dal più alto al più basso, senza commenti).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(() => {
                const currentCat = reportData.categories.find((c) => c.category === selectedCategoryFilter);
                if (!currentCat) return null;
                return (
                  <>
                    <button
                      onClick={() => handleDownloadCategoryPdf(currentCat)}
                      disabled={downloadingCat === currentCat.category}
                      className="px-5 py-3 rounded-xl text-xs font-mono font-bold bg-[#C5A059] hover:bg-[#B68F46] text-[#2C1E18] flex items-center gap-2 shadow-sm border border-[#A67E33] transition-all disabled:opacity-50"
                    >
                      {downloadingCat === currentCat.category ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#2C1E18]" />
                          <span>Generazione PDF...</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4 text-[#2C1E18]" />
                          <span>Scarica PDF {currentCat.displayName.split(' ')[0]}</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handlePrintCategory(currentCat)}
                      className="px-4 py-3 rounded-xl text-xs font-mono font-semibold bg-[#EFE7DA] hover:bg-[#E5DAC8] text-[#3D291F] flex items-center gap-2 border border-[#D8CABE] transition-colors"
                    >
                      <Printer className="w-4 h-4 text-[#6D5545]" />
                      <span>Stampa Scheda</span>
                    </button>
                    <button
                      onClick={() => setSelectedCategoryFilter('ALL')}
                      className="px-3.5 py-3 rounded-xl text-xs font-mono text-[#7A6455] hover:text-[#2D1F17] hover:bg-[#FAF7F2] border border-[#E5DAC8] transition-colors"
                    >
                      Mostra Tutte le Categorie
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

