import { useEffect, useState } from 'react'

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false)
  
  useEffect(() => {
    const id = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(id);
  }, []); // We only want this to run once on mount to mark hydration completion
  
  return hydrated
}
