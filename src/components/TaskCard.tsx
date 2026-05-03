'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { Check, Clock, Droplets, Leaf, Sprout, Eye, MoreHorizontal, X, HelpCircle } from 'lucide-react'
import clsx from 'clsx'
import { useStore } from '@/lib/store'

const typeIcon: Record<Task['type'], React.ReactNode> = {
  siram: <Droplets className="w-4 h-4" />,
  pupuk: <Sprout className="w-4 h-4" />,
  semprot: <Leaf className="w-4 h-4" />,
  pantau: <Eye className="w-4 h-4" />,
  lainnya: <MoreHorizontal className="w-4 h-4" />,
}

const typeLabel: Record<Task['type'], string> = {
  siram: 'Penyiraman',
  pupuk: 'Pemupukan',
  semprot: 'Penyemprotan',
  pantau: 'Pemantauan',
  lainnya: 'Lainnya',
}

const priorityBorder: Record<Task['priority'], string> = {
  tinggi: 'border-l-red-500',
  sedang: 'border-l-amber-500',
  rendah: 'border-l-green-500',
}

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  const { updateTaskStatus } = useStore()
  const [showReason, setShowReason] = useState(false)

  const isCompleted = task.status === 'selesai'
  const isPostponed = task.status === 'ditunda'

  return (
    <>
      <div
        className={clsx(
          'bg-white rounded-xl border-l-4 shadow-sm p-4',
          priorityBorder[task.priority],
          (isCompleted || isPostponed) && 'opacity-60'
        )}
      >
        <div className="flex items-start gap-3">
          <div className={clsx(
            'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5',
            {
              'bg-blue-100 text-blue-600': task.type === 'siram',
              'bg-green-100 text-green-600': task.type === 'pupuk',
              'bg-purple-100 text-purple-600': task.type === 'semprot',
              'bg-amber-100 text-amber-600': task.type === 'pantau',
              'bg-gray-100 text-gray-600': task.type === 'lainnya',
            }
          )}>
            {typeIcon[task.type]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-medium text-gray-500">{typeLabel[task.type]}</span>
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                {
                  'bg-red-100 text-red-700': task.priority === 'tinggi',
                  'bg-amber-100 text-amber-700': task.priority === 'sedang',
                  'bg-green-100 text-green-700': task.priority === 'rendah',
                }
              )}>
                {task.priority === 'tinggi' ? 'Prioritas Tinggi' : task.priority === 'sedang' ? 'Sedang' : 'Rendah'}
              </span>
            </div>

            <h3 className={clsx('font-semibold text-gray-900', isCompleted && 'line-through')}>{task.title}</h3>
            <p className="text-sm text-gray-600 mt-1 leading-snug">{task.description}</p>

            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{task.bestTime}</span>
            </div>
          </div>
        </div>

        {!isCompleted && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowReason(true)}
              className="flex items-center gap-1.5 text-xs text-blue-600 font-medium py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors min-h-[36px]"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Kenapa?
            </button>

            {!isPostponed && (
              <>
                <button
                  onClick={() => updateTaskStatus(task.id, 'ditunda')}
                  className="flex items-center gap-1.5 text-xs text-gray-600 font-medium py-1.5 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors min-h-[36px]"
                >
                  <X className="w-3.5 h-3.5" />
                  Tunda
                </button>
                <button
                  onClick={() => updateTaskStatus(task.id, 'selesai')}
                  className="flex items-center gap-1.5 text-xs text-white font-medium py-1.5 px-3 rounded-lg bg-green-600 hover:bg-green-700 transition-colors min-h-[36px] ml-auto"
                >
                  <Check className="w-3.5 h-3.5" />
                  Selesai
                </button>
              </>
            )}

            {isPostponed && (
              <button
                onClick={() => updateTaskStatus(task.id, 'pending')}
                className="flex items-center gap-1.5 text-xs text-amber-700 font-medium py-1.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors min-h-[36px]"
              >
                Batalkan Tunda
              </button>
            )}
          </div>
        )}

        {isCompleted && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Selesai</span>
          </div>
        )}
      </div>

      {showReason && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowReason(false)}>
          <div className="bg-white rounded-t-2xl p-6 w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Mengapa tugas ini penting?</h3>
            <p className="text-gray-600 leading-relaxed">{task.reason}</p>
            <button
              onClick={() => setShowReason(false)}
              className="mt-4 w-full py-3 bg-green-600 text-white font-semibold rounded-xl"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  )
}
