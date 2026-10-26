import React, { useState, useMemo } from 'react';
import { CollectionReportData, ProductModel, ColorVariant } from '../types/fashion';
import { 
  Search, 
  ArrowUpDown, 
  ChevronDown, 
  ChevronRight, 
  ArrowUpRight,
  Download,
  Layers
} from 'lucide-react';

interface ProductsTableViewProps {
  reportData: CollectionReportData;
  onSelectModel: (model: ProductModel) => void;
}

export const ProductsTableView: React.FC<ProductsTableViewProps> = ({
  reportData,
  onSelectModel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLinesheet, setSelectedLinesheet] = useState<string>('ALL');
  const [performanceFilter, setPerformanceFilter] = useState<'ALL' | 'BEST_SELLER' | 'MEDIUM' | 'FLOP' | 'ZERO'>('ALL');
  const [viewMode, setViewMode] = useState<'MODEL' | 'SKU'>('MODEL');
  const [sortField, setSortField] = useState<'sellOut' | 'sold' | 'produced' | 'name'>('sellOut');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedModelIds, setExpandedModelIds] = useState<Record<string, boolean>>({});

  const linesheets = useMemo(() => {
    const set = new Set<string>();
    reportData.allModels.forEach((m) => {
      if (m.linesheet) set.add(m.linesheet);
    });
    return Array.from(set);
  }, [reportData]);

  const toggleModelExpand = (modelName: string) => {
    setExpandedModelIds((prev) => ({
      ...prev,
      [modelName]: !prev[modelName],
    }));
  };

  const filteredModels = useMemo(() => {
    return reportData.allModels
      .filter((model) => {
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchName = model.modelName.toLowerCase().includes(q);
          const matchSilh = model.silhouette.toLowerCase().includes(q);
          const matchColors = model.variants.some((v) => v.colorCode.toLowerCase().includes(q));
          if (!matchName && !matchSilh && !matchColors) return false;
        }

        if (selectedCategory !== 'ALL' && model.category !== selectedCategory) return false;
        if (selectedLinesheet !== 'ALL' && model.linesheet !== selectedLinesheet) return false;

        if (performanceFilter === 'BEST_SELLER' && model.sellOutPercent < 50) return false;
        if (performanceFilter === 'MEDIUM' && (model.sellOutPercent < 25 || model.sellOutPercent >= 50)) return false;
        if (performanceFilter === 'FLOP' && model.sellOutPercent >= 25) return false;
        if (performanceFilter === 'ZERO' && model.totalSold > 0) return false;

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'sellOut') diff = a.sellOutPercent - b.sellOutPercent;
        else if (sortField === 'sold') diff = a.totalSold - b.totalSold;
        else if (sortField === 'produced') diff = a.totalProduced - b.totalProduced;
        else if (sortField === 'name') diff = a.modelName.localeCompare(b.modelName);

        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [reportData, searchTerm, selectedCategory, selectedLinesheet, performanceFilter, sortField, sortOrder]);

  const filteredVariants = useMemo(() => {
    return reportData.allVariants
      .filter((v) => {
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchName = v.modelName.toLowerCase().includes(q);
          const matchSilh = v.silhouette.toLowerCase().includes(q);
          const matchColor = v.colorCode.toLowerCase().includes(q);
          if (!matchName && !matchSilh && !matchColor) return false;
        }
        if (selectedCategory !== 'ALL' && v.category !== selectedCategory) return false;
        if (selectedLinesheet !== 'ALL' && v.linesheet !== selectedLinesheet) return false;
        if (performanceFilter === 'BEST_SELLER' && v.sellOutPercent < 50) return false;
        if (performanceFilter === 'MEDIUM' && (v.sellOutPercent < 25 || v.sellOutPercent >= 50)) return false;
        if (performanceFilter === 'FLOP' && v.sellOutPercent >= 25) return false;
        if (performanceFilter === 'ZERO' && v.unitsSold > 0) return false;

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'sellOut') diff = a.sellOutPercent - b.sellOutPercent;
        else if (sortField === 'sold') diff = a.unitsSold - b.unitsSold;
        else if (sortField === 'produced') diff = a.unitsProduced - b.unitsProduced;
        else if (sortField === 'name') diff = a.modelName.localeCompare(b.modelName);

        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [reportData, searchTerm, selectedCategory, selectedLinesheet, performanceFilter, sortField, sortOrder]);

  const handleSort = (field: 'sellOut' | 'sold' | 'produced' | 'name') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportFilteredCSV = () => {
    const headers = ['Modello', 'Silhouette', 'Categoria', 'Linesheet', 'Varianti', 'Inserite', 'Vendute', 'SellOutPercent', 'Status', 'IndicazioneStile'];
    const rows = filteredModels.map((m) => [
      `"${m.modelName}"`,
      `"${m.silhouette}"`,
      `"${m.category}"`,
      `"${m.linesheet}"`,
      `"${m.variants.map((v) => v.colorCode).join(' | ')}"`,
      m.totalProduced,
      m.totalSold,
      m.sellOutPercent,
      `"${m.collectionAction}"`,
      `"${m.styleOfficeNote.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LuisaSpagnoli_SellOut_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar in warm crema and beige */}
      <div className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#E5DAC8] shadow-sm space-y-4">
        {/* Row 1: Search & View Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6455]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per modello, codice colore o silhouette (es. SOGNATRICE, 0101, Jacket)..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E5DAC8] rounded-xl text-xs font-mono text-[#2D1F17] placeholder-[#A69080] focus:outline-none focus:border-[#C5A059]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6455] hover:text-[#2D1F17] text-xs font-mono"
              >
                Cancella
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-[#FAF7F2] rounded-xl border border-[#E5DAC8]">
              <button
                onClick={() => setViewMode('MODEL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  viewMode === 'MODEL'
                    ? 'bg-[#3D291F] text-[#FAF7F2] font-bold shadow-xs'
                    : 'text-[#6D5545] hover:text-[#2D1F17]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                Vista Modello ({filteredModels.length})
              </button>
              <button
                onClick={() => setViewMode('SKU')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  viewMode === 'SKU'
                    ? 'bg-[#3D291F] text-[#FAF7F2] font-bold shadow-xs'
                    : 'text-[#6D5545] hover:text-[#2D1F17]'
                }`}
              >
                Vista Varianti SKU ({filteredVariants.length})
              </button>
            </div>

            <button
              onClick={exportFilteredCSV}
              className="px-3 py-2 bg-[#EFE7DA] hover:bg-[#E5DAC8] text-[#3D291F] rounded-xl text-xs font-mono flex items-center gap-1.5 border border-[#D8CABE] transition-colors font-semibold"
              title="Esporta dati filtrati in formato CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#6D5545]" />
              <span className="hidden sm:inline">Esporta CSV</span>
            </button>
          </div>
        </div>

        {/* Row 2: Filter Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#EFE7DA]">
          {/* Category Selector */}
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-[#7A6455] font-semibold mb-1">
              Filtra Categoria Merceologica
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E5DAC8] rounded-lg text-xs font-mono text-[#2D1F17] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="ALL">Tutte le Categorie ({reportData.modelsCount})</option>
              {reportData.categories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.displayName} ({c.totalStyles} mod - {c.sellOutPercent}%)
                </option>
              ))}
            </select>
          </div>

          {/* Linesheet Selector */}
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-[#7A6455] font-semibold mb-1">
              Filtra Linesheet / Release
            </label>
            <select
              value={selectedLinesheet}
              onChange={(e) => setSelectedLinesheet(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E5DAC8] rounded-lg text-xs font-mono text-[#2D1F17] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="ALL">Tutti i Linesheet</option>
              {linesheets.map((ls) => (
                <option key={ls} value={ls}>
                  {ls}
                </option>
              ))}
            </select>
          </div>

          {/* Performance Status */}
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-[#7A6455] font-semibold mb-1">
              Performance Sell-Out
            </label>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setPerformanceFilter('ALL')}
                className={`py-1.5 text-[11px] font-mono rounded border transition-colors ${
                  performanceFilter === 'ALL'
                    ? 'bg-[#3D291F] text-[#FAF7F2] border-[#3D291F] font-bold'
                    : 'bg-[#FAF7F2] text-[#6D5545] border-[#E5DAC8] hover:text-[#2D1F17]'
                }`}
              >
                Tutti
              </button>
              <button
                onClick={() => setPerformanceFilter('BEST_SELLER')}
                className={`py-1.5 text-[11px] font-mono rounded border transition-colors ${
                  performanceFilter === 'BEST_SELLER'
                    ? 'bg-[#F2F7F2] text-[#244E2B] border-[#C5D8C7] font-bold'
                    : 'bg-[#FAF7F2] text-[#6D5545] border-[#E5DAC8] hover:text-[#244E2B]'
                }`}
                title="Sell-Out > 50%"
              >
                &gt;50%
              </button>
              <button
                onClick={() => setPerformanceFilter('MEDIUM')}
                className={`py-1.5 text-[11px] font-mono rounded border transition-colors ${
                  performanceFilter === 'MEDIUM'
                    ? 'bg-[#FAF5EC] text-[#8C6826] border-[#E0D0B4] font-bold'
                    : 'bg-[#FAF7F2] text-[#6D5545] border-[#E5DAC8] hover:text-[#8C6826]'
                }`}
                title="Sell-Out 25-50%"
              >
                25-50%
              </button>
              <button
                onClick={() => setPerformanceFilter('FLOP')}
                className={`py-1.5 text-[11px] font-mono rounded border transition-colors ${
                  performanceFilter === 'FLOP'
                    ? 'bg-[#FDF6F4] text-[#8E3B2B] border-[#E8CDC7] font-bold'
                    : 'bg-[#FAF7F2] text-[#6D5545] border-[#E5DAC8] hover:text-[#8E3B2B]'
                }`}
                title="Sell-Out < 25%"
              >
                &lt;25%
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {viewMode === 'MODEL' ? (
        <div className="rounded-2xl border border-[#E5DAC8] bg-[#FFFFFF] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5DAC8] bg-[#F5EFE4] text-[#4D3A2D] font-mono uppercase text-[11px] tracking-wider select-none">
                  <th className="py-3 px-3 w-10"></th>
                  <th className="py-3 px-3 w-16">Foto</th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:text-[#8C6826] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Modello</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#7A6455]" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Silhouette & Categoria</th>
                  <th className="py-3 px-3">Varianti Colore</th>
                  <th 
                    onClick={() => handleSort('produced')}
                    className="py-3 px-4 text-center cursor-pointer hover:text-[#8C6826] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Inserite</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#7A6455]" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('sold')}
                    className="py-3 px-4 text-center cursor-pointer hover:text-[#8C6826] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Vendute</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#7A6455]" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('sellOut')}
                    className="py-3 px-4 text-center cursor-pointer hover:text-[#8C6826] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Sell-Out %</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#7A6455]" />
                    </div>
                  </th>
                  <th className="py-3 px-4 min-w-[220px]">Direttiva Ufficio Stile</th>
                  <th className="py-3 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DA] font-sans">
                {filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#7A6455] font-mono">
                      Nessun modello corrisponde ai filtri impostati.
                    </td>
                  </tr>
                ) : (
                  filteredModels.map((model) => {
                    const isExpanded = expandedModelIds[model.modelName];
                    const isBestSeller = model.sellOutPercent >= 50;

                    return (
                      <React.Fragment key={model.modelName}>
                        <tr
                          className={`hover:bg-[#FAF6EE] transition-colors cursor-pointer ${
                            isExpanded ? 'bg-[#FAF6EE]/80' : ''
                          }`}
                        >
                          <td 
                            className="py-3 px-3 text-[#A69080] hover:text-[#2D1F17] text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModelExpand(model.modelName);
                            }}
                          >
                            {model.variants.length > 1 ? (
                              isExpanded ? (
                                <ChevronDown className="w-4 h-4 mx-auto text-[#8C6826]" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mx-auto" />
                              )
                            ) : null}
                          </td>

                          <td 
                            className="py-3 px-3"
                            onClick={() => onSelectModel(model)}
                          >
                            <div className="relative w-12 h-16 rounded bg-[#F5EFE4] overflow-hidden border border-[#D5C2B0] group-hover:border-[#C5A059] flex-shrink-0 shadow-xs">
                              <img
                                src={model.imageUrl}
                                alt={model.modelName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80';
                                }}
                              />
                            </div>
                          </td>

                          <td 
                            className="py-3 px-4"
                            onClick={() => onSelectModel(model)}
                          >
                            <div className="font-serif text-sm font-bold text-[#2D1F17] hover:text-[#8C6826] transition-colors">
                              {model.modelName}
                            </div>
                            <div className="text-[10px] text-[#7A6455] font-mono mt-0.5">
                              {model.linesheet.replace('Fw 2026 - ', '')}
                            </div>
                          </td>

                          <td 
                            className="py-3 px-4"
                            onClick={() => onSelectModel(model)}
                          >
                            <div className="font-mono text-xs text-[#2D1F17]">
                              {model.silhouette}
                            </div>
                            <div className="text-[10px] text-[#7A6455] uppercase font-mono">
                              {model.category}
                            </div>
                          </td>

                          <td 
                            className="py-3 px-3 font-mono text-[11px] text-[#4A3528]"
                            onClick={() => toggleModelExpand(model.modelName)}
                          >
                            {model.variants.length > 1 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EADBCE] text-[#4A3528] font-semibold hover:bg-[#D5C2B0]">
                                {model.variants.length} colori
                              </span>
                            ) : (
                              <span className="text-[#7A6455]">
                                {model.variants[0]?.colorCode || 'Base'}
                              </span>
                            )}
                          </td>

                          <td 
                            className="py-3 px-4 text-center font-mono text-[#4A3528]"
                            onClick={() => onSelectModel(model)}
                          >
                            {model.totalProduced}
                          </td>

                          <td 
                            className="py-3 px-4 text-center font-mono font-bold text-[#2D1F17]"
                            onClick={() => onSelectModel(model)}
                          >
                            {model.totalSold}
                          </td>

                          <td 
                            className="py-3 px-4 text-center"
                            onClick={() => onSelectModel(model)}
                          >
                            {isBestSeller ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#F2F7F2] text-[#244E2B] border border-[#C5D8C7]">
                                {model.sellOutPercent}%
                              </span>
                            ) : model.sellOutPercent >= 25 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#FAF7F2] text-[#3D291F] border border-[#E5DAC8]">
                                {model.sellOutPercent}%
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#FDF6F4] text-[#8E3B2B] border border-[#E8CDC7]">
                                {model.sellOutPercent}%
                              </span>
                            )}
                          </td>

                          <td 
                            className="py-3 px-4"
                            onClick={() => onSelectModel(model)}
                          >
                            <div className="text-xs text-[#4A3528] leading-tight">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold mr-1.5 font-mono ${
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
                              <span className="line-clamp-2 text-[#5D4A3E]">
                                {model.styleOfficeNote}
                              </span>
                            </div>
                          </td>

                          <td 
                            className="py-3 px-3 text-[#A69080] hover:text-[#8C6826] text-center"
                            onClick={() => onSelectModel(model)}
                          >
                            <ArrowUpRight className="w-4 h-4 mx-auto" />
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-[#FAF6EE] border-y border-[#E5DAC8]">
                            <td colSpan={10} className="p-4 pl-14">
                              <div className="space-y-2">
                                <div className="text-[11px] font-mono uppercase tracking-wider text-[#8C6826] font-bold flex items-center gap-1.5">
                                  <span>Dettaglio Varianti Colore per {model.modelName}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {model.variants.map((v) => (
                                    <div
                                      key={v.id}
                                      className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5DAC8] flex items-center gap-3 shadow-xs hover:border-[#C5A059] transition-colors"
                                    >
                                      <div className="w-10 h-13 rounded bg-[#F5EFE4] overflow-hidden border border-[#D5C2B0] flex-shrink-0">
                                        <img
                                          src={v.imageUrl || model.imageUrl}
                                          alt={v.colorCode}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80';
                                          }}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-mono text-xs font-bold text-[#2D1F17] truncate">
                                          Colore: {v.colorCode}
                                        </div>
                                        <div className="text-[11px] text-[#7A6455] font-mono mt-0.5">
                                          {v.unitsSold} vend. / {v.unitsProduced} ins.
                                        </div>
                                        <div className="mt-1 flex items-center justify-between">
                                          <span className={`text-xs font-bold font-mono ${
                                            v.sellOutPercent >= 50
                                              ? 'text-[#244E2B]'
                                              : v.sellOutPercent >= 25
                                              ? 'text-[#3D291F]'
                                              : 'text-[#8E3B2B]'
                                          }`}>
                                            {v.sellOutPercent}%
                                          </span>
                                          {v.sellOutPercent >= 50 && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#F2F7F2] text-[#244E2B] font-mono border border-[#C5D8C7]">
                                              TOP COLOR
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* SKU Flat View */
        <div className="rounded-2xl border border-[#E5DAC8] bg-[#FFFFFF] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5DAC8] bg-[#F5EFE4] text-[#4D3A2D] font-mono uppercase text-[11px] tracking-wider select-none">
                  <th className="py-3 px-3 w-16">Foto</th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:text-[#8C6826] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Modello</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#7A6455]" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Codice Colore</th>
                  <th className="py-3 px-4">Silhouette & Categoria</th>
                  <th className="py-3 px-4">Linesheet</th>
                  <th 
                    onClick={() => handleSort('produced')}
                    className="py-3 px-4 text-center cursor-pointer hover:text-[#8C6826] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Inserite</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#7A6455]" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('sold')}
                    className="py-3 px-4 text-center cursor-pointer hover:text-[#8C6826] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Vendute</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#7A6455]" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('sellOut')}
                    className="py-3 px-4 text-center cursor-pointer hover:text-[#8C6826] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Sell-Out %</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#7A6455]" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DA] font-sans">
                {filteredVariants.map((v) => (
                  <tr key={v.id} className="hover:bg-[#FAF6EE] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="w-11 h-14 rounded bg-[#F5EFE4] overflow-hidden border border-[#D5C2B0] shadow-xs">
                        <img
                          src={v.imageUrl}
                          alt={v.colorCode}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-serif font-bold text-[#2D1F17]">
                      {v.modelName}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#8C6826]">
                      {v.colorCode}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-mono text-[#2D1F17]">{v.silhouette}</div>
                      <div className="text-[10px] text-[#7A6455] font-mono uppercase">{v.category}</div>
                    </td>
                    <td className="py-2.5 px-4 text-[11px] font-mono text-[#7A6455]">
                      {v.linesheet}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-[#4A3528]">
                      {v.unitsProduced}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-[#2D1F17]">
                      {v.unitsSold}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold">
                      <span className={v.sellOutPercent >= 50 ? 'text-[#244E2B]' : v.sellOutPercent >= 25 ? 'text-[#3D291F]' : 'text-[#8E3B2B]'}>
                        {v.sellOutPercent}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {v.sellOutPercent >= 50 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#F2F7F2] text-[#244E2B] border border-[#C5D8C7]">
                          BEST SELLER
                        </span>
                      ) : (
                        <span className="text-[#7A6455] text-[10px] font-mono">
                          STANDARD
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
