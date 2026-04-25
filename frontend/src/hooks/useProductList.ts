import { useState, useEffect } from "react";
import { Product } from "@/types";
import { productApi } from "@/lib/api";

interface UseProductListConfig {
  limit?: number;
  excludeId?: string;
  category?: string;
  featured?: boolean;
}

export const useProductList = ({ limit = 8, excludeId, category, featured }: UseProductListConfig = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Prepare params for API call
        const params: Record<string, string | number | boolean> = { limit };
        if (category) params.category = category;
        if (featured !== undefined) params.featured = featured;

        const res = await productApi.getAll(params);
        
        if (isMounted) {
          if (res.data.success) {
            // Apply client-side exclusion and final limit
            const filtered = res.data.data
              .filter((p: Product) => p.id !== excludeId)
              .slice(0, limit);
            setProducts(filtered);
          } else {
            setError("Failed to load products");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("An error occurred while fetching products");
          setProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
    // Stringify config to detect deep changes if necessary, 
    // but typically config is defined in render so we use specific deps.
    // In our case, we'll use specific deps to avoid infinite loops.
  }, [limit, excludeId, category, featured]);

  return { products, loading, error };
};
