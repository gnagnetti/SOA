/**
 * Types and interfaces for the Fashion Merchandising & Collection Report
 */

export type MerchCategory = 
  | 'Outerwear'
  | 'Giacche'
  | 'Maglieria'
  | 'Abiti'
  | 'Pantaloni'
  | 'Gonne'
  | 'Top & Camicie'
  | 'Accessori & Gioielli';

export interface ColorVariant {
  id: string;
  modelName: string;
  colorCode: string;
  imageUrl: string;
  linesheet: string;
  silhouette: string;
  category: MerchCategory;
  unitsProduced: number; // Приход / Inserite
  unitsSold: number;     // Итого расход / Vendute
  sellOutPercent: number; // (unitsSold / unitsProduced) * 100
  isBestSeller: boolean;  // sellOutPercent >= 50%
}

export interface ProductModel {
  modelName: string;
  silhouette: string;
  category: MerchCategory;
  linesheet: string;
  imageUrl: string;
  totalProduced: number;
  totalSold: number;
  sellOutPercent: number;
  isBestSeller: boolean;
  variants: ColorVariant[];
  styleOfficeNote: string;
  collectionAction: 'MUST-HAVE' | 'EVOLUZIONE' | 'RIVEDERE' | 'DA ELIMINARE';
}

export interface CategorySummary {
  category: MerchCategory;
  displayName: string;
  italianName: string;
  description: string;
  totalStyles: number;
  totalProduced: number;
  totalSold: number;
  sellOutPercent: number;
  bestSellersCount: number;
  flopCount: number;
  overviewTwoSentences: string;
  bestSellers: ProductModel[];
  flops: ProductModel[];
  allModels: ProductModel[];
  mustHaves: ProductModel[];
  evolutions: ProductModel[];
  toEliminateOrRevise: ProductModel[];
}

export interface CollectionReportData {
  fileName: string;
  importedAt: string;
  grandTotalProduced: number;
  grandTotalSold: number;
  grandTotalSellOut: number;
  modelsCount: number;
  variantsCount: number;
  bestSellersCount: number;
  categories: CategorySummary[];
  allModels: ProductModel[];
  allVariants: ColorVariant[];
}
