'use client'

import { use, useState } from 'react'
import { useStore } from '@/lib/store'
import SensorCard from '@/components/SensorCard'
import { useMqttStream } from '@/hooks/useMqttStream'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Droplets, Thermometer, Sun, Wind, Activity, Wifi, WifiOff, Battery } from 'lucide-react'
import clsx from 'clsx'

const SENSOR_RANGES = {
  cabai: { soilMoisture: [30, 100, 60, 75], soilTemp: [15, 45, 24, 30], airTemp: [15, 45, 22, 34], airHumidity: [30, 100, 60, 82], lightIntensity: [0, 80000, 15000, 65000] },
  tomat: { soilMoisture: [30, 100, 65, 80], soilTemp: [15, 45, 18, 28], airTemp: [15, 45, 18, 30], airHumidity: [30, 100, 55, 78], lightIntensity: [0, 80000, 20000, 65000] },
  lainnya: { soilMoisture: [30, 100, 50, 80], soilTemp: [15, 45, 20, 30], airTemp: [15, 45, 20, 32], airHumidity: [30, 100, 55, 80], lightIntensity: [0, 80000, 15000, 60000] },
}

type ChartParam = 'soilMoisture' | 'soilTemp' | 'airTemp' | 'airHumidity' | 'lightIntensity'

const chartTabs: { key: ChartParam; label: string; color: string; unit: string }[] = [
  { key: 'soilMoisture', label: 'Kel. Tanah', color: '#3b82f6', unit: '%' },
  { key: 'airTemp', label: 'Suhu Udara', color: '#ef4444', unit: '°C' },
  { key: 'airHumidity', label: 'Kel. Udara', color: '#06b6d4', unit: '%' },
  { key: 'soilTemp', label: 'Suhu Tanah', color: '#f97316', unit: '°C' },
  { key: 'lightIntensity', label: 'Cahaya', color: '#eab308', unit: 'klx' },
]

export default function SensorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { state } = useStore()
  const [activeChart, setActiveChart] = useState<ChartParam>('soilMoisture')

  const plot = state.plots.find(p => p.id === id)
  const readings = state.sensorData[id] ?? []

  // Live MQTT stream — overrides lastReading with real-time data when connected
  const mqtt = useMqttStream(id, plot?.cropType ?? 'cabai', true)
  const lastReading = mqtt.latest ?? readings[readings.length - 1]

  const ranges = SENSOR_RANGES[plot?.cropType ?? 'lainnya']

  if (!lastReading) return <div className="p-4 text-gray-500">Data sensor belum tersedia</div>

  // Downsample: take every 4th reading (every 2 hours) for chart
  const chartData = readings
    .filter((_, i) => i % 4 === 0)
    .slice(-84) // last 7 days (84 * 2h = 168h)
    .map(r => ({
      time: new Date(r.timestamp).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
      soilMoisture: r.soilMoisture,
      soilTemp: r.soilTemp,
      airTemp: r.airTemp,
      airHumidity: r.airHumidity,
      lightIntensity: +(r.lightIntensity / 1000).toFixed(1),
    }))

  const activeTab = chartTabs.find(t => t.key === activeChart)!

  const alerts = []
  const r = ranges
  if (lastReading.soilMoisture < r.soilMoisture[2]) alerts.push(`Kelembapan tanah rendah: ${lastReading.soilMoisture.toFixed(1)}% (min. ${r.soilMoisture[2]}%)`)
  if (lastReading.soilMoisture > r.soilMoisture[3]) alerts.push(`Kelembapan tanah tinggi: ${lastReading.soilMoisture.toFixed(1)}% (maks. ${r.soilMoisture[3]}%)`)
  if (lastReading.airTemp > r.airTemp[3]) alerts.push(`Suhu udara terlalu tinggi: ${lastReading.airTemp.toFixed(1)}°C`)

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Node status */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', mqtt.isConnected ? 'bg-green-100' : 'bg-gray-100')}>
              <Activity className={clsx('w-5 h-5', mqtt.isConnected ? 'text-green-600' : 'text-gray-400')} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{plot?.nodeId ?? 'NODE-001'}</p>
              <div className="flex items-center gap-1">
                <span className={clsx('w-2 h-2 rounded-full', mqtt.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300')} />
                <span className={clsx('text-xs font-medium', mqtt.isConnected ? 'text-green-600' : 'text-gray-400')}>
                  {mqtt.isConnected ? 'Live MQTT' : 'Menghubungkan...'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Battery className="w-4 h-4 text-green-500" />
              <span>87%</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {mqtt.isConnected
                ? <Wifi className="w-4 h-4 text-blue-400" />
                : <WifiOff className="w-4 h-4 text-gray-300" />}
              <span>{mqtt.isConnected ? 'Kuat' : '–'}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {mqtt.lastUpdate
            ? `Live update: ${mqtt.lastUpdate}`
            : `Update terakhir: ${new Date(lastReading.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
        </p>
        {mqtt.error && <p className="text-xs text-amber-500 mt-1">{mqtt.error}</p>}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h3 className="font-bold text-red-700 text-sm mb-2">⚠️ Peringatan Sensor</h3>
          {alerts.map((a, i) => <p key={i} className="text-sm text-red-600">{a}</p>)}
        </div>
      )}

      {/* Sensor grid */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Kondisi Saat Ini</h2>
        <div className="grid grid-cols-2 gap-3">
          <SensorCard label="Kelembapan Tanah" value={lastReading.soilMoisture} unit="%" icon={<Droplets className="w-4 h-4" />} min={r.soilMoisture[0]} max={r.soilMoisture[1]} low={r.soilMoisture[2]} high={r.soilMoisture[3]} />
          <SensorCard label="Suhu Tanah" value={lastReading.soilTemp} unit="°C" icon={<Thermometer className="w-4 h-4" />} min={r.soilTemp[0]} max={r.soilTemp[1]} low={r.soilTemp[2]} high={r.soilTemp[3]} />
          <SensorCard label="Suhu Udara" value={lastReading.airTemp} unit="°C" icon={<Thermometer className="w-4 h-4" />} min={r.airTemp[0]} max={r.airTemp[1]} low={r.airTemp[2]} high={r.airTemp[3]} />
          <SensorCard label="Kelembapan Udara" value={lastReading.airHumidity} unit="%" icon={<Wind className="w-4 h-4" />} min={r.airHumidity[0]} max={r.airHumidity[1]} low={r.airHumidity[2]} high={r.airHumidity[3]} />
          <div className="col-span-2">
            <SensorCard label="Intensitas Cahaya" value={lastReading.lightIntensity} unit=" lux" icon={<Sun className="w-4 h-4" />} min={r.lightIntensity[0]} max={r.lightIntensity[1]} low={r.lightIntensity[2]} high={r.lightIntensity[3]} />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-3">Grafik 14 Hari</h2>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2 mb-4">
          {chartTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className={clsx('flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors', activeChart === tab.key ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 bg-white')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={Math.floor(chartData.length / 6)} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(val: number) => [`${val}${activeTab.unit}`, activeTab.label]}
            />
            <Line type="monotone" dataKey={activeChart === 'lightIntensity' ? 'lightIntensity' : activeChart} stroke={activeTab.color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 text-center mt-2">Data setiap 2 jam — 14 hari terakhir</p>
      </div>
    </div>
  )
}
