'use client'

import { use } from 'react'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/StatusBadge'
import { Activity, Camera, Calendar, MessageCircle, Droplets, Thermometer, Wind, ChevronRight, Cpu } from 'lucide-react'
import clsx from 'clsx'

export default function PlotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { state, getHST, setActivePlot } = useStore()
  const router = useRouter()

  const plot = state.plots.find(p => p.id === id)
  if (!plot) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Plot tidak ditemukan</p>
    </div>
  )

  const hst = getHST(plot.plantingDate)
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = state.tasks.filter(t => t.plotId === id && t.date === today)
  const pendingTasks = todayTasks.filter(t => t.status === 'pending')
  const doneTasks = todayTasks.filter(t => t.status === 'selesai')

  const latestReadings = state.sensorData[id]
  const lastReading = latestReadings?.[latestReadings.length - 1]

  const lastPhoto = state.photos.filter(p => p.plotId === id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  const quickNav = [
    { label: 'Sensor', icon: <Activity className="w-6 h-6" />, href: `/plot/${id}/sensor`, color: 'bg-blue-100 text-blue-700' },
    { label: 'Foto', icon: <Camera className="w-6 h-6" />, href: `/plot/${id}/photos`, color: 'bg-purple-100 text-purple-700' },
    { label: 'Kalender', icon: <Calendar className="w-6 h-6" />, href: `/plot/${id}/calendar`, color: 'bg-amber-100 text-amber-700' },
    { label: 'Chat AI', icon: <MessageCircle className="w-6 h-6" />, href: `/plot/${id}/chatbot`, color: 'bg-green-100 text-green-700' },
    { label: 'Otomasi', icon: <Cpu className="w-6 h-6" />, href: `/plot/${id}/automation`, color: 'bg-violet-100 text-violet-700' },
  ]

  const cropEmoji: Record<string, string> = { cabai: '🌶️', tomat: '🍅', lainnya: '🌿' }

  const nav = (href: string) => {
    setActivePlot(id)
    router.push(href)
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Plot header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{cropEmoji[plot.cropType]}</span>
              <h1 className="text-lg font-bold">{plot.name}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">HST {hst}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{plot.area} m²</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">{plot.soilType}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{plot.conditionScore}</div>
            <div className="text-xs text-green-200">skor kondisi</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/20">
          <StatusBadge status={plot.status} />
        </div>
      </div>

      {/* Quick nav grid */}
      <div className="grid grid-cols-5 gap-2">
        {quickNav.map(item => (
          <button
            key={item.label}
            onClick={() => nav(item.href)}
            className="flex flex-col items-center gap-2 py-3 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', item.color)}>
              {item.icon}
            </div>
            <span className="text-xs font-medium text-gray-700">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Sensor summary */}
      {lastReading && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-sm">Sensor Terkini</h2>
            <button onClick={() => nav(`/plot/${id}/sensor`)} className="text-green-600 text-xs font-medium flex items-center gap-1">
              Lihat detail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">{lastReading.soilMoisture.toFixed(0)}%</div>
              <div className="text-xs text-gray-500">Kel. Tanah</div>
            </div>
            <div className="text-center">
              <Thermometer className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">{lastReading.airTemp.toFixed(1)}°C</div>
              <div className="text-xs text-gray-500">Suhu Udara</div>
            </div>
            <div className="text-center">
              <Wind className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">{lastReading.airHumidity.toFixed(0)}%</div>
              <div className="text-xs text-gray-500">Kel. Udara</div>
            </div>
          </div>
        </div>
      )}

      {/* Today's tasks */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 text-sm">Tugas Hari Ini</h2>
          <button onClick={() => nav(`/plot/${id}/calendar`)} className="text-green-600 text-xs font-medium flex items-center gap-1">
            Lihat semua <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-3">Tidak ada tugas hari ini</p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${todayTasks.length > 0 ? (doneTasks.length / todayTasks.length) * 100 : 0}%` }} />
              </div>
              <span className="text-xs font-medium text-gray-600">{doneTasks.length}/{todayTasks.length} selesai</span>
            </div>
            <div className="space-y-2">
              {pendingTasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', { 'bg-red-500': task.priority === 'tinggi', 'bg-amber-500': task.priority === 'sedang', 'bg-green-500': task.priority === 'rendah' })} />
                  <span className="text-sm text-gray-800 flex-1 truncate">{task.title}</span>
                  <span className="text-xs text-gray-400">{task.bestTime.split(' ')[0]}</span>
                </div>
              ))}
              {pendingTasks.length > 3 && (
                <p className="text-xs text-gray-400 text-center pt-1">+{pendingTasks.length - 3} tugas lainnya</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Last photo */}
      {lastPhoto && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-sm">Foto Terakhir</h2>
            <button onClick={() => nav(`/plot/${id}/photos`)} className="text-green-600 text-xs font-medium flex items-center gap-1">
              Lihat semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 bg-green-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              {cropEmoji[plot.cropType]}
            </div>
            {lastPhoto.analysis && (
              <div>
                <div className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full mb-1 inline-block', {
                  'bg-green-100 text-green-700': lastPhoto.analysis.severity === 'normal',
                  'bg-amber-100 text-amber-700': lastPhoto.analysis.severity === 'perhatian',
                  'bg-red-100 text-red-700': lastPhoto.analysis.severity === 'kritis',
                })}>
                  {lastPhoto.analysis.condition}
                </div>
                <p className="text-xs text-gray-500">HST {lastPhoto.hst} • {Math.ceil((Date.now() - new Date(lastPhoto.timestamp).getTime()) / 86400000)} hari lalu</p>
                {lastPhoto.analysis.recommendations[0] && (
                  <p className="text-xs text-gray-600 mt-1">💡 {lastPhoto.analysis.recommendations[0]}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
