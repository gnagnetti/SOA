import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, X, RefreshCw } from 'lucide-react';
import { parseCollectionData, parseExcelBuffer } from '../utils/fashionParser';
import { CollectionReportData } from '../types/fashion';

interface FileUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: CollectionReportData) => void;
  onReloadDefault: () => void;
}

export const FileUploaderModal: React.FC<FileUploaderModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  onReloadDefault,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const fileName = file.name;
      const lowerName = fileName.toLowerCase();

      if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const data = parseExcelBuffer(buffer, fileName);
        onDataLoaded(data);
        onClose();
      } else if (lowerName.endsWith('.csv') || lowerName.endsWith('.txt')) {
        const text = await file.text();
        const data = parseCollectionData(text, fileName);
        onDataLoaded(data);
        onClose();
      } else {
        throw new Error('Formato non supportato. Carica un file Excel (.xlsx, .xls) o CSV (.csv).');
      }
    } catch (err: any) {
      console.error('File parse error:', err);
      setErrorMessage(err?.message || 'Errore durante la lettura del file. Verifica il formato delle colonne.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#FFFFFF] border border-[#E5DAC8] rounded-2xl shadow-2xl text-[#2D1F17] p-6 md:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5DAC8] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FAF5EC] text-[#8C6826] border border-[#E0D0B4]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif text-[#2D1F17] font-semibold">Luisa Spagnoli — Carica Dati Catalogo</h2>
              <p className="text-xs text-[#7A6455]">Supporta file Excel (.xlsx, .xls) e file CSV (.csv)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7A6455] hover:text-[#2D1F17] rounded-lg hover:bg-[#EFE7DA]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone in warm crema and beige */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#C5A059] bg-[#FAF5EC] scale-[1.01]'
              : 'border-[#D5C2B0] hover:border-[#8C6826] bg-[#FAF7F2]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 rounded-full bg-[#EFE7DA] text-[#8C6826]">
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-[#3D291F]" />
              ) : (
                <Upload className="w-6 h-6 text-[#3D291F]" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2D1F17]">
                Trascina qui il file di vendita o <span className="text-[#8C6826] underline underline-offset-2">sfoglia il tuo computer</span>
              </p>
              <p className="text-xs text-[#7A6455] mt-1 font-sans">
                Esempi: "sales_con_dettagli_catalogo.xlsx", export JOOR, o file vendite Luisa Spagnoli
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#FDF6F4] border border-[#E8CDC7] flex items-start gap-3 text-[#8E3B2B] text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Errore nel caricamento</div>
              <div className="text-[#8E3B2B] mt-0.5">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Format Guidelines */}
        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DAC8] space-y-2 text-xs text-[#4A3528]">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#8C6826] font-bold">
            Mappatura Automatica Colonne
          </div>
          <p className="text-[#6D5545] text-[11px] leading-relaxed">
            Il software analizza automaticamente le colonne modello, codice colore, immagine, silhouette, quantità prodotte/inserite (Приход) e vendute (Расход). Calcola la percentuale di Sell-Out per modello e variante e classifica i Best Seller.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              onReloadDefault();
              onClose();
            }}
            className="text-xs text-[#7A6455] hover:text-[#2D1F17] flex items-center gap-1.5 font-mono transition-colors font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#8C6826]" />
            Ripristina Dataset FW26 Originale
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-[#EFE7DA] hover:bg-[#E5DAC8] text-[#3D291F] transition-colors border border-[#D8CABE]"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};
