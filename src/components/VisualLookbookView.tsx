import React, { useState } from 'react';
import { CollectionReportData, ProductModel } from '../types/fashion';
import { CheckCircle2, Search } from 'lucide-react';

interface VisualLookbookViewProps {
  reportData: CollectionReportData;
  onSelectModel: (model: ProductModel) => void;
}

export const VisualLookbookView: React.FC<VisualLookbookViewProps> = ({
  reportData,
  onSelectModel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterBestSellersOnly, setFilterBestSellersOnly] = useState<boolean>(false);
  const [search, setSearch] = useState('');

  const filteredModels = reportData.allModels.filter((m) => {
    if (selectedCategory !== 'ALL' && m.category !== selectedCategory) return false;
    if (filterBestSellersOnly && !m.isBestSeller) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.modelName.toLowerCase().includes(q) && !m.silhouette.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter toolbar in warm crema */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-[#FFFFFF] rounded-2xl border border-[#E5DAC8] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-[#3D291F] text-[#FAF7F2] shadow-xs'
                : 'bg-[#FAF7F2] text-[#6D5545] hover:text-[#2D1F17] border border-[#E5DAC8]'
            }`}
          >
            Tutti ({reportData.modelsCount})
          </button>
          {reportData.categories.map((c) => (
            <button
              key={c.category}
              onClick={() => setSelectedCategory(c.category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                selectedCategory === c.category
                  ? 'bg-[#3D291F] text-[#FAF7F2] font-bold shadow-xs'
                  : 'bg-[#FAF7F2] text-[#6D5545] hover:text-[#2D1F17] border border-[#E5DAC8]'
              }`}
            >
              {c.displayName.split(' ')[0]} ({c.totalStyles})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterBestSellersOnly(!filterBestSellersOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border ${
              filterBestSellersOnly
                ? 'bg-[#F2F7F2] text-[#244E2B] border-[#C5D8C7] font-bold'
                : 'bg-[#FAF7F2] text-[#6D5545] border-[#E5DAC8] hover:text-[#244E2B]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Solo Best Seller (&gt;50%)
          </button>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca..."
            className="w-40 px-3 py-1.5 bg-[#FAF7F2] border border-[#E5DAC8] rounded-lg text-xs font-mono text-[#2D1F17] placeholder-[#A69080] focus:outline-none focus:border-[#C5A059]"
          />
        </div>
      </div>

      {/* Grid in warm crema/ivory cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredModels.map((model) => (
          <div
            key={model.modelName}
            onClick={() => onSelectModel(model)}
            className="group relative bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#E5DAC8] hover:border-[#C5A059] transition-all duration-300 shadow-xs cursor-pointer flex flex-col"
          >
            {/* Image Aspect Box */}
            <div className="relative aspect-[3/4] bg-[#F5EFE4] overflow-hidden">
              <img
                src={model.imageUrl}
                alt={model.modelName}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80';
                }}
              />

              {/* Badges on Image */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FAF7F2]/90 text-[#3D291F] backdrop-blur-xs border border-[#E5DAC8]">
                  {model.category.slice(0, 10)}
                </span>
                {model.isBestSeller ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#244E2B] text-[#FAF7F2] shadow-xs">
                    {model.sellOutPercent}%
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#FAF7F2]/90 text-[#6D5545] backdrop-blur-xs border border-[#E5DAC8]">
                    {model.sellOutPercent}%
                  </span>
                )}
              </div>

              {/* Action Banner */}
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-[#2D1F17]/90 via-[#2D1F17]/60 to-transparent">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#E8D19F] truncate font-bold">
                  {model.collectionAction}
                </div>
              </div>
            </div>

            {/* Model Card Info */}
            <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-xs font-bold text-[#2D1F17] truncate group-hover:text-[#8C6826] transition-colors">
                  {model.modelName}
                </h4>
                <div className="text-[10px] text-[#7A6455] font-mono truncate">
                  {model.silhouette}
                </div>
              </div>

              <div className="pt-2 border-t border-[#EFE7DA] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#7A6455]">{model.totalSold}/{model.totalProduced} pz</span>
                <span className={model.isBestSeller ? 'text-[#244E2B] font-bold' : 'text-[#7A6455]'}>
                  {model.variants.length} col.
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
