import React, { useState, useRef, useEffect } from 'react';
import { CollectionReportData, CategorySummary } from '../types/fashion';
import { FileDown, ChevronDown, RefreshCw, Layers } from 'lucide-react';
import { downloadAllModelsCleanPDF, downloadFilteredCategoryPDF } from '../utils/pdfExport';

interface PdfDownloadDropdownProps {
  reportData: CollectionReportData;
  buttonClassName?: string;
  buttonVariant?: 'primary' | 'hero';
}

export const PdfDownloadDropdown: React.FC<PdfDownloadDropdownProps> = ({
  reportData,
  buttonClassName,
  buttonVariant = 'primary',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadingTarget, setDownloadingTarget] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (categoryKey: string) => {
    setDownloadingTarget(categoryKey);
    try {
      if (categoryKey === 'ALL') {
        await downloadAllModelsCleanPDF(reportData);
      } else {
        const catSummary = reportData.categories.find((c) => c.category === categoryKey);
        if (catSummary) {
          await downloadFilteredCategoryPDF(catSummary);
        }
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloadingTarget(null);
      setIsOpen(false);
    }
  };

  const isDownloading = downloadingTarget !== null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      {buttonVariant === 'hero' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isDownloading}
          className={
            buttonClassName ||
            'w-full py-2.5 px-4 bg-[#C5A059] hover:bg-[#B68F46] text-[#2C1E18] font-bold rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-sm border border-[#A67E33] disabled:opacity-50 cursor-pointer'
          }
          title="Apri menu per scaricare il PDF (Tutti o per Categoria)"
        >
          {isDownloading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2C1E18]" />
              <span>Generazione PDF ({downloadingTarget === 'ALL' ? 'Tutti' : downloadingTarget})...</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 text-[#2C1E18]" />
              <span>Scarica PDF (Foto, Nome, Pre/Main, % Sell-Out)</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#2C1E18] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isDownloading}
          className={
            buttonClassName ||
            'px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#C5A059] hover:bg-[#B68F46] text-[#2C1E18] flex items-center gap-1.5 transition-all shadow-sm border border-[#A67E33] disabled:opacity-50 cursor-pointer'
          }
          title="Apri menu per scaricare il PDF (Tutti o per Categoria)"
        >
          {isDownloading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2C1E18]" />
              <span>Generazione PDF...</span>
            </>
          ) : (
            <>
              <FileDown className="w-3.5 h-3.5 text-[#2C1E18]" />
              <span>Scarica PDF</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#2C1E18] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#FFFFFF] border-2 border-[#D8CABE] shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
          {/* Header of dropdown in luxury marrone */}
          <div className="px-4 py-3 bg-[#3D291F] text-[#FAF7F2] border-b border-[#C5A059]/40">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold">
              Luisa Spagnoli Sell out Analisys
            </div>
            <div className="text-sm font-serif font-bold text-[#FFFFFF] mt-0.5">
              Seleziona Categoria da Scaricare
            </div>
            <div className="text-[10px] text-[#D8CABE] font-sans mt-0.5">
              Solo dati quantitativi: Foto, Nome del modello, Pre o Main e % Sell-Out (senza commenti).
            </div>
          </div>

          <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
            {/* Option: TUTTI */}
            <button
              type="button"
              onClick={() => handleSelect('ALL')}
              className="w-full text-left p-3 rounded-xl hover:bg-[#FAF6EE] border border-[#E5DAC8] hover:border-[#C5A059] transition-all flex items-center justify-between group cursor-pointer bg-[#FDFBF7]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#3D291F] text-[#E8D19F] flex items-center justify-center font-serif font-bold text-xs shadow-xs">
                  <Layers className="w-4 h-4 text-[#C5A059]" />
                </div>
                <div>
                  <div className="text-xs font-serif font-bold text-[#2D1F17] group-hover:text-[#8C6826] transition-colors">
                    Tutti (Tutta la Collezione)
                  </div>
                  <div className="text-[10px] font-mono text-[#7A6455]">
                    Tutti i {reportData.modelsCount} stili · Ordinamento Sell-Out % decrescente
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EADBCE] text-[#4A3528]">
                {reportData.grandTotalSellOut}%
              </span>
            </button>

            {/* Section Divider */}
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8C6826] font-bold">
              Oppure per singola categoria ({reportData.categories.length}):
            </div>

            {/* Individual Categories */}
            {reportData.categories.map((c) => {
              const isBest = c.sellOutPercent >= 50;
              const isLow = c.sellOutPercent < 25;
              const badgeBg = isBest ? 'bg-[#F2F7F2]' : isLow ? 'bg-[#FDF6F4]' : 'bg-[#FAF7F2]';
              const badgeText = isBest ? 'text-[#244E2B]' : isLow ? 'text-[#8E3B2B]' : 'text-[#3D291F]';
              const badgeBorder = isBest ? 'border-[#C5D8C7]' : isLow ? 'border-[#E8CDC7]' : 'border-[#E5DAC8]';

              return (
                <button
                  key={c.category}
                  type="button"
                  onClick={() => handleSelect(c.category)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#FAF6EE] border border-transparent hover:border-[#E5DAC8] transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="pr-2">
                    <div className="text-xs font-serif font-bold text-[#2D1F17] group-hover:text-[#8C6826] transition-colors">
                      {c.displayName}
                    </div>
                    <div className="text-[10px] font-mono text-[#7A6455] truncate max-w-[200px]">
                      {c.totalStyles} modelli · {c.totalSold}/{c.totalProduced} pz venduti
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badgeBg} ${badgeText} ${badgeBorder}`}
                  >
                    {c.sellOutPercent}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer note in dropdown */}
          <div className="px-4 py-2 bg-[#FAF7F2] border-t border-[#E5DAC8] text-center">
            <span className="text-[10px] font-mono text-[#7A6455]">
              Documento puro senza commenti · Ordinato dal più alto al più basso
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
