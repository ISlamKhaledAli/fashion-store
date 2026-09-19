import type { ProductImage, Variant } from "@/types";

export type AccordionItem = {
  title: string;
  content: string;
  titleInputFocused?: boolean;
};

export type ProductFormImage = Omit<ProductImage, "id"> & {
  id?: string;
  file?: File;
  base64?: string;
};

export type ProductFeature = {
  icon: string;
  title: string;
  description: string;
};

export type ProductFormData = {
  description: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number;
  cost: number;
  categoryId: string;
  brandId: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  images: ProductFormImage[];
  variants: Partial<Variant>[];
  features: ProductFeature[];
  details: AccordionItem[];
};

export type HandleProductFieldChange = <K extends keyof ProductFormData>(
  field: K,
  value: ProductFormData[K]
) => void;

export const ACCORDION_PRESETS = ["Materials", "Care", "Shipping & Returns"];
