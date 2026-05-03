'use client'

import { Plot } from '@/types'
import StatusBadge from './StatusBadge'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Flame, Apple, ChevronRight, Activity } from 'lucide-react'
import clsx from 'clsx'

interface PlotCardProps {
  plot: Plot
  taskCount?: number
}

const cropIcon: Record<Plot['cropType'], React.ReactNode> = {
  cabai: <Flame className="w-5 h-5 text-red-500" />,
  tomat: <Apple className="w-5 h-5 text-orange-500" />,
  lainnya: <Activity className="w-5 h-5 text-gray-500" />,
}

const cropLabel: Record<Plot['cropType'], string> = {
  cabai: 'Cabai',
  tomat: 'Tomat',
  lainnya: 'Lainnya',
}

function CircularProgress({ score }: { score: number }) {
  const radius = 28
  const circ = 2 * Math.PI * radius
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx="35" cy="35" r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900 leading-none">{score}</span>
        <span className="text-xs text-gray-500">skor</span>
      </div>
    </div>
  )
}

export default function PlotCard({ plot, taskCount = 0 }: PlotCardProps) {
  const { getHST, setActivePlot } = useStore()
  const router = useRouter()
  const hst = getHST(plot.plantingDate)

  const handleTap = () => {
    setActivePlot(plot.id)
    router.push(`/plot/${plot.id}`)
  }

  return (
    <button
      onClick={handleTap}
      className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {cropIcon[plot.cropType]}
            <h3 className="font-bold text-gray-900 text-base truncate">{plot.name}</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">{cropLabel[plot.cropType]}</span>
            <span className="text-gray-300">•</span>
            <span className={clsx(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              hst <= 30 ? 'bg-blue-100 text-blue-700' : hst <= 60 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            )}>
              HST {hst}
            </span>
          </div>
        </div>
        <CircularProgress score={plot.conditionScore} />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <StatusBadge status={plot.status} size="sm" />
          <span className="text-xs text-gray-500">{plot.area} m²</span>
        </div>
        <div className="flex items-center gap-1.5">
          {taskCount > 0 && (
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              {taskCount} tugas
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </button>
  )
}
