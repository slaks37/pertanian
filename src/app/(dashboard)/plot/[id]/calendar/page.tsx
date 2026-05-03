'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import TaskCard from '@/components/TaskCard'
import { CalendarDays, CheckCircle, Clock } from 'lucide-react'

export default function CalendarPage() {
  const { id } = useParams<{ id: string }>()
  const { state } = useStore()

  const plot = state.plots.find(p => p.id === id)
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const todayTasks = state.tasks.filter(t => t.plotId === id && t.date === today)
  const tomorrowTasks = state.tasks.filter(t => t.plotId === id && t.date === tomorrow)

  const pendingTasks = todayTasks.filter(t => t.status === 'pending')
  const postponedTasks = todayTasks.filter(t => t.status === 'ditunda')
  const doneTasks = todayTasks.filter(t => t.status === 'selesai')

  const progress = todayTasks.length > 0 ? Math.round((doneTasks.length / todayTasks.length) * 100) : 0

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Date header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-green-600" />
            <h1 className="font-bold text-gray-900">Jadwal Tugas</h1>
          </div>
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">Hari Ini</span>
        </div>
        <p className="text-sm text-gray-600 capitalize mb-3">{todayFormatted}</p>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-700 min-w-fit">{doneTasks.length}/{todayTasks.length} selesai</span>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-gray-500">{pendingTasks.length} menunggu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs text-gray-500">{doneTasks.length} selesai</span>
          </div>
        </div>
      </div>

      {/* Today pending tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Tugas Tertunda ({pendingTasks.length})
          </h2>
          <div className="space-y-3">
            {pendingTasks
              .sort((a, b) => {
                const priority = { tinggi: 0, sedang: 1, rendah: 2 }
                return priority[a.priority] - priority[b.priority]
              })
              .map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>
      )}

      {/* Today postponed tasks */}
      {postponedTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Ditunda ({postponedTasks.length})
          </h2>
          <div className="space-y-3">
            {postponedTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>
      )}

      {/* Done tasks */}
      {doneTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Selesai ({doneTasks.length})
          </h2>
          <div className="space-y-3">
            {doneTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>
      )}

      {/* Tomorrow tasks */}
      {tomorrowTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2 mt-2 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            Besok ({tomorrowTasks.length} tugas)
          </h2>
          <div className="space-y-3">
            {tomorrowTasks.map(task => (
              <div key={task.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200 opacity-75">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === 'tinggi' ? 'bg-red-400' : task.priority === 'sedang' ? 'bg-amber-400' : 'bg-green-400'
                  }`} />
                  <p className="text-sm font-medium text-gray-700">{task.title}</p>
                  <span className="ml-auto text-xs text-gray-400">{task.bestTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {todayTasks.length === 0 && tomorrowTasks.length === 0 && (
        <div className="text-center py-12">
          <CalendarDays className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada tugas terjadwal</p>
        </div>
      )}

      {plot && progress === 100 && doneTasks.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="font-bold text-green-800">Semua tugas hari ini selesai!</p>
          <p className="text-sm text-green-600 mt-1">Kerja bagus, {state.user?.name ?? 'Petani'}! 🌱</p>
        </div>
      )}
    </div>
  )
}
