import { useEffect, useState } from 'react'

/**
 * Simulates the loading state a real API call would produce.
 * When swapping mock data for a real endpoint, replace the setTimeout
 * with the actual fetch/query call — the isLoading contract stays the same,
 * so page components don't need to change.
 *
 * Usage: const isLoading = useDelayedLoading(600)
 */
export function useDelayedLoading(delayMs = 600) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])

  return isLoading
}