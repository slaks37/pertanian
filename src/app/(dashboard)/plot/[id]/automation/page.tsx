'use client'

import { use, useState } from 'react'
import { useStore } from '@/lib/store'
import { Actuator, AutomationRule, AutoCommand } from '@/types'
import clsx from 'clsx'
import {
  Zap, Droplets, Leaf, Wind, Thermometer,
  Power, ToggleLeft, ToggleRight, Clock,
  CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp,
  Bell, BellOff, CalendarClock, Brain, Cpu
} from 'lucide-react'

/* ─── Icon helpers ─── */
const actuatorIcon = {
  pompa_air: <Droplets className="w-5 h-5" />,
  dispenser_pupuk: <Leaf className="w-5 h-5" />,
  penyemprot: <Zap className="w-5 h-5" />,
  kipas: <Wind className="w-5 h-5" />,
}
const actuatorColor = {
  pompa_air: 'bg-blue-100 text-blue-700',
  dispenser_pupuk: 'bg-green-100 text-green-700',
  penyemprot: 'bg-purple-100 text-purple-700',
  kipas: 'bg-cyan-100 text-cyan-700',
}
const paramLabel: Record<string, string> = {
  soilMoisture: 'Kel. Tanah',
  soilTemp: 'Suhu Tanah',
  airTemp: 'Suhu Udara',
  airHumidity: 'Kel. Udara',
  lightIntensity: 'Cahaya',
  ph: 'pH Tanah',
}
const paramUnit: Record<string, string> = {
  soilMoisture: '%', soilTemp: '°C', airTemp: '°C',
  airHumidity: '%', lightIntensity: 'klx', ph: '',
}

