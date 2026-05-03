import { PlotStatus } from '@/types'
import clsx from 'clsx'

interface StatusBadgeProps {
  status: PlotStatus
  size?: 'sm' | 'md'
  className?: string
}

export default function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const label = {
    baik: 'Baik',
    perhatian: 'Perhatian',
    kritis: 'Kritis',
  }[status]

  const colors = {
    baik: 'bg-green-100 text-green-700 border border-green-200',
    perhatian: 'bg-amber-100 text-amber-700 border border-amber-200',
    kritis: 'bg-red-100 text-red-700 border border-red-200',
  }[status]

  const dot = {
    baik: 'bg-green-500',
    perhatian: 'bg-amber-500',
    kritis: 'bg-red-500',
  }[status]

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        colors,
        className
      )}
    >
      <span className={clsx('rounded-full', dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {label}
    </span>
  )
}
