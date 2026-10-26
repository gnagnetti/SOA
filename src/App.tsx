import React, { useState, useEffect } from 'react';
import { CollectionReportData, ProductModel } from './types/fashion';
import { parseCollectionData } from './utils/fashionParser';
import { Header } from './components/Header';
import { KpiRibbon } from './components/KpiRibbon';
import { ExecutiveReportView } from './components/ExecutiveReportView';
import { ProductsTableView } from './components/ProductsTableView';
import { VisualLookbookView } from './components/VisualLookbookView';
import { ColorPaletteAnalytics } from './components/ColorPaletteAnalytics';
import { ProductDetailModal } from './components/ProductDetailModal';
import { FileUploaderModal } from './components/FileUploaderModal';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  FileDown
} from 'lucide-react';
import { downloadCollectionReportPDF } from './utils/pdfExport';

const DEFAULT_FILE_URL = '/assets/aistudio/sales_con_dettagli_catalogo_CSV_6d68f280.csv';
const DEFAULT_FILE_NAME = 'sales_con_dettagli_catalogo.xlsx (FW26)';

export default function App() {
  const [reportData, setReportData] = useState<CollectionReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'REPORT' | 'TABLE' | 'LOOKBOOK' | 'ANALYTICS'>('REPORT');
  const [selectedModel, setSelectedModel] = useState<ProductModel | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const handleDownloadPdf = async () => {
    if (!reportData) return;
    setIsGeneratingPdf(true);
    try {
      await downloadCollectionReportPDF(reportData);
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Load default dataset on mount
  const loadDefaultData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(DEFAULT_FILE_URL);
      if (!response.ok) {
        throw new Error(`Impossibile caricare il file default (${response.status} ${response.statusText})`);
      }
      const text = await response.text();
      const parsed = parseCollectionData(text, DEFAULT_FILE_NAME);
      setReportData(parsed);
    } catch (err: any) {
      console.error('Error loading default collection:', err);
      setLoadError(err?.message || 'Errore durante il caricamento del file predefinito.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDefaultData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2D1F17] flex flex-col font-sans selection:bg-[#C5A059] selection:text-[#2D1F17]">
      {/* Top Header */}
      {reportData && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          reportData={reportData}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onReloadDefault={loadDefaultData}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE7DA] border border-[#D8CABE] text-[#C5A059] flex items-center justify-center animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-serif text-[#2D1F17] font-semibold">Luisa Spagnoli Sell out Analisys</h3>
              <p className="text-xs text-[#7A6455] font-mono mt-1">
                Elaborazione catalogo, calcolo Sell-Out % e mappatura categorie merceologiche
              </p>
            </div>
          </div>
        ) : loadError ? (
          <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5DAC8] text-center max-w-lg mx-auto space-y-4 my-16 shadow-md">
            <div className="w-12 h-12 rounded-full bg-[#FDF6F4] text-[#8E3B2B] flex items-center justify-center mx-auto border border-[#E8CDC7]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-serif text-[#2D1F17] font-semibold">Caricamento File Richiesto</h3>
              <p className="text-xs text-[#7A6455] mt-1">{loadError}</p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#C5A059] text-[#2D1F17] font-mono font-bold text-xs rounded-xl hover:bg-[#B68F46] transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Upload className="w-4 h-4" />
                Carica File CSV o Excel
              </button>
              <button
                onClick={loadDefaultData}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#EFE7DA] text-[#3D291F] font-mono text-xs rounded-xl hover:bg-[#E5DAC8] transition-colors border border-[#D8CABE]"
              >
                Riprova Caricamento Default
              </button>
            </div>
          </div>
        ) : reportData ? (
          <>
            {/* Luxury Editorial Hero Banner for Luisa Spagnoli Sell out Analisys */}
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#FFFFFF] via-[#FAF6EE] to-[#F5EFE3] border border-[#E5DAC8] shadow-md overflow-hidden no-print">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 text-[11px] font-serif font-bold uppercase tracking-widest rounded-full bg-[#3D291F] text-[#FAF7F2] shadow-xs">
                      Luisa Spagnoli
                    </span>
                    <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-full bg-[#EADBCE] text-[#4A3528] border border-[#D5C2B0]">
                      Sell out Analisys
                    </span>
                    <span className="text-xs text-[#7A6455] font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#8C7565]" />
                      Collezione FW26 → Piani Sviluppo FW27
                    </span>
                    <span className="text-xs text-[#244E2B] font-mono font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A34]" />
                      Best Seller &gt; 50%
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#2D1F17] font-semibold tracking-tight">
                    Luisa Spagnoli Sell out Analisys
                  </h2>

                  <p className="text-xs sm:text-sm text-[#5D4A3E] leading-relaxed font-sans">
                    Report strategico di collezione per l'Ufficio Stile. Analisi quantitativa e visiva delle rotazioni retail dei modelli e delle singole varianti colore. I dati di Sell-Out % guidano lo sviluppo di collezione per la prossima stagione, identificando i carry-over irrinunciabili, le evoluzioni di gamma e i volumi da razionalizzare.
                  </p>
                </div>

                {/* Right highlight card in warm luxury marrone & crema */}
                <div className="lg:w-80 bg-[#FFFFFF] p-5 rounded-2xl border border-[#E0D0B4] shadow-md flex flex-col justify-between space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A6455] font-semibold">Target Prioritario</span>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5F8F4] text-[#244E2B] border border-[#C5D8C7]">
                      Sell-Out &gt; 50%
                    </span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold font-mono text-[#244E2B]">
                      {reportData.bestSellersCount} <span className="text-xs font-normal text-[#7A6455]">modelli</span>
                    </div>
                    <div className="text-xs text-[#5D4A3E] mt-1 font-sans">
                      Capi con rotazione superiore al 50%: confermati per replica e sviluppo stilistico.
                    </div>
                  </div>
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="w-full py-2.5 bg-[#C5A059] hover:bg-[#B68F46] text-[#2C1E18] font-bold rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-sm border border-[#A67E33] disabled:opacity-50"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2C1E18]" />
                          <span>Elaborazione PDF...</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4 text-[#2C1E18]" />
                          <span>Scarica PDF (Varianti per Sell-Out %)</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('REPORT')}
                      className="w-full py-2 bg-[#EFE7DA] hover:bg-[#E5DAC8] text-[#3D291F] font-bold rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 transition-colors border border-[#D8CABE]"
                    >
                      <span>Vedi Report Categorie ({reportData.modelsCount} mod)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Metrics Ribbon */}
            <KpiRibbon reportData={reportData} />

            {/* Active View */}
            {activeTab === 'REPORT' && (
              <ExecutiveReportView
                reportData={reportData}
                onSelectModel={(model) => setSelectedModel(model)}
              />
            )}

            {activeTab === 'TABLE' && (
              <ProductsTableView
                reportData={reportData}
                onSelectModel={(model) => setSelectedModel(model)}
              />
            )}

            {activeTab === 'LOOKBOOK' && (
              <VisualLookbookView
                reportData={reportData}
                onSelectModel={(model) => setSelectedModel(model)}
              />
            )}

            {activeTab === 'ANALYTICS' && (
              <ColorPaletteAnalytics reportData={reportData} />
            )}
          </>
        ) : null}
      </main>

      {/* Footer in warm crema & marrone */}
      <footer className="mt-auto py-6 border-t border-[#E5DAC8] bg-[#FAF7F2] text-[#7A6455] text-xs font-mono text-center no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-serif font-bold text-sm text-[#3D291F]">
            Luisa Spagnoli // Sell out Analisys · FW 2026 / FW 2027
          </div>
          <div className="text-[#8C7565]">
            Formula Sell-Out: (Unità Vendute / Unità Inserite) × 100
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        model={selectedModel}
        onClose={() => setSelectedModel(null)}
      />

      {/* File Upload Modal */}
      <FileUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={(data) => {
          setReportData(data);
          setActiveTab('REPORT');
        }}
        onReloadDefault={loadDefaultData}
      />
    </div>
  );
}
