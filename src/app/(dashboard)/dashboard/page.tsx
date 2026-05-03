'use client'

import { useStore } from '@/lib/store'
import PlotCard from '@/components/PlotCard'
import Onboarding, { useOnboarding } from '@/components/Onboarding'
import { useRouter } from 'next/navigation'
import { Plus, Sun, Cloud, Droplets, Wind } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export default function DashboardPage() {
  const { state, getHST } = useStore()
  const router = useRouter()
  const onboarding = useOnboarding()

  const activePlots = state.plots.filter(p => !p.archived)
  const today = new Date().toISOString().split('T')[0]

  const taskCountForPlot = (plotId: string) =>
    state.tasks.filter(t => t.plotId === plotId && t.date === today && t.status === 'pending').length

  return (
    <div className="px-4 py-4 space-y-4">
      {onboarding.show && <Onboarding onComplete={onboarding.complete} />}
      {/* Greeting */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-4 text-white">
        <p className="text-sm text-green-200 mb-0.5">{getGreeting()},</p>
        <h1 className="text-xl font-bold">{state.user?.name ?? 'Petani'} 🌱</h1>
        <p className="text-sm text-green-100 mt-1">
          {activePlots.length} lahan aktif terpantau
        </p>
      </div>

      {/* Weather card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Cuaca Hari Ini</p>
            <div className="flex items-center gap-2">
              <Sun className="w-7 h-7 text-amber-500" />
              <span className="text-2xl font-bold text-gray-900">29°C</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Cerah, tidak ada hujan</p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Kelembapan 72%</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
              <Wind className="w-3.5 h-3.5 text-gray-400" />
              <span>Angin 12 km/jam</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
              <Cloud className="w-3.5 h-3.5 text-gray-400" />
              <span>UV Indeks Tinggi</span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-50">
          <p className="text-xs text-green-700 font-medium bg-green-50 rounded-lg px-3 py-1.5">
            ✅ Kondisi baik untuk penyemprotan sore ini
          </p>
        </div>
      </div>

      {/* Plots */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Lahan Saya</h2>
          <span className="text-xs text-gray-500">{activePlots.length} lahan</span>
        </div>

        {activePlots.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="font-semibold text-gray-900 mb-1">Belum ada lahan</h3>
            <p className="text-sm text-gray-500 mb-4">Tambahkan plot pertama Anda untuk mulai memantau tanaman</p>
            <button
              onClick={() => router.push('/plots/new')}
              className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl text-sm"
            >
              Tambah Plot
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activePlots.map(plot => (
              <PlotCard
                key={plot.id}
                plot={plot}
                taskCount={taskCountForPlot(plot.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary stats */}
      {activePlots.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-green-600">{activePlots.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Lahan Aktif</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-amber-500">
              {state.tasks.filter(t => t.date === today && t.status === 'pending').length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Tugas Hari Ini</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-blue-500">
              {activePlots.reduce((sum, p) => sum + p.area, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Total m²</p>
          </div>
        </div>
      )}

      {/* Add plot button */}
      <button
        onClick={() => router.push('/plots/new')}
        className="w-full py-4 border-2 border-dashed border-green-300 rounded-2xl flex items-center justify-center gap-2 text-green-600 font-semibold text-sm hover:bg-green-50 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Tambah Plot Baru
      </button>
    </div>
  )
}
