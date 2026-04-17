"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, MoreVertical, Edit2, Trash2, 
  ChevronRight, ChevronDown, ImageIcon, GripVertical,
  LayoutGrid, List, AlertCircle, Image as LucideImage
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import { CategoryDrawer } from "@/components/admin/CategoryDrawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { adminApi } from "@/lib/api";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const flattenCategories = (categories: Category[], level = 0): (Category & { level: number })[] => {
  return categories.reduce((acc: (Category & { level: number })[], category) => {
    acc.push({ ...category, level });
    if (category.children && category.children.length > 0) {
      acc.push(...flattenCategories(category.children, level + 1));
    }
    return acc;
  }, []);
};

const buildTree = (flat: Category[]): Category[] => {
  const map = new Map<string, Category>(flat.map(c => [c.id, { ...c, children: [] }]));
  const root: Category[] = [];
  map.forEach(c => {
    if (c.parentId) {
      if (map.has(c.parentId)) map.get(c.parentId)!.children!.push(c);
      else root.push(c);
    } else {
      root.push(c);
    }
  });

  const sortTree = (cats: Category[]) => {
    cats.sort((a,b) => (a.position || 0) - (b.position || 0));
    cats.forEach(c => c.children && sortTree(c.children));
  };
  sortTree(root);

  return root;
};

