import clsx from 'clsx'

interface SensorCardProps {
  label: string
  value: number
  unit: string
  icon: React.ReactNode
  min: number
  max: number
  low?: number
  high?: number
}

function getZone(value: number, min: number, max: number, low?: number, high?: number) {
  const lo = low ?? min
  const hi = high ?? max
  if (value < lo || value > hi) return 'kritis'
  const range = hi - lo
  const buffer = range * 0.15
  if (value < lo + buffer || value > hi - buffer) return 'perhatian'
  return 'baik'
}

export default function SensorCard({ label, value, unit, icon, min, max, low, high }: SensorCardProps) {
  const zone = getZone(value, min, max, low, high)

  const zoneColor = {
    baik: 'text-green-600',
    perhatian: 'text-amber-600',
    kritis: 'text-red-600',
  }[zone]

  const zoneBg = {
    baik: 'bg-green-50 border-green-200',
    perhatian: 'bg-amber-50 border-amber-200',
    kritis: 'bg-red-50 border-red-200',
  }[zone]

  const zoneLabel = {
    baik: 'Normal',
    perhatian: 'Perhatian',
    kritis: 'Kritis',
  }[zone]

  const lo = low ?? min
  const hi = high ?? max
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
  const loPct = ((lo - min) / (max - min)) * 100
  const hiPct = ((hi - min) / (max - min)) * 100

  return (
    <div className={clsx('rounded-xl border p-3', zoneBg)}>
      <div className="flex items-start justify-between mb-2">
        <div className={clsx('p-1.5 rounded-lg bg-white', zoneColor)}>
          {icon}
        </div>
        <span className={clsx('text-xs font-semibold px-1.5 py-0.5 rounded-full bg-white', zoneColor)}>
          {zoneLabel}
        </span>
      </div>
      <div className="mb-1">
        <span className={clsx('text-2xl font-bold', zoneColor)}>
          {typeof value === 'number' && value > 1000
            ? (value / 1000).toFixed(1) + 'k'
            : value.toFixed(1)}
        </span>
        <span className="text-sm text-gray-500 ml-1">{unit}</span>
      </div>
      <p className="text-xs text-gray-600 mb-2 leading-tight">{label}</p>
      {/* Mini range bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* Safe zone */}
        <div
          className="absolute h-full bg-green-200 rounded-full"
          style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }}
        />
        {/* Current value marker */}
        <div
          className={clsx('absolute h-full w-1.5 rounded-full -translate-x-1/2', {
            'bg-green-600': zone === 'baik',
            'bg-amber-500': zone === 'perhatian',
            'bg-red-500': zone === 'kritis',
          })}
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">{min}{unit}</span>
        <span className="text-xs text-gray-400">{max}{unit}</span>
      </div>
    </div>
  )
}
