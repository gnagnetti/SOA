import React from 'react';
import { ProductModel } from '../types/fashion';
import { X, TrendingUp, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface ProductDetailModalProps {
  model: ProductModel | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ model, onClose }) => {
  if (!model) return null;

  const isBestSeller = model.sellOutPercent >= 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF] border border-[#E5DAC8] rounded-2xl shadow-2xl text-[#2D1F17] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#FAF6EE] border-b border-[#E5DAC8]">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-semibold tracking-wider uppercase rounded-full bg-[#EADBCE] text-[#4A3528] border border-[#D5C2B0]">
              {model.category}
            </span>
            <span className="text-xs text-[#7A6455] font-mono">
              {model.linesheet}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7A6455] hover:text-[#2D1F17] rounded-lg hover:bg-[#EFE7DA] transition-colors"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-8 bg-[#FAF7F2]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Visual thumbnail */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full aspect-[3/4] bg-[#F5EFE4] rounded-xl overflow-hidden border border-[#D5C2B0] shadow-md group">
                <img
                  src={model.imageUrl}
                  alt={model.modelName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute top-3 right-3">
                  {isBestSeller ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F2F7F2] text-[#244E2B] border border-[#C5D8C7] shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      BEST SELLER ({model.sellOutPercent}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFFFFF]/90 text-[#4A3528] border border-[#E5DAC8] shadow-sm">
                      Sell-Out {model.sellOutPercent}%
                    </span>
                  )}
                </div>
              </div>
              <a
                href={model.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 text-xs text-[#7A6455] hover:text-[#8C6826] inline-flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Apri immagine originale ad alta risoluzione
              </a>
            </div>

            {/* Details & Performance */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-widest text-[#8C6826] font-bold font-mono">
                    {model.silhouette}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif tracking-tight text-[#2D1F17] font-semibold">
                  {model.modelName}
                </h2>
                <p className="text-sm text-[#7A6455] mt-1 font-mono">
                  Linesheet: {model.linesheet}
                </p>
              </div>

              {/* KPI metrics grid */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DAC8] shadow-xs">
                <div>
                  <div className="text-xs text-[#7A6455] uppercase font-mono font-semibold">Inserite (Приход)</div>
                  <div className="text-xl font-bold text-[#2D1F17] mt-1 font-mono">{model.totalProduced}</div>
                  <div className="text-[11px] text-[#8C7565]">capi a stock</div>
                </div>
                <div>
                  <div className="text-xs text-[#7A6455] uppercase font-mono font-semibold">Vendute (Расход)</div>
                  <div className="text-xl font-bold text-[#2D1F17] mt-1 font-mono">{model.totalSold}</div>
                  <div className="text-[11px] text-[#8C7565]">assorbite</div>
                </div>
                <div>
                  <div className="text-xs text-[#7A6455] uppercase font-mono font-semibold">Sell-Out %</div>
                  <div className={`text-xl font-bold mt-1 font-mono ${isBestSeller ? 'text-[#244E2B]' : model.sellOutPercent >= 30 ? 'text-[#8C6826]' : 'text-[#8E3B2B]'}`}>
                    {model.sellOutPercent}%
                  </div>
                  <div className="text-[11px] text-[#8C7565]">conversione</div>
                </div>
              </div>

              {/* Action Directive for Style Office */}
              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DAC8] space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6826] flex items-center gap-1.5 font-mono">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Direttiva Ufficio Stile FW27
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded ${
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
                </div>
                <p className="text-sm text-[#4A3528] leading-relaxed font-sans">
                  {model.styleOfficeNote}
                </p>
              </div>

              {/* Status Note */}
              <div className="text-xs text-[#7A6455] flex items-center gap-2">
                {isBestSeller ? (
                  <span className="flex items-center gap-1.5 text-[#244E2B] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A34]" /> Modello validato per la replica in collezione principale FW27.
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#7A6455]">
                    <AlertTriangle className="w-4 h-4 text-[#8C6826]" /> Modello con rotazione sotto target (&lt;50%). Richiede analisi varianti.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown by Color Variants */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#E5DAC8] pb-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#2D1F17] font-mono">
                Dettaglio Varianti Colore ({model.variants.length} SKU)
              </h3>
              <span className="text-xs text-[#7A6455] font-mono">
                Formula Sell-Out: (Vendute / Inserite) × 100
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E5DAC8] bg-[#FFFFFF] shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5DAC8] bg-[#F5EFE4] text-[#4D3A2D] uppercase font-mono tracking-wider">
                    <th className="py-2.5 px-3">Foto</th>
                    <th className="py-2.5 px-3">Codice Colore</th>
                    <th className="py-2.5 px-3 text-center">Inserite (Приход)</th>
                    <th className="py-2.5 px-3 text-center">Vendute (Расход)</th>
                    <th className="py-2.5 px-3 text-center">Sell-Out %</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE7DA]">
                  {model.variants.map((v) => (
                    <tr key={v.id} className="hover:bg-[#FAF6EE] transition-colors">
                      <td className="py-2 px-3">
                        <div className="w-10 h-13 rounded bg-[#F5EFE4] overflow-hidden border border-[#D5C2B0] flex-shrink-0">
                          <img
                            src={v.imageUrl || model.imageUrl}
                            alt={v.colorCode}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80';
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-[#2D1F17]">
                        {v.colorCode}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[#4A3528]">
                        {v.unitsProduced}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-[#2D1F17]">
                        {v.unitsSold}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold">
                        <span className={v.sellOutPercent >= 50 ? 'text-[#244E2B]' : v.sellOutPercent >= 25 ? 'text-[#3D291F]' : 'text-[#8E3B2B]'}>
                          {v.sellOutPercent}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {v.sellOutPercent >= 50 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2F7F2] text-[#244E2B] border border-[#C5D8C7]">
                            BEST SELLER
                          </span>
                        ) : v.sellOutPercent >= 25 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-[#FAF7F2] text-[#6D5545] border border-[#E5DAC8]">
                            STANDARD
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-[#FDF6F4] text-[#8E3B2B] border border-[#E8CDC7]">
                            FLOP (&lt;25%)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 px-6 py-4 bg-[#FAF6EE] border-t border-[#E5DAC8] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold tracking-wider uppercase bg-[#3D291F] hover:bg-[#2C1E18] text-[#FAF7F2] rounded-lg transition-colors font-mono"
          >
            Chiudi Scheda
          </button>
        </div>
      </div>
    </div>
  );
};
