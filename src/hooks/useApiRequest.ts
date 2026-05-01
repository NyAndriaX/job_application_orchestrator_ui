import { useCallback, useState } from 'react'

export function useApiRequest<TData = unknown>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<TData | null>(null)

  const run = useCallback(async (asyncFn: () => Promise<TData>) => {
    setLoading(true)
    setError('')
    try {
      const result = await asyncFn()
      setData(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed.'
      setError(message)
      setData(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError('')
  }, [])

  return { loading, error, data, run, reset }
}
