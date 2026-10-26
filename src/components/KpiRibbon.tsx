import React from 'react';
import { CollectionReportData } from '../types/fashion';
import { TrendingUp, Flame, AlertTriangle, Layers, Award } from 'lucide-react';

interface KpiRibbonProps {
  reportData: CollectionReportData;
}

export const KpiRibbon: React.FC<KpiRibbonProps> = ({ reportData }) => {
  const topCat = [...reportData.categories].sort((a, b) => b.sellOutPercent - a.sellOutPercent)[0];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 no-print">
      {/* KPI 1: Inserite */}
      <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E8DFC8] shadow-xs">
        <div className="flex items-center justify-between text-[#7A6455]">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Unità Inserite</span>
          <Layers className="w-3.5 h-3.5 text-[#A69080]" />
        </div>
        <div className="mt-2 text-xl md:text-2xl font-bold font-mono text-[#2D1F17]">
          {reportData.grandTotalProduced.toLocaleString('it-IT')}
        </div>
        <div className="text-[10px] text-[#8C7565] font-mono mt-0.5">
          {reportData.modelsCount} stili ({reportData.variantsCount} SKU)
        </div>
      </div>

      {/* KPI 2: Vendute */}
      <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E8DFC8] shadow-xs">
        <div className="flex items-center justify-between text-[#7A6455]">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Unità Vendute</span>
          <TrendingUp className="w-3.5 h-3.5 text-[#8C6D37]" />
        </div>
        <div className="mt-2 text-xl md:text-2xl font-bold font-mono text-[#2D1F17]">
          {reportData.grandTotalSold.toLocaleString('it-IT')}
        </div>
        <div className="text-[10px] text-[#8C7565] font-mono mt-0.5">
          assorbimento retail
        </div>
      </div>

      {/* KPI 3: Sell-Out Medio */}
      <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E0D0B4] shadow-xs bg-gradient-to-br from-[#FFFFFF] to-[#FAF5EC]">
        <div className="flex items-center justify-between text-[#7A6455]">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Sell-Out Globale</span>
          <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
        </div>
        <div className="mt-2 text-xl md:text-2xl font-bold font-mono text-[#8C6826]">
          {reportData.grandTotalSellOut}%
        </div>
        <div className="text-[10px] text-[#8C7565] font-mono mt-0.5">
          (Vendute / Inserite)
        </div>
      </div>

      {/* KPI 4: Best Sellers */}
      <div className="p-4 bg-[#F5F8F4] rounded-2xl border border-[#C5D8C7] shadow-xs">
        <div className="flex items-center justify-between text-[#2D5A34]">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Best Seller (&gt;50%)</span>
          <Flame className="w-3.5 h-3.5 text-[#2D5A34]" />
        </div>
        <div className="mt-2 text-xl md:text-2xl font-bold font-mono text-[#244E2B]">
          {reportData.bestSellersCount} <span className="text-xs font-normal text-[#5B785F] font-mono">capi</span>
        </div>
        <div className="text-[10px] text-[#2D5A34] font-mono mt-0.5 font-bold">
          REPLICA E SVILUPPA
        </div>
      </div>

      {/* KPI 5: Flop / Sotto-Target */}
      <div className="p-4 bg-[#FDF6F4] rounded-2xl border border-[#E8CDC7] shadow-xs">
        <div className="flex items-center justify-between text-[#8E3B2B]">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Flop (&lt;25%)</span>
          <AlertTriangle className="w-3.5 h-3.5 text-[#8E3B2B]" />
        </div>
        <div className="mt-2 text-xl md:text-2xl font-bold font-mono text-[#7D3224]">
          {reportData.allModels.filter((m) => m.sellOutPercent < 25).length}{' '}
          <span className="text-xs font-normal text-[#A66D60] font-mono">capi</span>
        </div>
        <div className="text-[10px] text-[#8E3B2B] font-mono mt-0.5">
          rotazione critica
        </div>
      </div>

      {/* KPI 6: Top Categoria */}
      <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E8DFC8] shadow-xs">
        <div className="flex items-center justify-between text-[#7A6455]">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Top Categoria</span>
          <Award className="w-3.5 h-3.5 text-[#C5A059]" />
        </div>
        <div className="mt-2 text-base md:text-lg font-serif font-bold text-[#2D1F17] truncate">
          {topCat ? topCat.displayName.split(' ')[0] : 'N/A'}
        </div>
        <div className="text-[10px] text-[#8C6826] font-mono mt-0.5 font-bold">
          {topCat ? `${topCat.sellOutPercent}% Sell-Out` : ''}
        </div>
      </div>
    </div>
  );
};
