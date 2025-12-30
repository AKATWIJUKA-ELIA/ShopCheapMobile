import { useState, useCallback } from 'react'

/**
 * Custom hook for reusable pull-to-refresh functionality.
 * @param refreshFn - optional async function to run on refresh
 * @param delayMs - optional delay if no refreshFn is provided
 */
export const useHandleRefresh = (refreshFn?: () => Promise<void> | void, delayMs: number = 1200) => {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      if (refreshFn) {
        await Promise.resolve(refreshFn())
      } else {
        // default delay if no function is provided
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    } finally {
      setRefreshing(false)
    }
  }, [refreshFn, delayMs])

  return { refreshing, handleRefresh }
}
