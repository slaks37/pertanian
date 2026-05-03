'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function RootPage() {
  const { state } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (state.user) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [state.user, router])

  return (
    <div className="min-h-screen bg-green-600 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium">Memuat...</p>
      </div>
    </div>
  )
}
