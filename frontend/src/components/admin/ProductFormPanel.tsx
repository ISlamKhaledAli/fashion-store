"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Trash2, ArrowRight } from "lucide-react";
import type { Product, Category, Brand, Variant } from "@/types";
import { Button } from "@/components/ui/Button";
import { AdminDrawer } from "./AdminDrawer";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { adminApi, categoryApi, brandApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProductVariantsTable } from "./ProductVariantsTable";

// --- Extracted Modular Subcomponents ---
import type {
  AccordionItem,
  ProductFormImage,
  ProductFeature,
  ProductFormData,
} from "./product-form";
import {
  ACCORDION_PRESETS,
  IdentitySection,
  PricingSection,
  MediaSection,
  FormSkeleton,
} from "./product-form";

export type {
  AccordionItem,
  ProductFormImage,
  ProductFeature,
  ProductFormData,
};
export { ACCORDION_PRESETS };

interface ProductFormPanelProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductFormPanel = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}: ProductFormPanelProps) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingFeatures, setIsGeneratingFeatures] = useState(false);
  const [isGeneratingAllAccordions, setIsGeneratingAllAccordions] =
    useState(false);
  const [generationError, setGenerationError] = useState(false);
  const [accordionAiLoading, setAccordionAiLoading] = useState<
    Record<number, boolean>
  >({});
  const [accordionAiError, setAccordionAiError] = useState<
    Record<number, boolean>
  >({});
  const [featureAiLoading, setFeatureAiLoading] = useState<
    Record<number, boolean>
  >({});
  const [featureAiError, setFeatureAiError] = useState<Record<number, boolean>>(
    {}
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Variant Generator State
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<
    { name: string; hex: string }[]
  >([]);
  const [baseStock, setBaseStock] = useState(10);

  const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const COMMON_COLORS = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Navy", hex: "#1B2A4A" },
    { name: "Grey", hex: "#808080" },
    { name: "Beige", hex: "#D2B48C" },
    { name: "Brown", hex: "#8B4513" },
    { name: "Red", hex: "#CC0000" },
    { name: "Green", hex: "#2D6A2D" },
    { name: "Blue", hex: "#1A4B8C" },
    { name: "Camel", hex: "#C19A6B" },
  ];

  const [formData, setFormData] = useState<ProductFormData>({
    description: product?.description ?? "",
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    price: product?.price ?? 0,
    comparePrice: product?.comparePrice ?? 0,
    cost: product?.cost ?? 0,
    categoryId: product?.categoryId ?? "",
    brandId: product?.brandId ?? "",
    status: (product?.status as "ACTIVE" | "DRAFT" | "ARCHIVED") || "ACTIVE",
    images: (product?.images ?? []) as ProductFormImage[],
    variants: (product?.variants ?? []) as Partial<Variant>[],
    features: (product?.features ?? []) as ProductFeature[],
    details: (product?.details ?? []) as AccordionItem[],
  });

  const flatCategoryOptions = useMemo(() => {
    const flatten = (
      cats: Category[],
      level = 0
    ): { label: string; value: string }[] => {
      return cats.reduce((acc: { label: string; value: string }[], cat) => {
        acc.push({
          label:
            level > 0 ? `${"\u00A0".repeat(level * 4)} ${cat.name}` : cat.name,
          value: cat.id,
        });
        if (cat.children && cat.children.length > 0) {
          acc.push(...flatten(cat.children, level + 1));
        }
        return acc;
      }, []);
    };
    return [{ label: "Select Category", value: "" }, ...flatten(categories)];
  }, [categories]);

  const brandOptions = useMemo(
    () => [
      { label: "Select Brand (Optional)", value: "" },
      ...brands.map((b) => ({ label: b.name, value: b.id })),
    ],
    [brands]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch meta-data (categories/brands) once when panel opens
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryApi.getAll(),
          brandApi.getAll(),
        ]);
        if (catRes.data.success) setCategories(catRes.data.data as Category[]);
        if (brandRes.data.success) setBrands(brandRes.data.data as Brand[]);
      } catch (err) {
        console.error("Failed to fetch meta data", err);
      }
    };
    if (isOpen) fetchMetadata();
  }, [isOpen]);

  useEffect(() => {
    if (product && isOpen) {
      setFetching(true);
      const fetchFullProduct = async () => {
        try {
          const res = await adminApi.getProductById(product.id);
          if (res.data.success) {
            const full = res.data.data as Product;
            setFormData({
              description: full.description ?? "",
              name: full.name,
              slug: full.slug,
              price: full.price,
              comparePrice: full.comparePrice || 0,
              cost: full.cost || 0,
              categoryId: full.categoryId,
              brandId: full.brandId,
              status:
                (full.status as "ACTIVE" | "DRAFT" | "ARCHIVED") || "ACTIVE",
              images: full.images,
              variants: full.variants,
              features: full.features || [],
              details: full.details || [],
            });
          }
        } catch (err) {
          console.error("Failed to fetch full product", err);
          // Fallback
          setFormData({
            description: product.description ?? "",
            name: product.name,
            slug: product.slug,
            price: product.price,
            comparePrice: product.comparePrice || 0,
            cost: product.cost || 0,
            categoryId: product.categoryId,
            brandId: product.brandId,
            status:
              (product.status as "ACTIVE" | "DRAFT" | "ARCHIVED") || "ACTIVE",
            images: product.images,
            variants: product.variants,
            features: product.features || [],
            details: product.details || [],
          });
        } finally {
          setFetching(false);
        }
      };
      fetchFullProduct();
    } else if (!product && isOpen) {
      setFormData({
        description: "",
        name: "",
        slug: "",
        price: 0,
        comparePrice: 0,
        cost: 0,
        categoryId: "",
        brandId: "",
        status: "ACTIVE",
        images: [],
        variants: [],
        features: [],
        details: [],
      });
      setFetching(false);
    }
  }, [product, isOpen]);

  const handleNameChange = React.useCallback((name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    setFormData((prev) => ({ ...prev, name, slug }));
  }, []);

  const handleFieldChange = React.useCallback(
    <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleGenerateDescription = async () => {
    if (!formData.name.trim()) return;

    setIsGeneratingDescription(true);
    setGenerationError(false);

    try {
      const selectedCategoryName = flatCategoryOptions
        .find((opt) => opt.value === formData.categoryId)
        ?.label?.trim();
      const selectedBrandName = brandOptions
        .find((opt) => opt.value === formData.brandId)
        ?.label?.trim();

      const colors = Array.from(
        new Set(formData.variants.map((v) => v.color?.trim()).filter(Boolean))
      ) as string[];

      const sizes = Array.from(
        new Set(formData.variants.map((v) => v.size?.trim()).filter(Boolean))
      ) as string[];

      // Convert images to base64
      const imageBase64List: string[] = [];
      for (const img of formData.images ?? []) {
        if (img.base64) {
          imageBase64List.push(img.base64);
        } else if (img.file) {
          const b64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve((reader.result as string).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(img.file!);
          });
          imageBase64List.push(b64);
        } else if (img.url) {
          // For existing images with URL only — fetch and convert
          try {
            const res = await fetch(img.url);
            const blob = await res.blob();
            const b64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve((reader.result as string).split(",")[1]);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            imageBase64List.push(b64);
          } catch {
            // skip this image if fetch fails
          }
        }
      }

      const res = await adminApi.generateDescription({
        productName: formData.name,
        category: selectedCategoryName,
        brand: selectedBrandName,
        price: formData.price,
        colors,
        sizes,
        images: imageBase64List,
      });

      const returnedDesc = res.data.description ?? res.data.data?.description;
      if (res.data.success && returnedDesc) {
        setFormData((prev) => ({
          ...prev,
          description: returnedDesc,
        }));
        toast.success("AI description generated");
      } else {
        setGenerationError(true);
      }
    } catch (err) {
      console.error("AI description generation failed:", err);
      setGenerationError(true);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const updateAccordion = (
    index: number,
    field: keyof AccordionItem,
    value: string | boolean
  ) => {
    const updated = [...(formData.details || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleFieldChange("details", updated);
  };

  const generateAccordionContent = async (index: number, title: string) => {
    if (!title.trim()) return;

    setAccordionAiLoading((prev) => ({ ...prev, [index]: true }));
    setAccordionAiError((prev) => ({ ...prev, [index]: false }));

    try {
      const selectedCategoryName = flatCategoryOptions
        .find((opt) => opt.value === formData.categoryId)
        ?.label?.trim();
      const selectedBrandName = brandOptions
        .find((opt) => opt.value === formData.brandId)
        ?.label?.trim();

      const res = await adminApi.generateAccordion({
        title,
        productName: formData.name,
        category: selectedCategoryName,
        brand: selectedBrandName,
      });

      if (res.data.success) {
        const updated = [...(formData.details || [])];
        updated[index] = { ...updated[index], content: res.data.content };
        setFormData((prev) => ({ ...prev, details: updated }));
        toast.success("AI accordion content generated");
      } else {
        setAccordionAiError((prev) => ({ ...prev, [index]: true }));
      }
    } catch (err) {
      console.error("AI accordion generation failed:", err);
      setAccordionAiError((prev) => ({ ...prev, [index]: true }));
    } finally {
      setAccordionAiLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const generateFeatureContent = async (index: number, title: string) => {
    if (!title.trim()) return;

    setFeatureAiLoading((prev) => ({ ...prev, [index]: true }));
    setFeatureAiError((prev) => ({ ...prev, [index]: false }));

    try {
      const selectedCategoryName = flatCategoryOptions
        .find((opt) => opt.value === formData.categoryId)
        ?.label?.trim();
      const selectedBrandName = brandOptions
        .find((opt) => opt.value === formData.brandId)
        ?.label?.trim();

      // We reuse the accordion generation endpoint because it does exactly what we need:
      // writes a single paragraph for a specific title in a luxurious tone.
      const res = await adminApi.generateAccordion({
        title,
        productName: formData.name,
        category: selectedCategoryName,
        brand: selectedBrandName,
      });

      if (res.data.success) {
        const updated = [...(formData.features || [])];
        updated[index] = { ...updated[index], description: res.data.content };
        setFormData((prev) => ({ ...prev, features: updated }));
        toast.success("AI feature description generated");
      } else {
        setFeatureAiError((prev) => ({ ...prev, [index]: true }));
      }
    } catch (err) {
      console.error("AI feature description generation failed:", err);
      setFeatureAiError((prev) => ({ ...prev, [index]: true }));
    } finally {
      setFeatureAiLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleGenerateFeatures = async () => {
    if (!formData.name.trim()) return;

    setIsGeneratingFeatures(true);

    try {
      const selectedCategoryName = flatCategoryOptions
        .find((opt) => opt.value === formData.categoryId)
        ?.label?.trim();
      const selectedBrandName = brandOptions
        .find((opt) => opt.value === formData.brandId)
        ?.label?.trim();

      const res = await adminApi.generateFeatures({
        productName: formData.name,
        description: formData.description,
        category: selectedCategoryName,
        brand: selectedBrandName,
      });

      if (res.data.success && res.data.features) {
        setFormData((prev) => ({ ...prev, features: res.data.features }));
        toast.success("AI showcase features generated");
      } else {
        toast.error("Failed to generate features");
      }
    } catch (err) {
      console.error("AI features generation failed:", err);
      toast.error("Generation failed");
    } finally {
      setIsGeneratingFeatures(false);
    }
  };

  const handleGenerateAllAccordions = async () => {
    if (!formData.name.trim()) return;

    setIsGeneratingAllAccordions(true);

    try {
      const selectedCategoryName = flatCategoryOptions
        .find((opt) => opt.value === formData.categoryId)
        ?.label?.trim();
      const selectedBrandName = brandOptions
        .find((opt) => opt.value === formData.brandId)
        ?.label?.trim();

      const res = await adminApi.generateAllAccordions({
        productName: formData.name,
        description: formData.description,
        category: selectedCategoryName,
        brand: selectedBrandName,
      });

      if (res.data.success && res.data.details) {
        // If there are already some accordions that are NOT empty, append or merge them?
        // Let's just append to the existing non-empty ones, or replace if empty
        const currentDetails =
          formData.details?.filter((d) => d.title.trim() || d.content.trim()) ||
          [];
        setFormData((prev) => ({
          ...prev,
          details: [...currentDetails, ...res.data.details],
        }));
        toast.success("Standard AI accordions generated");
      } else {
        toast.error("Failed to generate accordions");
      }
    } catch (err) {
      console.error("AI accordions generation failed:", err);
      toast.error("Generation failed");
    } finally {
      setIsGeneratingAllAccordions(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const tempId = `temp-${Date.now()}`;

    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        { url: previewUrl, publicId: tempId, isMain: prev.images.length === 0 },
      ],
    }));

    setLoading(true);
    try {
      const res = await adminApi.uploadMedia(file);
      if (res.data.success) {
        setFormData((prev) => ({
          ...prev,
          images: prev.images.map((img) =>
            img.publicId === tempId
              ? {
                  url: res.data.data.url,
                  publicId: res.data.data.publicId,
                  isMain: img.isMain,
                }
              : img
          ),
        }));
        toast.success("Imagery digitized successfully");
      }
    } catch (err) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.publicId !== tempId),
      }));
      toast.error("Cloud ingestion failed");
    } finally {
      setLoading(false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: { name: string; hex: string }) => {
    setSelectedColors((prev) =>
      prev.find((c) => c.name === color.name)
        ? prev.filter((c) => c.name !== color.name)
        : [...prev, color]
    );
  };

  const addCustomColor = () => {
    const nameInput = document.getElementById(
      "custom-color-name"
    ) as HTMLInputElement;
    const hexInput = document.getElementById(
      "custom-color-hex"
    ) as HTMLInputElement;
    const name = nameInput?.value;
    const hex = hexInput?.value;
    if (name && hex) {
      setSelectedColors((prev) => [...prev, { name, hex }]);
      if (nameInput) nameInput.value = "";
    }
  };

  const generateSKU = (
    productName: string,
    color: string,
    size: string
  ): string => {
    const prefix = productName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 4);
    const colorCode = color.toUpperCase().slice(0, 3);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${colorCode}-${size}-${random}`;
  };

  const generateVariants = () => {
    if (selectedSizes.length === 0 || selectedColors.length === 0) return;

    const timestamp = Date.now();
    let counter = 0;
    const generated = selectedColors.flatMap((color) =>
      selectedSizes.map((size) => ({
        id: `temp-${timestamp}-${counter++}`,
        size,
        color: color.name,
        colorHex: color.hex,
        stock: baseStock,
        sku: generateSKU(formData.name, color.name, size),
      }))
    );

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, ...generated],
    }));
    toast.success(`${generated.length} combinations manifested`);
  };

  const handleSetMain = React.useCallback((idx: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((im, i) => ({ ...im, isMain: i === idx })),
    }));
  }, []);

  const handleRemoveImage = React.useCallback((idx: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  }, []);

  const uniqueColors = useMemo(() => {
    const colors =
      formData.variants?.map((v) => v.color)?.filter(Boolean) || [];
    return [...new Set(colors)] as string[];
  }, [formData.variants]);

  const getColorHex = (colorName: string): string => {
    const variant = formData.variants?.find(
      (v) => v.color?.toLowerCase() === colorName?.toLowerCase()
    );
    return variant?.colorHex || "#ccc";
  };

  const handleImageColorChange = async (
    imageId: string,
    variantColor: string | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === imageId || img.publicId === imageId
          ? { ...img, variantColor }
          : img
      ),
    }));

    if (product?.id && imageId && !imageId.startsWith("temp-")) {
      try {
        await adminApi.updateProductImage(product.id, imageId, {
          variantColor,
        });
      } catch (err) {
        console.error("Failed to update image color:", err);
        toast.error("Failed to sync image metadata");
      }
    }
  };

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim())
      errors.name = "Title is required for the archive";
    if (!formData.categoryId)
      errors.categoryId = "Section classification required";
    // brandId is optional
    if (!formData.description.trim())
      errors.description = "Editorial copy cannot be blank";
    if (formData.price <= 0) errors.price = "Valuation must be positive";

    // Ensure variants have at least basic data if present
    formData.variants.forEach((v, idx) => {
      if (v.size && !v.sku) {
        errors[`variant_${idx}_sku`] = "SKU required for defined sizing";
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Form incomplete. Review highlighted fields.");
      return;
    }

    setLoading(true);

    // Sanitize Payload
    const sanitizedPayload = {
      ...formData,
      variants: formData.variants.filter((v) => v.size || v.color || v.sku), // Remove empty rows
      images: formData.images.filter(
        (img) => !img.publicId.startsWith("temp-")
      ), // Ensure only synced images go
      features: (formData.features || []).filter(
        (f) => f.title.trim() && f.description.trim()
      ),
      details: (formData.details || []).filter(
        (d) => d.title.trim() && d.content.trim()
      ),
    };

    try {
      if (product) {
        await adminApi.updateProduct(product.id, sanitizedPayload);
        toast.success("Catalog entry updated");
      } else {
        await adminApi.createProduct(sanitizedPayload);
        toast.success("New piece added to collection");
      }
      onSuccess();
      onClose();
    } catch (err) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 409) {
        toast.error(
          "Conflict: This SKU or Slug already exists in the archive."
        );
      } else {
        toast.error("Sync failed. Check credentials and required fields.");
      }
    } finally {
      setLoading(false);
    }
  };

  const margin = useMemo(
    () =>
      formData.price > 0
        ? (((formData.price - formData.cost) / formData.price) * 100).toFixed(0)
        : "0",
    [formData.price, formData.cost]
  );

  if (!mounted) return null;

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Refine Piece" : "New Archive"}
      subtitle={
        product
          ? `Collection Item REF: ${product.id.slice(-6).toUpperCase()}`
          : "Initiating catalog entry"
      }
      footer={
        <>
          <Button
            variant="outline"
            className="flex-1 rounded-sm py-6 text-[10px] font-black tracking-[0.2em] uppercase"
            onClick={onClose}
            disabled={fetching}
          >
            Discard
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 rounded-sm py-6 text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl shadow-black/10 transition-all hover:-translate-y-0.5"
            onClick={handleSubmit}
            isLoading={loading}
            disabled={fetching}
          >
            {product ? "Sync Archive" : "Manifest Collection"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-16">
        {fetching ? (
          <FormSkeleton />
        ) : (
          <>
            <IdentitySection
              {...formData}
              categoryOptions={flatCategoryOptions}
              brandOptions={brandOptions}
              onNameChange={handleNameChange}
              onFieldChange={handleFieldChange}
              errors={formErrors}
            />

            <PricingSection
              {...formData}
              margin={margin}
              onFieldChange={handleFieldChange}
              errors={formErrors}
            />

            <MediaSection
              images={formData.images}
              onUpload={handleImageUpload}
              onSetMain={handleSetMain}
              onRemove={handleRemoveImage}
              uniqueColors={uniqueColors}
              onColorChange={handleImageColorChange}
              getColorHex={getColorHex}
            />

            <section className="space-y-8">
              <div className="mt-6 border-t border-zinc-100 pt-10">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold tracking-widest text-zinc-900 uppercase">
                      Curate Color Palette
                    </h3>
                    <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                      Select archival shades and sizes to manifest all
                      combinations
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-8">
                {/* Size Selection */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                    Select Archival Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SIZE_OPTIONS.map((size) => (
                      <Button
                        type="button"
                        variant="none"
                        size="none"
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={cn(
                          "rounded-lg border px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-300",
                          selectedSizes.includes(size)
                            ? "scale-105 border-black bg-black text-white shadow-md"
                            : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50"
                        )}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                    Curate Color Palette
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_COLORS.map((color) => (
                      <Button
                        type="button"
                        variant="none"
                        size="none"
                        key={color.name}
                        onClick={() => toggleColor(color)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-300",
                          selectedColors.find((c) => c.name === color.name)
                            ? "scale-105 border-black bg-white text-black shadow-md"
                            : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400"
                        )}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-zinc-200"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}
                      </Button>
                    ))}
                  </div>

                  {/* Custom color input */}
                  <div className="flex gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="Custom label..."
                      className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-[10px] font-bold tracking-widest uppercase outline-none focus:ring-1 focus:ring-black"
                      id="custom-color-name"
                    />
                    <input
                      type="color"
                      className="h-10 w-10 cursor-pointer rounded-lg border border-zinc-200 p-1"
                      id="custom-color-hex"
                      defaultValue="#000000"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCustomColor}
                      className="h-10 px-4 text-[10px] font-bold tracking-widest uppercase"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Generator Action */}
                <div className="flex items-center gap-4 border-t border-zinc-100 pt-4">
                  <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2">
                    <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                      Inventory base:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={baseStock}
                      onChange={(e) =>
                        setBaseStock(parseInt(e.target.value) || 0)
                      }
                      className="w-12 border-none p-0 text-center text-xs font-bold outline-none focus:ring-0"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={generateVariants}
                    disabled={
                      selectedSizes.length === 0 || selectedColors.length === 0
                    }
                    className="h-11 flex-1 py-4 text-[10px] font-black tracking-[0.2em] uppercase shadow-xl shadow-black/5"
                  >
                    Manifest {selectedSizes.length * selectedColors.length}{" "}
                    Variations
                  </Button>
                </div>
              </div>

              <ProductVariantsTable
                variants={formData.variants}
                onChange={(variants) => handleFieldChange("variants", variants)}
                errors={formErrors}
              />
            </section>

            {/* Dynamic Showcase Features Section */}
            <section className="space-y-8">
              <div className="mt-6 border-t border-zinc-100 pt-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold tracking-widest text-zinc-900 uppercase">
                      Showcase Features
                    </h3>
                    <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                      Add dynamic storytelling cards with Material symbols
                      (shown in the Sticky Showcase)
                    </p>
                  </div>
                  <div className="group/tooltip relative flex flex-col items-end gap-1">
                    <Button
                      type="button"
                      variant="none"
                      size="none"
                      disabled={!formData.name.trim() || isGeneratingFeatures}
                      onClick={handleGenerateFeatures}
                      className={cn(
                        "flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide shadow-sm transition duration-200 hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
                        isGeneratingFeatures
                          ? "text-zinc-400"
                          : "text-zinc-700 hover:text-zinc-950"
                      )}
                    >
                      {isGeneratingFeatures ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border border-zinc-300/60 border-t-zinc-700" />
                          Generating...
                        </>
                      ) : (
                        "✦ Generate Features with AI"
                      )}
                    </Button>
                    {!formData.name.trim() && (
                      <div className="pointer-events-none absolute right-0 bottom-full z-50 mb-2 hidden rounded bg-zinc-900 px-2.5 py-1.5 text-[10px] font-bold tracking-widest whitespace-nowrap text-white uppercase shadow-lg group-hover/tooltip:block">
                        Enter a product name first
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {formData.features?.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group animate-in fade-in relative space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6 duration-300"
                  >
                    <Button
                      type="button"
                      variant="none"
                      size="none"
                      onClick={() => {
                        const nextFeatures = [...formData.features];
                        nextFeatures.splice(idx, 1);
                        handleFieldChange("features", nextFeatures);
                      }}
                      className="absolute top-4 right-4 text-zinc-400 transition-colors hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>

                    <div className="flex flex-col items-end gap-6 md:flex-row">
                      <div className="shrink-0 space-y-2">
                        <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                          Icon
                        </label>
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white transition-colors focus-within:ring-1 focus-within:ring-black hover:border-zinc-300">
                          <select
                            value={feature.icon}
                            onChange={(e) => {
                              const nextFeatures = [...formData.features];
                              nextFeatures[idx].icon = e.target.value;
                              handleFieldChange("features", nextFeatures);
                            }}
                            className="material-symbols-outlined m-0 h-full w-full cursor-pointer appearance-none border-none bg-transparent p-0 text-lg text-zinc-800 outline-none"
                            style={{
                              fontVariationSettings: "'FILL' 0, 'wght' 400",
                              textAlignLast: "center",
                              textAlign: "center",
                            }}
                          >
                            <option
                              value="eco"
                              className="material-symbols-outlined text-zinc-800"
                            >
                              eco
                            </option>
                            <option
                              value="architecture"
                              className="material-symbols-outlined text-zinc-800"
                            >
                              architecture
                            </option>
                            <option
                              value="history"
                              className="material-symbols-outlined text-zinc-800"
                            >
                              history
                            </option>
                            <option
                              value="ac_unit"
                              className="material-symbols-outlined text-zinc-800"
                            >
                              ac_unit
                            </option>
                            <option
                              value="shield"
                              className="material-symbols-outlined text-zinc-800"
                            >
                              shield
                            </option>
                            <option
                              value="auto_awesome"
                              className="material-symbols-outlined text-zinc-800"
                            >
                              auto_awesome
                            </option>
                            <option
                              value="apparel"
                              className="material-symbols-outlined text-zinc-800"
                            >
                              apparel
                            </option>
                            <option
                              value="package_2"
                              className="material-symbols-outlined text-zinc-800"
                            >
                              package_2
                            </option>
                            <option
                              value="water_drop"
                              className="material-symbols-outlined text-zinc-800"
                            >
                              water_drop
                            </option>
                            <option
                              value="local_shipping"
                              className="material-symbols-outlined text-zinc-800"
                            >
                              local_shipping
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="w-full flex-1 space-y-2">
                        <Input
                          label="Feature Title"
                          value={feature.title}
                          onChange={(e) => {
                            const nextFeatures = [...formData.features];
                            nextFeatures[idx].title = e.target.value;
                            handleFieldChange("features", nextFeatures);
                          }}
                          placeholder="e.g. Anatomical Tailoring"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                          Feature Description
                        </label>
                        <div className="group/tooltip relative flex flex-col items-start gap-1">
                          <Button
                            type="button"
                            variant="none"
                            size="none"
                            disabled={
                              !feature.title.trim() || featureAiLoading[idx]
                            }
                            onClick={() =>
                              generateFeatureContent(idx, feature.title)
                            }
                            className={cn(
                              "flex cursor-pointer items-center gap-1.5 rounded border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-sm transition duration-200 hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
                              featureAiLoading[idx]
                                ? "text-zinc-400"
                                : "text-zinc-700 hover:text-zinc-950"
                            )}
                          >
                            {featureAiLoading[idx] ? (
                              <>
                                <div className="h-2.5 w-2.5 animate-spin rounded-full border border-zinc-300/60 border-t-zinc-700" />
                                Generating...
                              </>
                            ) : (
                              "✦ Generate with AI"
                            )}
                          </Button>
                          {!feature.title.trim() && (
                            <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden rounded bg-zinc-900 px-2 py-1 text-[10px] font-bold tracking-widest whitespace-nowrap text-white uppercase shadow-lg group-hover/tooltip:block">
                              Enter a feature title first
                            </div>
                          )}
                          {featureAiError[idx] && (
                            <span className="text-[9px] leading-none font-bold tracking-wider text-red-500 uppercase">
                              Generation failed. Try again.
                            </span>
                          )}
                        </div>
                      </div>
                      <Textarea
                        value={feature.description}
                        onChange={(e) => {
                          const nextFeatures = [...formData.features];
                          nextFeatures[idx].description = e.target.value;
                          handleFieldChange("features", nextFeatures);
                        }}
                        placeholder="e.g. Sourced from the finest Italian mills..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleFieldChange("features", [
                      ...(formData.features || []),
                      { icon: "eco", title: "", description: "" },
                    ]);
                  }}
                  className="h-11 w-full py-4 text-[10px] font-black tracking-[0.2em] uppercase"
                >
                  + Add Showcase Feature Card
                </Button>
              </div>
            </section>

            {/* Dynamic Accordions Section */}
            <section className="space-y-8">
              <div className="mt-6 border-t border-zinc-100 pt-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold tracking-widest text-zinc-900 uppercase">
                      Detail Accordions
                    </h3>
                    <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                      Add custom sections for Materials, Care, Shipping, or
                      general product details
                    </p>
                  </div>
                  <div className="group/tooltip relative flex flex-col items-end gap-1">
                    <Button
                      type="button"
                      variant="none"
                      size="none"
                      disabled={
                        !formData.name.trim() || isGeneratingAllAccordions
                      }
                      onClick={handleGenerateAllAccordions}
                      className={cn(
                        "flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide shadow-sm transition duration-200 hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
                        isGeneratingAllAccordions
                          ? "text-zinc-400"
                          : "text-zinc-700 hover:text-zinc-950"
                      )}
                    >
                      {isGeneratingAllAccordions ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border border-zinc-300/60 border-t-zinc-700" />
                          Generating...
                        </>
                      ) : (
                        "✦ Generate Standard Sections with AI"
                      )}
                    </Button>
                    {!formData.name.trim() && (
                      <div className="pointer-events-none absolute right-0 bottom-full z-50 mb-2 hidden rounded bg-zinc-900 px-2.5 py-1.5 text-[10px] font-bold tracking-widest whitespace-nowrap text-white uppercase shadow-lg group-hover/tooltip:block">
                        Enter a product name first
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Permanent First Accordion Item: Editorial Description */}
                <div className="group relative space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                  <div className="flex items-center gap-3">
                    <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                      EDITORIAL DESCRIPTION
                    </label>
                    <div className="group/tooltip relative flex flex-col items-start gap-1">
                      <Button
                        type="button"
                        variant="none"
                        size="none"
                        disabled={
                          !formData.name.trim() || isGeneratingDescription
                        }
                        onClick={handleGenerateDescription}
                        className={cn(
                          "flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide shadow-sm transition duration-200 hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
                          isGeneratingDescription
                            ? "text-zinc-400"
                            : "text-zinc-700 hover:text-zinc-950"
                        )}
                      >
                        {isGeneratingDescription ? (
                          <>
                            <div className="h-3 w-3 animate-spin rounded-full border border-zinc-300/60 border-t-zinc-700" />
                            Generating...
                          </>
                        ) : (
                          "✦ Generate with AI"
                        )}
                      </Button>
                      {!formData.name.trim() && (
                        <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden rounded bg-zinc-900 px-2.5 py-1.5 text-[10px] font-bold tracking-widest whitespace-nowrap text-white uppercase shadow-lg group-hover/tooltip:block">
                          Enter a product name first
                        </div>
                      )}
                      {generationError && (
                        <span className="text-[10px] leading-none font-bold tracking-wider text-red-500 uppercase">
                          Generation failed. Try again.
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="-mt-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                    MAIN PRODUCT DESCRIPTION — ALWAYS VISIBLE ON PRODUCT PAGE
                  </p>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    rows={5}
                    placeholder="Crafted from Italian wool..."
                    error={formErrors?.description}
                    required
                  />
                </div>

                {formData.details?.map((detail, idx) => (
                  <div
                    key={idx}
                    className="group animate-in fade-in relative space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6 duration-300"
                  >
                    <Button
                      type="button"
                      variant="none"
                      size="none"
                      onClick={() => {
                        const nextDetails = [...formData.details];
                        nextDetails.splice(idx, 1);
                        handleFieldChange("details", nextDetails);
                      }}
                      className="absolute top-4 right-4 text-zinc-400 transition-colors hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                        Accordion Section Title
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          value={detail.title}
                          onChange={(e) =>
                            updateAccordion(idx, "title", e.target.value)
                          }
                          onFocus={() =>
                            updateAccordion(idx, "titleInputFocused", true)
                          }
                          onBlur={() =>
                            setTimeout(
                              () =>
                                updateAccordion(
                                  idx,
                                  "titleInputFocused",
                                  false
                                ),
                              150
                            )
                          }
                          placeholder="e.g. Care Instructions"
                          className="flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        />

                        {/* Dropdown arrow icon */}
                        <i
                          className="ti ti-chevron-down"
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "14px",
                            color: "#71717a",
                            pointerEvents: "none",
                          }}
                          aria-hidden="true"
                        />

                        {/* Dropdown list — shows on focus */}
                        {detail.titleInputFocused && (
                          <ul
                            style={{
                              position: "absolute",
                              top: "calc(100% + 4px)",
                              left: 0,
                              right: 0,
                              background: "#ffffff",
                              border: "0.5px solid #e4e4e7",
                              borderRadius: "6px",
                              zIndex: 50,
                              margin: 0,
                              padding: "4px 0",
                              listStyle: "none",
                              boxShadow:
                                "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                            }}
                          >
                            {ACCORDION_PRESETS.filter(
                              (preset) =>
                                preset
                                  .toLowerCase()
                                  .includes(detail.title.toLowerCase()) ||
                                detail.title === ""
                            ).map((preset) => (
                              <li
                                key={preset}
                                onMouseDown={() =>
                                  updateAccordion(idx, "title", preset)
                                }
                                style={{
                                  padding: "8px 12px",
                                  fontSize: "13px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  color: "#18181b",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#f4f4f5")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "transparent")
                                }
                              >
                                <span>{preset}</span>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "#71717a",
                                    border: "0.5px solid #e4e4e7",
                                    borderRadius: "4px",
                                    padding: "1px 6px",
                                  }}
                                >
                                  + add
                                </span>
                              </li>
                            ))}

                            {/* Show "Use custom: ..." if typed value is not in presets */}
                            {detail.title.trim() !== "" &&
                              !ACCORDION_PRESETS.includes(detail.title) && (
                                <li
                                  onMouseDown={() =>
                                    updateAccordion(idx, "title", detail.title)
                                  }
                                  style={{
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    color: "#71717a",
                                    borderTop: "0.5px solid #e4e4e7",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      "#f4f4f5")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      "transparent")
                                  }
                                >
                                  <span>Use: &quot;{detail.title}&quot;</span>
                                  <i
                                    className="ti ti-corner-down-left"
                                    style={{ fontSize: "13px" }}
                                    aria-hidden="true"
                                  />
                                </li>
                              )}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                          Accordion Content
                        </label>
                        <div className="group/tooltip relative flex flex-col items-start gap-1">
                          <Button
                            type="button"
                            variant="none"
                            size="none"
                            disabled={
                              !detail.title.trim() || accordionAiLoading[idx]
                            }
                            onClick={() =>
                              generateAccordionContent(idx, detail.title)
                            }
                            className={cn(
                              "flex cursor-pointer items-center gap-1.5 rounded border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-sm transition duration-200 hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
                              accordionAiLoading[idx]
                                ? "text-zinc-400"
                                : "text-zinc-700 hover:text-zinc-950"
                            )}
                          >
                            {accordionAiLoading[idx] ? (
                              <>
                                <div className="h-2.5 w-2.5 animate-spin rounded-full border border-zinc-300/60 border-t-zinc-700" />
                                Generating...
                              </>
                            ) : (
                              "✦ Generate with AI"
                            )}
                          </Button>
                          {!detail.title.trim() && (
                            <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden rounded bg-zinc-900 px-2 py-1 text-[10px] font-bold tracking-widest whitespace-nowrap text-white uppercase shadow-lg group-hover/tooltip:block">
                              Enter a section title first
                            </div>
                          )}
                          {accordionAiError[idx] && (
                            <span className="text-[9px] leading-none font-bold tracking-wider text-red-500 uppercase">
                              Generation failed. Try again.
                            </span>
                          )}
                        </div>
                      </div>
                      <Textarea
                        value={detail.content}
                        onChange={(e) => {
                          const nextDetails = [...formData.details];
                          nextDetails[idx].content = e.target.value;
                          handleFieldChange("details", nextDetails);
                        }}
                        placeholder="Detail terms and specifications..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleFieldChange("details", [
                      ...(formData.details || []),
                      { title: "", content: "" },
                    ]);
                  }}
                  className="h-11 w-full py-4 text-[10px] font-black tracking-[0.2em] uppercase"
                >
                  + Add Accordion Item
                </Button>
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-zinc-100" />
                <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                  Search Presence
                </h4>
                <div className="h-[1px] flex-1 bg-zinc-100" />
              </div>

              <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-8 shadow-inner">
                <p className="cursor-pointer truncate text-xl font-medium tracking-tight text-[#1a0dab] hover:underline">
                  {formData.name || "Product Archive Piece"} | Editorial curator
                </p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#006621]">
                  <span>thecurator.com</span>
                  <ArrowRight size={10} className="text-zinc-400" />
                  <span className="truncate">
                    {formData.slug || "item-pathway"}
                  </span>
                </div>
                <p className="line-clamp-2 font-serif text-[13px] leading-relaxed text-zinc-500 italic">
                  {formData.description ||
                    "Refining the intersection of modern utility and timeless editorial aesthetics... "}
                </p>
              </div>
            </section>
          </>
        )}
      </form>
    </AdminDrawer>
  );
};
