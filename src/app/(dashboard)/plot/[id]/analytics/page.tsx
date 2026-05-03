'use client'

import { use, useState } from 'react'
import { useStore } from '@/lib/store'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  TrendingUp, CheckSquare, Zap, Camera, AlertTriangle,
  Droplets, Thermometer, Award, Download, Brain, ChevronDown, ChevronUp
} from 'lucide-react'
import clsx from 'clsx'

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { state, getHST } = useStore()
  const [expandRec, setExpandRec] = useState(false)

  const plot = state.plots.find(p => p.id === id)
  if (!plot) return <div className="p-4 text-gray-500">Plot tidak ditemukan</div>

  const hst = getHST(plot.plantingDate)
  const allTasks = state.tasks.filter(t => t.plotId === id)
  const doneTasks = allTasks.filter(t => t.status === 'selesai')
  const photos = state.photos.filter(p => p.plotId === id)
  const commands = state.autoCommands[id] ?? []
  const aiCommands = commands.filter(c => c.triggeredBy === 'ai')
  const rules = state.automationRules[id] ?? []
  const readings = state.sensorData[id] ?? []
  const harvest = state.harvestPredictions[id]
  const isCabai = plot.cropType === 'cabai'

  /* ── Weekly task breakdown ── */
  const weeklyTasks = Array.from({ length: Math.ceil(hst / 7) }, (_, w) => {
    const weekLabel = `M${w + 1}`
    const wTasks = allTasks.filter(t => {
      const tDate = new Date(t.date)
      const plantedDate = new Date(plot.plantingDate)
      const taskHST = Math.floor((tDate.getTime() - plantedDate.getTime()) / 86400000)
      return taskHST >= w * 7 && taskHST < (w + 1) * 7
    })
    return {
      week: weekLabel,
      siram: wTasks.filter(t => t.type === 'siram').length,
      pupuk: wTasks.filter(t => t.type === 'pupuk').length,
      semprot: wTasks.filter(t => t.type === 'semprot').length,
      pantau: wTasks.filter(t => t.type === 'pantau').length,
      selesai: wTasks.filter(t => t.status === 'selesai').length,
    }
  }).slice(0, 8)

  /* ── Daily avg moisture + temp trend (last 14 days) ── */
  const dailyTrend = Array.from({ length: 14 }, (_, i) => {
    const dayAgo = 13 - i
    const label = new Date(Date.now() - dayAgo * 86400000)
      .toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    const dayReadings = readings.filter(r => {
      const d = new Date(r.timestamp)
      return Math.floor((Date.now() - d.getTime()) / 86400000) === dayAgo
    })
    if (dayReadings.length === 0) return { label, moisture: 0, temp: 0 }
    const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length
    return {
      label,
      moisture: +avg(dayReadings.map(r => r.soilMoisture)).toFixed(1),
      temp: +avg(dayReadings.map(r => r.airTemp)).toFixed(1),
    }
  })

  /* ── Issues from photos ── */
  const issues = photos
    .filter(p => p.analysis && p.analysis.severity !== 'normal')
    .map(p => ({ hst: p.hst, condition: p.analysis!.condition, severity: p.analysis!.severity, date: p.timestamp }))
    .sort((a, b) => a.hst - b.hst)

  /* ── AI recommendations for next season ── */
  const recommendations = isCabai ? [
    'Tingkatkan frekuensi pemupukan kalium di fase pembungaan (HST 35-60) untuk meningkatkan kualitas buah',
    'Aktifkan aturan otomasi irigasi lebih awal — threshold 60% lebih baik dari 55% untuk menghindari stres air',
    'Lakukan penyemprotan fungisida preventif tiap 2 minggu mulai HST 30 untuk mencegah antraknos',
    'Pertimbangkan mulsa plastik hitam untuk menjaga kelembapan tanah lebih stabil',
    'Pantau pH tanah tiap 2 minggu — cabai sensitif terhadap pH < 5.8',
  ] : [
    'Pasang sistem irigasi tetes permanen untuk efisiensi air yang lebih baik pada musim berikutnya',
    'Tambahkan naungan (shade net 30%) untuk mengurangi suhu siang hari — tomat sensitif terhadap suhu > 32°C',
    'Mulai Ca-B spray lebih awal (HST 15) untuk pencegahan BER yang lebih efektif',
    'Tingkatkan aerasi tanah sebelum tanam untuk mencegah hawar akar',
    'Monitor brix (kadar gula) sejak HST 50 untuk menentukan waktu panen optimal',
  ]

  const statCards = [
    { label: 'Hari Tanam', value: hst, unit: 'HST', icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Tugas Selesai', value: `${doneTasks.length}/${allTasks.length}`, unit: '', icon: <CheckSquare className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'AI Intervensi', value: aiCommands.length, unit: 'kali', icon: <Brain className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Foto Dianalisis', value: photos.length, unit: 'foto', icon: <Camera className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-100' },
  ]

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-4 text-white">
        <p className="text-teal-200 text-xs mb-1">Analitik Musim Tanam</p>
        <h1 className="text-xl font-bold">{plot.name}</h1>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">HST {hst} dari {isCabai ? '~90' : '~75'} hari</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Skor kondisi: {plot.conditionScore}/100</span>
          {harvest && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Panen ~{harvest.daysRemaining} hari lagi</span>}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', s.bg, s.color)}>
                {s.icon}
              </div>
              <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
            </div>
            <div className="flex items-end gap-1">
              <span className={clsx('text-2xl font-bold', s.color)}>{s.value}</span>
              {s.unit && <span className="text-xs text-gray-400 mb-0.5">{s.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Moisture + Temp trend */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-1 text-sm">Tren Kelembapan & Suhu (14 Hari)</h2>
        <p className="text-xs text-gray-400 mb-3">Rata-rata harian kelembapan tanah dan suhu udara</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={dailyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="gMoist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9ca3af' }} interval={2} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="moisture" name="Kel. Tanah (%)" stroke="#3b82f6" fill="url(#gMoist)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="temp" name="Suhu Udara (°C)" stroke="#ef4444" fill="url(#gTemp)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly task breakdown */}
      {weeklyTasks.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-1 text-sm">Aktivitas Mingguan</h2>
          <p className="text-xs text-gray-400 mb-3">Jumlah tugas per kategori per minggu</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyTasks} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="siram" name="Siram" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pupuk" name="Pupuk" fill="#22c55e" stackId="a" />
              <Bar dataKey="semprot" name="Semprot" fill="#a855f7" stackId="a" />
              <Bar dataKey="pantau" name="Pantau" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Completion rate */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-3 text-sm">Tingkat Kepatuhan Tugas</h2>
        <div className="space-y-3">
          {(['siram', 'pupuk', 'semprot', 'pantau'] as const).map(type => {
            const typeTasks = allTasks.filter(t => t.type === type)
            const doneCount = typeTasks.filter(t => t.status === 'selesai').length
            const pct = typeTasks.length > 0 ? Math.round((doneCount / typeTasks.length) * 100) : 0
            const labels = { siram: 'Penyiraman', pupuk: 'Pemupukan', semprot: 'Penyemprotan', pantau: 'Pemantauan' }
            const colors = { siram: 'bg-blue-500', pupuk: 'bg-green-500', semprot: 'bg-purple-500', pantau: 'bg-amber-500' }
            return (
              <div key={type}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">{labels[type]}</span>
                  <span className="text-xs font-semibold text-gray-700">{doneCount}/{typeTasks.length} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={clsx('h-full rounded-full transition-all', colors[type])} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Issues detected */}
      {issues.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Masalah Terdeteksi AI
          </h2>
          <div className="space-y-2">
            {issues.map((iss, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5',
                  iss.severity === 'kritis' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                )}>HST {iss.hst}</span>
                <div>
                  <p className="text-xs font-medium text-gray-800">{iss.condition}</p>
                  <p className="text-xs text-gray-400">{new Date(iss.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI actuator summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-500" />
          Ringkasan Aktuator Musim Ini
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {(['pompa_air', 'dispenser_pupuk', 'penyemprot', 'kipas'] as const).map(type => {
            const typeCmds = commands.filter(c => c.actuatorType === type && c.action === 'on')
            const totalMinutes = typeCmds.reduce((s, c) => s + (c.durationMinutes ?? 0), 0)
            const labels = { pompa_air: 'Pompa Air', dispenser_pupuk: 'Dispenser Pupuk', penyemprot: 'Penyemprot', kipas: 'Kipas' }
            const colors = { pompa_air: 'text-blue-600 bg-blue-50', dispenser_pupuk: 'text-green-600 bg-green-50', penyemprot: 'text-purple-600 bg-purple-50', kipas: 'text-cyan-600 bg-cyan-50' }
            return (
              <div key={type} className={clsx('rounded-xl p-3', colors[type])}>
                <p className="text-xs font-medium mb-1">{labels[type]}</p>
                <p className="text-lg font-bold">{typeCmds.length}x</p>
                {totalMinutes > 0 && <p className="text-xs opacity-75">{totalMinutes} menit total</p>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommendations next season */}
      <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl p-4 border border-teal-100">
        <button
          onClick={() => setExpandRec(p => !p)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="font-bold text-teal-800 text-sm flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Rekomendasi AI untuk Musim Berikutnya
          </h2>
          {expandRec ? <ChevronUp className="w-4 h-4 text-teal-600" /> : <ChevronDown className="w-4 h-4 text-teal-600" />}
        </button>
        {expandRec && (
          <div className="mt-3 space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-teal-500 font-bold text-sm flex-shrink-0">{i + 1}.</span>
                <p className="text-xs text-teal-800 leading-snug">{rec}</p>
              </div>
            ))}
          </div>
        )}
        {!expandRec && (
          <p className="text-xs text-teal-600 mt-2">{recommendations.length} rekomendasi tersedia — tap untuk lihat</p>
        )}
      </div>

      {/* Download button (visual only for demo) */}
      <button className="w-full py-3.5 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-600 font-semibold text-sm shadow-sm active:bg-gray-50">
        <Download className="w-4 h-4" />
        Unduh Laporan PDF Musim Ini
      </button>

      <div className="h-2" />
    </div>
  )
}
