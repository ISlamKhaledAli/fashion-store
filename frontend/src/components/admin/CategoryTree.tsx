import React, { useState } from "react";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import { GripVertical, ChevronDown, ChevronRight, Edit2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TableImage } from "./TableImage";

interface CategoryTreeProps {
  categories: Category[];
  activeCategoryId: string | null;
  onEdit: (category: Category) => void;
  isLoading: boolean;
  onAdd: () => void;
  page?: number;
  itemsPerPage?: number;
}

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  activeCategoryId,
  onEdit,
  isLoading,
  onAdd,
  page = 1,
  itemsPerPage = 10
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const getSubcategories = (parentId: string) => 
    categories.filter(c => c.parentId === parentId);

  const rootCategories = categories.filter(c => !c.parentId);
  
  const paginatedRootCategories = rootCategories.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex flex-col gap-2">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-50 border border-zinc-100 animate-pulse">
            <div className="w-4 h-4 bg-zinc-200 rounded shrink-0" />
            <div className="w-10 h-10 bg-zinc-200 rounded border shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-zinc-200 rounded w-1/3" />
              <div className="h-2 bg-zinc-200 rounded w-1/4" />
            </div>
            <div className="w-16 h-6 bg-zinc-200 rounded" />
          </div>
          {i === 1 && (
            <div className="ml-16 border-l border-zinc-100 pl-6 space-y-2">
              <div className="h-10 bg-zinc-50 rounded-lg max-w-[200px]" />
              <div className="h-10 bg-zinc-50 rounded-lg max-w-[200px]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSubcategories = (parentId: string) => {
    const subs = getSubcategories(parentId);
    if (subs.length === 0) return null;

    return (
      <div className="ml-16 mt-2 space-y-2 border-l border-zinc-100 pl-6">
        {subs.map(sub => (
          <div 
            key={sub.id} 
            onClick={() => onEdit(sub)}
            className={cn(
              "flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer group/sub",
              activeCategoryId === sub.id ? "bg-zinc-100 text-zinc-900 border border-zinc-200/50" : "hover:bg-zinc-50 text-zinc-600"
            )}
          >
            <GripVertical className="w-4 h-4 text-zinc-300" />
            <p className={cn(
              "text-sm flex-1",
              activeCategoryId === sub.id ? "font-bold" : ""
            )}>{sub.name}</p>
            {/* Using a static mock count since Category type usually doesn't have _count */}
            <span className="text-xs text-zinc-400 opacity-0 group-hover/sub:opacity-100 transition-opacity flex items-center pr-2">
              Select
            </span>
            <Edit2 className="w-3.5 h-3.5 text-zinc-400 group-hover/sub:text-zinc-700 transition-colors" />
          </div>
        ))}
      </div>
    );
  };

  const renderCategory = (cat: Category) => {
    const hasChildren = getSubcategories(cat.id).length > 0;
    const isExpanded = expandedIds.has(cat.id);
    const isActive = activeCategoryId === cat.id;

    return (
      <div className="group" key={cat.id}>
        <div 
          onClick={() => onEdit(cat)}
          className={cn(
            "flex items-center gap-4 p-4 rounded-lg transition-colors cursor-pointer border",
            isActive ? "bg-zinc-100 border-zinc-200" : "bg-white hover:bg-zinc-50 border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm"
          )}
        >
          <GripVertical className="text-zinc-300 shrink-0 w-4 h-4" />
          
          <Button 
            variant="none"
            size="none"
            type="button"
            onClick={(e: React.MouseEvent) => hasChildren ? toggleExpand(cat.id, e) : undefined}
            className={cn(
              "p-1 -ml-1 rounded transition-colors",
              hasChildren ? "hover:bg-zinc-200 text-zinc-500 cursor-pointer" : "text-zinc-300 cursor-default opacity-50"
            )}
          >
            {isExpanded && hasChildren ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>

          <TableImage 
            src={cat.image}
            alt={cat.name}
            active={isActive}
            containerClassName="w-10 h-10 rounded-md border border-zinc-200/50 shadow-sm"
          />

          <div className="flex-1 min-w-0">
            <p className={cn("text-sm truncate", isActive ? "font-bold text-zinc-950" : "font-semibold text-zinc-900")}>
              {cat.name}
            </p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest truncate">/collections/{cat.slug || cat.name.toLowerCase()}</p>
          </div>

          <div className="text-right flex items-center gap-3">
             <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded hidden sm:inline-block">
               {hasChildren ? "Parent Node" : "Leaf Node"}
             </span>
             <Edit2 className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
          </div>
        </div>

        {isExpanded && renderSubcategories(cat.id)}
      </div>
    );
  };

  return (
    <div className="bg-white p-8 rounded-xl transition-all duration-600 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-zinc-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-medium text-zinc-900">Category Hierarchy</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setExpandedIds(new Set())}>
            Collapse All
          </Button>
        </div>
      </div>

      {isLoading ? (
        renderSkeleton()
      ) : rootCategories.length === 0 ? (
         <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-zinc-300 mb-1" />
            </div>
            <h4 className="text-sm font-bold text-zinc-900">No collections found</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-[250px] mb-6">Initialize the catalog hierarchy by adding your first parent category.</p>
            <Button variant="primary" onClick={onAdd}>
              Initialize Collection
            </Button>
         </div>
      ) : (
        <div className="space-y-3">
          {paginatedRootCategories.map(renderCategory)}
        </div>
      )}
    </div>
  );
};
