'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Leaf, ChevronDown, LogOut, Calculator } from 'lucide-react'
import { useStore } from '@/lib/store'
import BottomNav from '@/components/BottomNav'
import clsx from 'clsx'
import { useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { state, setActivePlot, logout } = useStore()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    if (!state.user) {
      router.replace('/login')
    }
  }, [state.user, router])

  if (!state.user) return null

  const activePlots = state.plots.filter(p => !p.archived)
  const activePlot = activePlots.find(p => p.id === state.activePlotId)

  const cropIcon: Record<string, string> = { cabai: '🌶️', tomat: '🍅', lainnya: '🌿' }

  const handleSelectPlot = (plotId: string) => {
    setActivePlot(plotId)
    setShowDropdown(false)
  }

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <header className="bg-green-600 text-white px-4 pt-safe-top safe-top">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-200" />
            <span className="font-bold text-lg">Smart Farm</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/calculator')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 active:bg-white/30"
              title="Kalkulator"
            >
              <Calculator className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={() => setShowUserMenu(p => !p)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 active:bg-white/30 relative"
            >
              <span className="text-sm font-bold text-white">
                {state.user.name.charAt(0)}
              </span>
            </button>
          </div>
        </div>

        {/* Active plot selector */}
        {activePlots.length > 0 && (
          <div className="pb-3 relative">
            <button
              onClick={() => setShowDropdown(p => !p)}
              className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 w-full text-left"
            >
              <span className="text-base">{activePlot ? cropIcon[activePlot.cropType] : '🌿'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-200 leading-none mb-0.5">Plot Aktif</p>
                <p className="text-sm font-semibold text-white truncate">
                  {activePlot?.name ?? 'Pilih Plot'}
                </p>
              </div>
              <ChevronDown className={clsx('w-4 h-4 text-green-200 transition-transform', showDropdown && 'rotate-180')} />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
                {activePlots.map(plot => (
                  <button
                    key={plot.id}
                    onClick={() => handleSelectPlot(plot.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-50 last:border-0',
                      plot.id === state.activePlotId ? 'bg-green-50' : 'bg-white'
                    )}
                  >
                    <span className="text-lg">{cropIcon[plot.cropType]}</span>
                    <div>
                      <p className={clsx('font-semibold text-sm', plot.id === state.activePlotId ? 'text-green-700' : 'text-gray-900')}>{plot.name}</p>
                      <p className="text-xs text-gray-500">{plot.area} m² • {plot.cropType}</p>
                    </div>
                    {plot.id === state.activePlotId && (
                      <span className="ml-auto text-green-600 text-xs font-medium">Aktif</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* User menu dropdown */}
      {showUserMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
          <div className="absolute top-14 right-4 bg-white rounded-xl shadow-lg z-50 w-52 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-900 text-sm">{state.user.name}</p>
              <p className="text-xs text-gray-500">{state.user.phone}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 text-sm font-medium hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
