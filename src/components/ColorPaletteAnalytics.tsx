import React, { useMemo } from 'react';
import { CollectionReportData } from '../types/fashion';
import { Palette, TrendingUp, BarChart3 } from 'lucide-react';

interface ColorPaletteAnalyticsProps {
  reportData: CollectionReportData;
}

export const ColorPaletteAnalytics: React.FC<ColorPaletteAnalyticsProps> = ({ reportData }) => {
  const colorAnalytics = useMemo(() => {
    const map = new Map<string, { colorCode: string; totalProd: number; totalSold: number; count: number }>();

    for (const v of reportData.allVariants) {
      const code = v.colorCode || 'Base';
      if (!map.has(code)) {
        map.set(code, { colorCode: code, totalProd: 0, totalSold: 0, count: 0 });
      }
      const entry = map.get(code)!;
      entry.totalProd += v.unitsProduced;
      entry.totalSold += v.unitsSold;
      entry.count += 1;
    }

    return Array.from(map.values())
      .map((entry) => ({
        ...entry,
        sellOutPercent: entry.totalProd > 0 ? Math.round(((entry.totalSold / entry.totalProd) * 100) * 10) / 10 : 0,
      }))
      .filter((entry) => entry.totalProd >= 15)
      .sort((a, b) => b.sellOutPercent - a.sellOutPercent || b.totalSold - a.totalSold);
  }, [reportData]);

  const silhouetteAnalytics = useMemo(() => {
    const map = new Map<string, { silhouette: string; totalProd: number; totalSold: number; count: number }>();

    for (const m of reportData.allModels) {
      const sil = m.silhouette || 'Altro';
      if (!map.has(sil)) {
        map.set(sil, { silhouette: sil, totalProd: 0, totalSold: 0, count: 0 });
      }
      const entry = map.get(sil)!;
      entry.totalProd += m.totalProduced;
      entry.totalSold += m.totalSold;
      entry.count += 1;
    }

    return Array.from(map.values())
      .map((entry) => ({
        ...entry,
        sellOutPercent: entry.totalProd > 0 ? Math.round(((entry.totalSold / entry.totalProd) * 100) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.totalSold - a.totalSold);
  }, [reportData]);

  return (
    <div className="space-y-8">
      {/* Editorial Intro in warm crema */}
      <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E5DAC8] shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#8C6826]" />
          <h2 className="text-xl font-serif text-[#2D1F17] font-semibold">
            Luisa Spagnoli — Analisi Palette Colori & Silhouette FW27
          </h2>
        </div>
        <p className="text-sm text-[#5D4A3E] leading-relaxed font-sans">
          Analisi quantitativa della rotazione per codice colore e tipologia di silhouette per indirizzare l'Ufficio Stile sulla concentrazione delle varianti in fase di campionamento. Razionalizzare i codici a bassa rotazione permette di incrementare la marginalità industriale e l'efficienza dei tagli di tessuto.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colors Ranking */}
        <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E5DAC8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFE7DA] pb-3">
            <h3 className="font-serif text-base text-[#2D1F17] font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#244E2B]" />
              Codici Colore per Performance di Sell-Out
            </h3>
            <span className="text-[11px] font-mono text-[#7A6455]">
              Min. 15 pz inseriti
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {colorAnalytics.slice(0, 15).map((col, idx) => (
              <div
                key={col.colorCode}
                className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DAC8] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center font-mono text-xs text-[#7A6455] font-bold">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-mono text-xs font-bold text-[#2D1F17]">
                      Cod. {col.colorCode}
                    </div>
                    <div className="text-[10px] text-[#7A6455] font-mono">
                      {col.count} modelli applicati · {col.totalSold} / {col.totalProd} pz
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    col.sellOutPercent >= 50
                      ? 'bg-[#F2F7F2] text-[#244E2B] border border-[#C5D8C7]'
                      : col.sellOutPercent >= 30
                      ? 'bg-[#FAF5EC] text-[#8C6826] border border-[#E0D0B4]'
                      : 'bg-[#FAF7F2] text-[#7A6455] border border-[#E5DAC8]'
                  }`}>
                    {col.sellOutPercent}%
                  </span>
                  <div className="w-24 bg-[#EFE7DA] rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className={`h-full ${
                        col.sellOutPercent >= 50
                          ? 'bg-[#244E2B]'
                          : col.sellOutPercent >= 30
                          ? 'bg-[#8C6826]'
                          : 'bg-[#A69080]'
                      }`}
                      style={{ width: `${Math.min(col.sellOutPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Silhouettes Ranking */}
        <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E5DAC8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFE7DA] pb-3">
            <h3 className="font-serif text-base text-[#2D1F17] font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#8C6826]" />
              Volumi per Tipologia Silhouette
            </h3>
            <span className="text-[11px] font-mono text-[#7A6455]">
              Ordinato per Unità Vendute
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {silhouetteAnalytics.map((sil, idx) => (
              <div
                key={sil.silhouette}
                className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DAC8] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center font-mono text-xs text-[#7A6455] font-bold">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-serif text-sm font-bold text-[#2D1F17]">
                      {sil.silhouette}
                    </div>
                    <div className="text-[10px] text-[#7A6455] font-mono">
                      {sil.count} modelli a catalogo · {sil.totalSold} pz venduti
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[#2D1F17]">
                    {sil.sellOutPercent}% Sell-Out
                  </div>
                  <div className="text-[10px] text-[#7A6455] font-mono">
                    {sil.totalProd} prodotte
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
