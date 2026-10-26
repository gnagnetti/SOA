import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Printer, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Layers, 
  LayoutGrid, 
  BarChart3, 
  FileText,
  RefreshCw,
  FileDown
} from 'lucide-react';
import { generateMarkdownReport } from '../utils/markdownReportGenerator';
import { downloadCollectionReportPDF } from '../utils/pdfExport';
import { CollectionReportData } from '../types/fashion';

interface HeaderProps {
  activeTab: 'REPORT' | 'TABLE' | 'LOOKBOOK' | 'ANALYTICS';
  setActiveTab: (tab: 'REPORT' | 'TABLE' | 'LOOKBOOK' | 'ANALYTICS') => void;
  reportData: CollectionReportData;
  onOpenUploadModal: () => void;
  onReloadDefault: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  reportData,
  onOpenUploadModal,
  onReloadDefault,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleCopyReport = () => {
    const md = generateMarkdownReport(reportData);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadCollectionReportPDF(reportData);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 border-b border-[#E8DEC8] backdrop-blur-md shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Brand Bar */}
        <div className="flex items-center justify-between py-4 border-b border-[#E8DEC8]">
          <div className="flex items-center gap-3.5">
            {/* Luisa Spagnoli Monogram */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#3D291F] via-[#523A2C] to-[#6E4F3D] text-[#E8D19F] font-serif font-bold text-2xl flex items-center justify-center shadow-md border border-[#C5A059]/40 tracking-wider">
              LS
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-serif tracking-tight text-[#2D1F17] font-semibold">
                  Luisa Spagnoli
                </h1>
                <span className="text-[11px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#EADBCE] text-[#4A3528] border border-[#D5C2B0] font-bold">
                  Sell out Analisys
                </span>
              </div>
              <p className="text-xs text-[#7A6455] font-serif italic mt-0.5">
                Executive Collection Merchandising Report — Ufficio Stile & Analisi Vendite
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Scarica PDF Button in warm Gold */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#C5A059] hover:bg-[#B68F46] text-[#2C1E18] flex items-center gap-1.5 transition-all shadow-sm border border-[#A67E33] disabled:opacity-50"
              title="Scarica il PDF con le varianti colore ordinate dal più alto al più basso per % di Sell-Out (senza commenti)"
            >
              {isDownloadingPdf ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2C1E18]" />
                  <span>Generazione PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-[#2C1E18]" />
                  <span>Scarica PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#EFE7DA] hover:bg-[#E5DAC8] text-[#3D291F] border border-[#D8CABE] flex items-center gap-1.5 transition-colors shadow-xs"
              title="Copia il report in formato Markdown per l'Ufficio Stile"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#3D291F]" />
                  <span className="text-[#3D291F] font-semibold">Copiato!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#6D5545]" />
                  <span className="hidden sm:inline">Copia MD</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#EFE7DA] hover:bg-[#E5DAC8] text-[#3D291F] border border-[#D8CABE] flex items-center gap-1.5 transition-colors shadow-xs"
              title="Stampa o Salva in formato PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#6D5545]" />
              <span className="hidden sm:inline">Stampa</span>
            </button>

            <button
              onClick={onOpenUploadModal}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#3D291F] hover:bg-[#2C1E18] text-[#FAF7F2] flex items-center gap-1.5 transition-colors shadow-sm"
              title="Carica un nuovo file Excel o CSV"
            >
              <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Carica File</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation in warm neutrals */}
        <div className="flex items-center justify-between overflow-x-auto py-2.5">
          <nav className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setActiveTab('REPORT')}
              className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all ${
                activeTab === 'REPORT'
                  ? 'bg-[#3D291F] text-[#FAF7F2] font-bold shadow-xs'
                  : 'text-[#6D5545] hover:text-[#2D1F17] hover:bg-[#EFE7DA]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>1. Report Esecutivo Categorie</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#C5A059]/30 text-[#FAF7F2]">
                Priorità
              </span>
            </button>

            <button
              onClick={() => setActiveTab('TABLE')}
              className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all ${
                activeTab === 'TABLE'
                  ? 'bg-[#3D291F] text-[#FAF7F2] font-bold shadow-xs'
                  : 'text-[#6D5545] hover:text-[#2D1F17] hover:bg-[#EFE7DA]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>2. Matrice Prodotti & Ricerca ({reportData.modelsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('LOOKBOOK')}
              className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all ${
                activeTab === 'LOOKBOOK'
                  ? 'bg-[#3D291F] text-[#FAF7F2] font-bold shadow-xs'
                  : 'text-[#6D5545] hover:text-[#2D1F17] hover:bg-[#EFE7DA]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>3. Lookbook Visivo</span>
            </button>

            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all ${
                activeTab === 'ANALYTICS'
                  ? 'bg-[#3D291F] text-[#FAF7F2] font-bold shadow-xs'
                  : 'text-[#6D5545] hover:text-[#2D1F17] hover:bg-[#EFE7DA]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>4. Palette Colori & Silhouette</span>
            </button>
          </nav>

          <div className="text-[11px] font-mono text-[#7A6455] hidden lg:flex items-center gap-2 pl-4">
            <span>File attivo:</span>
            <span className="text-[#3D291F] font-bold truncate max-w-[180px]">{reportData.fileName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