function formatRelative(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60000)
  if (min < 60) return `${min} menit lalu`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} jam lalu`
  return `${Math.floor(hr / 24)} hari lalu`
}

/* ─── Actuator Card ─── */
function ActuatorCard({ actuator, plotId }: { actuator: Actuator; plotId: string }) {
  const { setActuatorStatus, addAutoCommand } = useStore()
  const [loading, setLoading] = useState(false)

  const isOn = actuator.status === 'on'
  const isAuto = actuator.mode === 'auto'

  const handleToggleStatus = async () => {
    if (isAuto) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const newStatus = isOn ? 'off' : 'on'
    setActuatorStatus(plotId, actuator.id, newStatus, 'manual')
    addAutoCommand(plotId, {
      id: `cmd-${Date.now()}`,
      plotId,
      timestamp: new Date().toISOString(),
      actuatorType: actuator.type,
      actuatorName: actuator.name,
      action: newStatus,
      reason: 'Diatur manual oleh petani via dashboard',
      triggeredBy: 'manual',
    })
    setLoading(false)
  }

  const handleToggleMode = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const newMode = isAuto ? 'manual' : 'auto'
    setActuatorStatus(plotId, actuator.id, actuator.status, newMode)
    setLoading(false)
  }

  return (
    <div className={clsx('bg-white rounded-2xl border p-4 shadow-sm transition-all', isOn ? 'border-green-300' : 'border-gray-100')}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', actuatorColor[actuator.type])}>
            {actuatorIcon[actuator.type]}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{actuator.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={clsx('w-2 h-2 rounded-full', isOn ? 'bg-green-500' : 'bg-gray-300')} />
              <span className={clsx('text-xs font-medium', isOn ? 'text-green-600' : 'text-gray-400')}>
                {isOn ? 'AKTIF' : 'MATI'}
              </span>
            </div>
          </div>
        </div>

        {/* Power toggle (manual only) */}
        <button
          onClick={handleToggleStatus}
          disabled={isAuto || loading}
          className={clsx(
            'w-11 h-11 rounded-xl flex items-center justify-center transition-colors',
            isOn ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400',
            isAuto && 'opacity-40 cursor-not-allowed'
          )}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Power className="w-4 h-4" />
          )}
        </button>
      </div>

      {actuator.durationMinutes && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>Durasi: {actuator.durationMinutes} menit per siklus</span>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div>
          <p className="text-xs font-medium text-gray-700">Mode Otomatis AI</p>
          <p className="text-xs text-gray-400">{isAuto ? 'AI yang mengontrol' : 'Kontrol manual'}</p>
        </div>
        <button onClick={handleToggleMode} className="text-green-600 active:opacity-70">
          {isAuto
            ? <ToggleRight className="w-8 h-8 text-green-600" />
            : <ToggleLeft className="w-8 h-8 text-gray-300" />}
        </button>
      </div>

      {actuator.lastTriggeredAt && (
        <p className="text-xs text-gray-400 mt-2 leading-snug">
          ⏱ {formatRelative(actuator.lastTriggeredAt)} — {actuator.lastTriggeredReason}
        </p>
      )}
    </div>
  )
}

/* ─── Rule Card ─── */
function RuleCard({ rule, plotId }: { rule: AutomationRule; plotId: string }) {
  const { toggleRule } = useStore()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={clsx('bg-white rounded-xl border p-3.5 shadow-sm', rule.enabled ? 'border-green-200' : 'border-gray-100')}>
      <div className="flex items-start gap-3">
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', actuatorColor[rule.actuatorType])}>
          {actuatorIcon[rule.actuatorType]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 text-sm">{rule.name}</p>
            <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium', rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
              {rule.enabled ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{rule.description}</p>

          <button onClick={() => setExpanded(p => !p)} className="text-xs text-blue-600 mt-1 flex items-center gap-0.5">
            Detail {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {expanded && (
            <div className="mt-2 space-y-1 bg-gray-50 rounded-lg p-2">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Kondisi:</span> {paramLabel[rule.parameter]} {rule.operator === 'lt' ? '<' : '>'} {rule.threshold}{paramUnit[rule.parameter]}
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Aksi:</span> {rule.action === 'on' ? 'Aktifkan' : 'Matikan'} {rule.actuatorType.replace('_', ' ')}
                {rule.durationMinutes ? ` selama ${rule.durationMinutes} menit` : ''}
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Sudah aktif:</span> {rule.triggerCount} kali
              </p>
              {rule.lastTriggeredAt && (
                <p className="text-xs text-gray-400">Terakhir: {formatRelative(rule.lastTriggeredAt)}</p>
              )}
            </div>
          )}
        </div>

        <button onClick={() => toggleRule(plotId, rule.id)} className="flex-shrink-0">
          {rule.enabled
            ? <ToggleRight className="w-7 h-7 text-green-600" />
            : <ToggleLeft className="w-7 h-7 text-gray-300" />}
        </button>
      </div>
    </div>
  )
}

/* ─── Command Log Entry ─── */
function CommandEntry({ cmd }: { cmd: AutoCommand }) {
  const triggerIcon = {
    ai: <Brain className="w-3.5 h-3.5 text-purple-500" />,
    manual: <Power className="w-3.5 h-3.5 text-gray-500" />,
    schedule: <CalendarClock className="w-3.5 h-3.5 text-blue-500" />,
  }[cmd.triggeredBy]

  const triggerLabel = { ai: 'AI', manual: 'Manual', schedule: 'Jadwal' }[cmd.triggeredBy]

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', actuatorColor[cmd.actuatorType])}>
        {actuatorIcon[cmd.actuatorType]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="text-xs font-semibold text-gray-800">{cmd.actuatorName}</span>
          <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded', cmd.action === 'on' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
            {cmd.action === 'on' ? 'ON' : 'OFF'}
          </span>
          {cmd.durationMinutes && (
            <span className="text-xs text-gray-400">{cmd.durationMinutes} mnt</span>
          )}
        </div>
        <p className="text-xs text-gray-600 leading-snug">{cmd.reason}</p>
        {cmd.sensorValue !== undefined && (
          <p className="text-xs text-amber-600 mt-0.5">
            📊 {cmd.sensorParam}: {cmd.sensorValue} (batas: {cmd.threshold})
          </p>
        )}
        <div className="flex items-center gap-1 mt-1">
          {triggerIcon}
          <span className="text-xs text-gray-400">{triggerLabel} • {formatRelative(cmd.timestamp)}</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function AutomationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { state, updateHarvestReminder } = useStore()
  const [activeTab, setActiveTab] = useState<'aktuator' | 'aturan' | 'riwayat'>('aktuator')

  const plot = state.plots.find(p => p.id === id)
  const actuators = state.actuators[id] ?? []
  const rules = state.automationRules[id] ?? []
  const commands = state.autoCommands[id] ?? []
  const harvest = state.harvestPredictions[id]

  const onCount = actuators.filter(a => a.status === 'on').length
  const autoCount = actuators.filter(a => a.mode === 'auto').length
  const activeRules = rules.filter(r => r.enabled).length

  if (!plot) return <div className="p-4 text-gray-500">Plot tidak ditemukan</div>

  return (
    <div className="px-4 py-4 space-y-4">

      {/* AI Engine status */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-base">AI Engine Aktif</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-purple-200 text-xs">Memantau {actuators.length} perangkat</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/10 rounded-xl py-2">
            <p className="text-xl font-bold">{onCount}</p>
            <p className="text-xs text-purple-200">Aktif</p>
          </div>
          <div className="bg-white/10 rounded-xl py-2">
            <p className="text-xl font-bold">{autoCount}</p>
            <p className="text-xs text-purple-200">Mode Auto</p>
          </div>
          <div className="bg-white/10 rounded-xl py-2">
            <p className="text-xl font-bold">{activeRules}</p>
            <p className="text-xs text-purple-200">Aturan Aktif</p>
          </div>
        </div>
      </div>

      {/* Harvest prediction */}
      {harvest && (
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{plot.cropType === 'cabai' ? '🌶️' : '🍅'}</span>
                <p className="font-bold text-gray-900 text-sm">Prediksi Panen</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">{harvest.daysRemaining} hari lagi</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Estimasi: {new Date(harvest.estimatedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                <span className="ml-2 text-green-600 font-medium">({harvest.confidence}% yakin)</span>
              </p>
            </div>
            <button
              onClick={() => updateHarvestReminder(id, !harvest.reminderEnabled)}
              className={clsx('flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-colors', harvest.reminderEnabled ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-200')}
            >
              {harvest.reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              {harvest.reminderEnabled ? 'Diingatkan' : 'Ingatkan'}
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Tanam</span>
              <span>Panen</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              {(() => {
                const totalDays = plot.cropType === 'cabai' ? 85 : 70
                const hst = Math.floor((Date.now() - new Date(plot.plantingDate).getTime()) / 86400000)
                const pct = Math.min(100, (hst / totalDays) * 100)
                return <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
              })()}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 leading-snug">{harvest.notes}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {(['aktuator', 'aturan', 'riwayat'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all', activeTab === tab ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500')}
          >
            {tab === 'aktuator' ? 'Perangkat' : tab === 'aturan' ? 'Aturan AI' : 'Riwayat'}
          </button>
        ))}
      </div>

      {/* Tab: Actuators */}
      {activeTab === 'aktuator' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Perangkat dalam mode <strong>Otomatis</strong> dikendalikan penuh oleh AI. Alihkan ke Manual untuk kontrol langsung.</span>
          </div>
          {actuators.map(a => <ActuatorCard key={a.id} actuator={a} plotId={id} />)}
        </div>
      )}

      {/* Tab: Rules */}
      {activeTab === 'aturan' && (
        <div className="space-y-3">
          <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-semibold text-purple-800">Aturan berjalan otomatis 24/7</p>
            </div>
            <p className="text-xs text-purple-600 mt-0.5">AI memeriksa sensor setiap 30 menit dan menjalankan aturan yang sesuai.</p>
          </div>
          {rules.map(r => <RuleCard key={r.id} rule={r} plotId={id} />)}
        </div>
      )}

      {/* Tab: Command history */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-sm">Riwayat Keputusan AI</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-1"><Brain className="w-3 h-3 text-purple-500" /> AI</div>
              <div className="flex items-center gap-1"><CalendarClock className="w-3 h-3 text-blue-500" /> Jadwal</div>
              <div className="flex items-center gap-1"><Power className="w-3 h-3 text-gray-500" /> Manual</div>
            </div>
          </div>

          {commands.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Belum ada riwayat perintah</p>
          ) : (
            commands.map(cmd => <CommandEntry key={cmd.id} cmd={cmd} />)
          )}
        </div>
      )}
    </div>
  )
}
