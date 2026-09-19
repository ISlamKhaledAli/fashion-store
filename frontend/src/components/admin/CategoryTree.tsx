import React, { useState } from "react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Edit2,
  AlertCircle,
} from "lucide-react";
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
  itemsPerPage = 10,
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
    categories.filter((c) => c.parentId === parentId);

  const rootCategories = categories.filter((c) => !c.parentId);

  const paginatedRootCategories = rootCategories.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="flex animate-pulse items-center gap-4 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
            <div className="h-4 w-4 shrink-0 rounded bg-zinc-200" />
            <div className="h-10 w-10 shrink-0 rounded border bg-zinc-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-zinc-200" />
              <div className="h-2 w-1/4 rounded bg-zinc-200" />
            </div>
            <div className="h-6 w-16 rounded bg-zinc-200" />
          </div>
          {i === 1 && (
            <div className="ml-16 space-y-2 border-l border-zinc-100 pl-6">
              <div className="h-10 max-w-[200px] rounded-lg bg-zinc-50" />
              <div className="h-10 max-w-[200px] rounded-lg bg-zinc-50" />
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
      <div className="mt-2 ml-16 space-y-2 border-l border-zinc-100 pl-6">
        {subs.map((sub) => (
          <div
            key={sub.id}
            onClick={() => onEdit(sub)}
            className={cn(
              "group/sub flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors",
              activeCategoryId === sub.id
                ? "border border-zinc-200/50 bg-zinc-100 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <GripVertical className="h-4 w-4 text-zinc-300" />
            <p
              className={cn(
                "flex-1 text-sm",
                activeCategoryId === sub.id ? "font-bold" : ""
              )}
            >
              {sub.name}
            </p>
            {/* Using a static mock count since Category type usually doesn't have _count */}
            <span className="flex items-center pr-2 text-xs text-zinc-400 opacity-0 transition-opacity group-hover/sub:opacity-100">
              Select
            </span>
            <Edit2 className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover/sub:text-zinc-700" />
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
            "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
            isActive
              ? "border-zinc-200 bg-zinc-100"
              : "border-transparent bg-white shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:bg-zinc-50 hover:shadow-sm"
          )}
        >
          <GripVertical className="h-4 w-4 shrink-0 text-zinc-300" />

          <Button
            variant="none"
            size="none"
            type="button"
            onClick={(e: React.MouseEvent) =>
              hasChildren ? toggleExpand(cat.id, e) : undefined
            }
            className={cn(
              "-ml-1 rounded p-1 transition-colors",
              hasChildren
                ? "cursor-pointer text-zinc-500 hover:bg-zinc-200"
                : "cursor-default text-zinc-300 opacity-50"
            )}
          >
            {isExpanded && hasChildren ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          <TableImage
            src={cat.image}
            alt={cat.name}
            active={isActive}
            containerClassName="w-10 h-10 rounded-md border border-zinc-200/50 shadow-sm"
          />

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-sm",
                isActive
                  ? "font-bold text-zinc-950"
                  : "font-semibold text-zinc-900"
              )}
            >
              {cat.name}
            </p>
            <p className="truncate text-[10px] tracking-widest text-zinc-400 uppercase">
              /collections/{cat.slug || cat.name.toLowerCase()}
            </p>
          </div>

          <div className="flex items-center gap-3 text-right">
            <span className="hidden rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-500 sm:inline-block">
              {hasChildren ? "Parent Node" : "Leaf Node"}
            </span>
            <Edit2 className="h-4 w-4 text-zinc-300 transition-colors group-hover:text-zinc-600" />
          </div>
        </div>

        {isExpanded && renderSubcategories(cat.id)}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-8 shadow-[0_2px_40px_rgba(0,0,0,0.02)] transition-all duration-600">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-lg font-medium text-zinc-900">
          Category Hierarchy
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedIds(new Set())}
          >
            Collapse All
          </Button>
        </div>
      </div>

      {isLoading ? (
        renderSkeleton()
      ) : rootCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50">
            <AlertCircle className="mb-1 h-8 w-8 text-zinc-300" />
          </div>
          <h4 className="text-sm font-bold text-zinc-900">
            No collections found
          </h4>
          <p className="mt-1 mb-6 max-w-[250px] text-xs text-zinc-500">
            Initialize the catalog hierarchy by adding your first parent
            category.
          </p>
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
