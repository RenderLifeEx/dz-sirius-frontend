import { useEffect } from 'react'

const POLL_INTERVAL_MS = 60_000

export function useVersionCheck() {
  useEffect(() => {
    if (!import.meta.env.PROD) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/version.json?t=' + Date.now())
        if (!res.ok) return
        const data = await res.json()
        if (data.version !== __APP_VERSION__) {
          window.location.reload()
        }
      } catch {}
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [])
}
