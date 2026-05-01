import { useCallback, useState } from 'react'

export function useApiRequest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const run = useCallback(async (asyncFn) => {
    setLoading(true)
    setError('')
    try {
      const result = await asyncFn()
      setData(result)
      return result
    } catch (err) {
      setError(err.message || 'Request failed.')
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
