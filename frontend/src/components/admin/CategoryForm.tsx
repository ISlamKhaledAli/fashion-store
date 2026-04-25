import React, { useState, useEffect, useMemo } from "react";
import { Category } from "@/types";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface CategoryFormProps {
  activeCategory: Category | null;
  allCategories: Category[];
  onSave: (data: Partial<Category>) => Promise<void>;
  onCancel: () => void;
  onDelete: (id: string) => Promise<void>;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  activeCategory,
  allCategories,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentId: "",
    image: "",
    description: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeCategory) {
      setFormData({
        name: activeCategory.name || "",
        slug: activeCategory.slug || "",
        parentId: activeCategory.parentId || "",
        image: activeCategory.image || "",
        description: activeCategory.description || "",
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        parentId: "",
        image: "",
        description: "",
      });
    }
  }, [activeCategory]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!activeCategory) {
      const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
      setFormData(prev => ({ ...prev, name, slug }));
    } else {
      setFormData(prev => ({ ...prev, name }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await adminApi.uploadMedia(file);
      if (res.data.success) {
        setFormData(prev => ({ ...prev, image: res.data.data.url }));
        toast.success("Image uploaded successfully");
      }
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        parentId: formData.parentId || null,
      } as Partial<Category>);
    } finally {
      setIsSaving(false);
    }
  };

  const parentOptions = useMemo(() => {
    let list = allCategories;
    if (activeCategory) {
      const isDescendant = (catId: string, targetId: string): boolean => {
        if (catId === targetId) return true;
        const cat = allCategories.find((c) => c.id === catId);
        if (!cat?.parentId) return false;
        return isDescendant(cat.parentId, targetId);
      };
      list = allCategories.filter((c) => !isDescendant(c.id, activeCategory.id));
    }
    return list;
  }, [allCategories, activeCategory]);

  return (
    <div className="sticky top-24 bg-white p-10 rounded-xl transition-all duration-600 shadow-[0_2px_40px_rgba(0,0,0,0.04)] border border-zinc-100">
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">Category Details</h3>
        <p className="text-sm text-zinc-500 mt-2">Update information and visual representation for this collection node.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Category Name</label>
            <input 
              required
              className="w-full bg-zinc-50 border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300" 
              type="text" 
              placeholder="e.g. Apparel & Garments"
              value={formData.name}
              onChange={handleNameChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Slug</label>
            <input 
              required
              className="w-full bg-zinc-50 border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300" 
              type="text" 
              placeholder="e.g. apparel"
              value={formData.slug}
              onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Parent Category</label>
          <select 
            className="w-full bg-zinc-50 border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-zinc-900 transition-all appearance-none cursor-pointer"
            value={formData.parentId}
            onChange={(e) => setFormData(p => ({ ...p, parentId: e.target.value }))}
          >
            <option value="">None (Root Category)</option>
            {parentOptions.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Featured Image</label>
          <div className="relative group rounded-xl overflow-hidden cursor-pointer transition-all border-2 border-dashed border-zinc-200 hover:border-zinc-300">
            <label className="w-full aspect-[16/9] relative flex flex-col items-center justify-center cursor-pointer bg-zinc-50">
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
              
              {formData.image && (
                <img 
                  alt="Preview Image" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" 
                  src={formData.image} 
                />
              )}
              
              {/* Soft neutral gray gradient overlay for contrast without harshness */}
              <div className={cn(
                "absolute inset-0 transition-opacity duration-500",
                formData.image 
                  ? "bg-gradient-to-t from-zinc-800/70 via-zinc-800/20 to-transparent opacity-90 group-hover:opacity-100" 
                  : "bg-gradient-to-t from-zinc-100/50 to-transparent opacity-0 group-hover:opacity-100"
              )} />
              
              <div className="relative z-10 flex flex-col items-center justify-center">
                {isUploading ? (
                  <div className={cn(
                    "w-10 h-10 animate-spin border-2 border-t-transparent rounded-full mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]",
                    formData.image ? "border-zinc-100" : "border-zinc-400"
                  )} />
                ) : (
                  <UploadCloud className={cn(
                    "w-10 h-10 mb-4 drop-shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:brightness-110",
                    formData.image ? "text-zinc-100" : "text-zinc-400"
                  )} />
                )}
                
                {/* Airy, clean glass effect container */}
                <div className={cn(
                  "flex flex-col items-center rounded-xl px-5 py-3 shadow-sm transition-all duration-500 group-hover:shadow-md",
                  formData.image 
                    ? "backdrop-blur-md bg-zinc-800/30 border border-zinc-400/20 group-hover:bg-zinc-800/40" 
                    : "bg-white/60 backdrop-blur-sm border border-zinc-200 group-hover:bg-white/80"
                )}>
                  <p className={cn(
                    "text-sm font-semibold tracking-wide transition-colors duration-500",
                    formData.image ? "text-zinc-100" : "text-zinc-700"
                  )}>
                    {formData.image ? "Replace Header Image" : "Upload Header Image"}
                  </p>
                  <p className={cn(
                    "text-[11px] mt-1.5 font-medium tracking-wide transition-colors duration-500",
                    formData.image ? "text-zinc-300" : "text-zinc-500"
                  )}>
                    Recommended: 2400x1600px
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-6 flex items-center justify-between gap-4">
          {activeCategory ? (
            <Button 
              variant="outline"
              className="text-zinc-400 border-transparent hover:text-red-600 transition-colors" 
              type="button"
              onClick={() => {
                if (confirm("Are you sure you want to delete this category?")) {
                  onDelete(activeCategory.id);
                }
              }}
            >
              Delete Category
            </Button>
          ) : <div />}
          
          <div className="flex gap-4">
            <Button 
              variant="outline"
              className="px-6 py-2.5 text-zinc-500 font-medium hover:text-zinc-900 transition-colors" 
              type="button"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              disabled={isSaving}
              isLoading={isSaving}
              className="px-8 py-2.5 bg-zinc-900 text-white rounded-md font-medium hover:scale-[0.98] transition-transform duration-300" 
              type="submit"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
