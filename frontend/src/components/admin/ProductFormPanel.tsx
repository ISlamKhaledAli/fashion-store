"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Product, Category, Brand, Variant } from "@/types";
import { Button } from "@/components/ui/Button";
import { AdminDrawer } from "./AdminDrawer";
import { adminApi, categoryApi, brandApi } from "@/lib/api";
import { toast } from "sonner";

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
  VariantGeneratorSection,
  FeaturesSection,
  AccordionsSection,
  SearchPresenceSection,
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
    isRentable: product?.isRentable ?? false,
    rentalPrice: product?.rentalPrice ?? 0,
    securityDeposit: product?.securityDeposit ?? 0,
    maxRentalDays: product?.maxRentalDays ?? 14,
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
              isRentable: full.isRentable ?? false,
              rentalPrice: full.rentalPrice ?? 0,
              securityDeposit: full.securityDeposit ?? 0,
              maxRentalDays: full.maxRentalDays ?? 14,
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
            isRentable: product.isRentable ?? false,
            rentalPrice: product.rentalPrice ?? 0,
            securityDeposit: product.securityDeposit ?? 0,
            maxRentalDays: product.maxRentalDays ?? 14,
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
        isRentable: false,
        rentalPrice: 0,
        securityDeposit: 0,
        maxRentalDays: 14,
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

            <VariantGeneratorSection
              selectedSizes={selectedSizes}
              selectedColors={selectedColors}
              baseStock={baseStock}
              onToggleSize={toggleSize}
              onToggleColor={toggleColor}
              onAddCustomColor={addCustomColor}
              onBaseStockChange={setBaseStock}
              onGenerateVariants={generateVariants}
              variants={formData.variants}
              onVariantsChange={(variants) =>
                handleFieldChange("variants", variants)
              }
              errors={formErrors}
            />

            <FeaturesSection
              productName={formData.name}
              features={formData.features}
              onChange={(features) => handleFieldChange("features", features)}
              onGenerateAll={handleGenerateFeatures}
              isGeneratingAll={isGeneratingFeatures}
              onGenerateSingle={generateFeatureContent}
              loadingMap={featureAiLoading}
              errorMap={featureAiError}
            />

            <AccordionsSection
              productName={formData.name}
              description={formData.description}
              onDescriptionChange={(desc) =>
                handleFieldChange("description", desc)
              }
              descriptionError={formErrors?.description}
              isGeneratingDescription={isGeneratingDescription}
              generationError={generationError}
              onGenerateDescription={handleGenerateDescription}
              isGeneratingAllAccordions={isGeneratingAllAccordions}
              onGenerateAllAccordions={handleGenerateAllAccordions}
              details={formData.details}
              onDetailsChange={(details) =>
                handleFieldChange("details", details)
              }
              onGenerateSingleAccordion={generateAccordionContent}
              accordionAiLoading={accordionAiLoading}
              accordionAiError={accordionAiError}
            />

            <SearchPresenceSection
              name={formData.name}
              slug={formData.slug}
              description={formData.description}
            />
          </>
        )}
      </form>
    </AdminDrawer>
  );
};