// Extracted Sortable Row Component
function SortableCategoryRow({ 
  category, 
  level, 
  isLast, 
  hasChildren, 
  isExpanded, 
  onToggleExpand, 
  onEdit, 
  onDelete 
}: {
  category: Category & { level: number };
  level: number;
  isLast: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      onClick={() => onEdit(category)}
      className={cn(
        "group border-b border-zinc-100 last:border-none transition-all duration-300",
        isDragging ? "bg-zinc-50 z-50 relative shadow-md scale-[1.01]" : "hover:bg-zinc-50 bg-white cursor-pointer"
      )}
    >
      <td className="py-4 px-6 relative">
        <div 
          className="flex items-center gap-3" 
          style={{ paddingLeft: `${level * 28}px` }}
        >
          {/* Drag Handle */}
          <div 
            {...attributes} 
            {...listeners} 
            className={cn(
              "text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing p-1 rounded transition-colors",
              isDragging && "text-zinc-600"
            )}
          >
            <GripVertical size={16} />
          </div>

          {hasChildren ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(category.id);
              }}
              className="w-5 h-5 flex items-center justify-center rounded bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-colors shadow-sm"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-5" />
          )}
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] border border-zinc-200 bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center shadow-sm relative group-hover:border-zinc-300 transition-colors">
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <LucideImage size={16} className="text-zinc-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-zinc-950 group-hover:text-zinc-900">{category.name}</p>
                {level === 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-500">ROOT</span>
                )}
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">/{category.slug}</p>
            </div>
          </div>
        </div>
        
        {level > 0 && (
          <div 
            className="absolute left-[24px] top-0 bottom-0 w-px bg-zinc-200"
            style={{ 
              left: `${(level - 1) * 28 + 64}px`, // Adjusted for drag handle space
              bottom: isLast && !hasChildren ? '50%' : '0' 
            }}
          />
        )}
        {level > 0 && (
          <div 
            className="absolute w-4 h-px bg-zinc-200 top-1/2 -translate-y-1/2"
            style={{ left: `${(level - 1) * 28 + 64}px` }}
          />
        )}
      </td>

      <td className="py-4 px-6 text-sm text-zinc-600 font-medium whitespace-nowrap">
        {category._count?.products || 0} <span className="text-zinc-400 font-normal">Products</span>
      </td>

      <td className="py-4 px-6 whitespace-nowrap">
        <StatusBadge status={category.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
      </td>

      <td className="py-4 px-6 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            className="h-8 w-8 p-0 rounded-lg hover:scale-110 active:scale-95 transition-all"
          >
            <Edit2 size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete(category); }}
            className="h-8 w-8 p-0 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 border-transparent hover:border-red-100 hover:scale-110 active:scale-95 transition-all"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getCategories();
      if (res.data?.success) {
        const flatCategories = res.data.data as Category[];
        const tree = buildTree(flatCategories);
        setCategories(tree);
        
        if (expandedIds.size === 0) {
          setExpandedIds(new Set(tree.map(c => c.id)));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const extractIds = (cats: Category[]) => {
      cats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          allIds.add(cat.id);
          extractIds(cat.children);
        }
      });
    };
    extractIds(categories);
    setExpandedIds(allIds);
  };

  const collapseAll = () => setExpandedIds(new Set());

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const searchLower = searchQuery.toLowerCase();
    const searchRecursive = (cats: Category[]): Category[] => {
      return cats.map(cat => {
        const matchesName = cat.name.toLowerCase().includes(searchLower);
        const matchesSlug = cat.slug.toLowerCase().includes(searchLower);
        const children = cat.children ? searchRecursive(cat.children) : [];
        if (matchesName || matchesSlug || children.length > 0) {
          return { ...cat, children: children.length > 0 ? children : cat.children };
        }
        return null;
      }).filter(Boolean) as Category[];
    };
    return searchRecursive(categories);
  }, [categories, searchQuery]);

  const allFlatCategories = flattenCategories(categories);

  // Derive flat list of visible rendered rows from the filtered nested tree
  const visibleRows = useMemo(() => {
    const rows: (Category & { level: number })[] = [];
    const traverse = (cats: Category[], level: number) => {
      cats.forEach((cat) => {
        rows.push({ ...cat, level });
        const isExpanded = expandedIds.has(cat.id) || searchQuery.length > 0;
        if (isExpanded && cat.children && cat.children.length > 0) {
          traverse(cat.children, level + 1);
        }
      });
    };
    traverse(filteredCategories, 0);
    return rows;
  }, [filteredCategories, expandedIds, searchQuery]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeItem = visibleRows.find(r => r.id === active.id);
    const overItem = visibleRows.find(r => r.id === over.id);

    if (!activeItem || !overItem) return;

    // Safety constraint: only allow dragging items that share the exact same parentId
    if (activeItem.parentId !== overItem.parentId) {
      toast.error("Can only reorder categories within the same parent level.");
      return;
    }

    // Optimistically update the UI visually
    const itemsInSameLevel = allFlatCategories.filter(c => c.parentId === activeItem.parentId).sort((a,b) => (a.position||0) - (b.position||0));
    
    const oldIndex = itemsInSameLevel.findIndex(c => c.id === active.id);
    const newIndex = itemsInSameLevel.findIndex(c => c.id === over.id);
    
    // Shift the items
    const newItems = arrayMove(itemsInSameLevel, oldIndex, newIndex);
    
    // Reassign mathematical positions sequentially
    const payload = newItems.map((item, index) => ({
      id: item.id,
      position: index,
      parentId: item.parentId || null
    }));

    try {
      await adminApi.reorderCategories(payload);
      toast.success("Order updated successfully!");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to save reordered list.");
      fetchCategories();
    }
  };

  const handleSaveModal = async (data: Partial<Category>) => {
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, data);
        toast.success("Category updated successfully");
      } else {
        // give new item highest position
        const siblings = allFlatCategories.filter(c => c.parentId === (data.parentId || null));
        data.position = siblings.length;
        await adminApi.createCategory(data);
        toast.success("Category created successfully");
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsSubmitting(true);
      await adminApi.deleteCategory(categoryToDelete.id);
      toast.success("Category deleted");
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Categories</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Manage your store's categories and hierarchy. Drag to reorder.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
            className="rounded-xl px-6 bg-zinc-950 hover:bg-zinc-900 shadow-lg text-sm h-11"
          >
            <Plus size={16} className="mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-zinc-200 rounded-xl w-full text-sm h-10 shadow-sm focus:border-zinc-300 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Button variant="outline" size="sm" onClick={expandAll} className="rounded-lg h-9 text-xs font-medium border-zinc-200 text-zinc-600 truncate">Expand All</Button>
            <Button variant="outline" size="sm" onClick={collapseAll} className="rounded-lg h-9 text-xs font-medium border-zinc-200 text-zinc-600 truncate">Collapse All</Button>
            <div className="w-px h-5 bg-zinc-200 mx-1" />
            <div className="flex items-center bg-zinc-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode("table")}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === "table" ? "bg-white shadow-sm text-zinc-950" : "text-zinc-500 hover:text-zinc-900")}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === "grid" ? "bg-white shadow-sm text-zinc-950" : "text-zinc-500 hover:text-zinc-900")}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
              <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-950 rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading categories...</p>
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-zinc-300" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-950 mb-1">No categories found</h3>
              <p className="text-sm text-zinc-500">{searchQuery ? `We couldn't find anything matching "${searchQuery}"` : "You haven't created any categories yet."}</p>
            </div>
          ) : viewMode === "table" ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-white">
                    <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider w-[50%]">Category</th>
                    <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider w-[20%]">Products</th>
                    <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider w-[15%]">Status</th>
                    <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right w-[15%] relative z-10">Actions</th>
                  </tr>
                </thead>
                <SortableContext items={visibleRows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {visibleRows.map((cat, i) => (
                      <SortableCategoryRow
                        key={cat.id}
                        category={cat}
                        level={cat.level}
                        hasChildren={!!cat.children && cat.children.length > 0}
                        isExpanded={expandedIds.has(cat.id) || searchQuery.length > 0}
                        isLast={i === visibleRows.length - 1} // Approximated
                        onToggleExpand={toggleExpand}
                        onEdit={() => { setEditingCategory(cat); setIsModalOpen(true); }}
                        onDelete={() => { setCategoryToDelete(cat); setIsDeleteDialogOpen(true); }}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          ) : (
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {allFlatCategories.filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(category => (
                <div 
                  key={category.id} 
                  onClick={() => { setEditingCategory(category); setIsModalOpen(true); }} 
                  className="group border border-zinc-200 rounded-[2rem] p-6 bg-white hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] hover:border-zinc-300 hover:-translate-y-2 transition-all duration-700 flex flex-col justify-between cursor-pointer"
                >
                  <div className="space-y-6">
                    <div className="w-full aspect-[3/4] rounded-2xl bg-zinc-100 overflow-hidden border border-zinc-100 relative">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-3">
                          <LucideImage size={32} strokeWidth={1} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Null Archive</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-950 text-lg tracking-tight flex items-center gap-2">{category.name}</h3>
                      <p className="text-sm text-zinc-500 mt-2 line-clamp-2 leading-relaxed italic font-serif bg-zinc-50/50 p-3 rounded-xl border border-dashed border-zinc-100">
                        {category.description || 'No curated description available for this segment.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-mono font-medium text-zinc-600 bg-zinc-50 px-2 py-1 rounded">{category._count?.products || 0} items</span>
                    <StatusBadge status={category.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CategoryDrawer isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveModal} editingCategory={editingCategory} allCategories={allFlatCategories} />
      <ConfirmDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={confirmDelete} isLoading={isSubmitting} title="Delete Category" description={`Are you sure you want to delete ${categoryToDelete?.name}? ${!categoryToDelete?._count?.products ? "This action cannot be undone." : "Warning: This category currently has products associated with it. Deleting it may orphan these products."}`} confirmText="Delete" cancelText="Cancel" confirmBrand="danger" />
    </div>
  );
}
