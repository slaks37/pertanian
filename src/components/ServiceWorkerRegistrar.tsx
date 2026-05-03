'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(reg => {
          // Listen for SW messages (e.g. background sync complete)
          navigator.serviceWorker.addEventListener('message', event => {
            if (event.data?.type === 'SYNC_COMPLETE') {
              console.log('[SmartFarm SW]', event.data.message)
            }
          })

          // Check for updates every 60 minutes
          setInterval(() => reg.update(), 60 * 60 * 1000)
        })
        .catch(err => console.warn('[SmartFarm SW] Registration failed:', err))
    }
  }, [])

  return null
}
