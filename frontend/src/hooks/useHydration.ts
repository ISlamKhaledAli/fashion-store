import { useEffect, useState } from 'react'

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false)
  
  useEffect(() => {
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // We only want this to run once on mount to mark hydration completion
  
  return hydrated
}
