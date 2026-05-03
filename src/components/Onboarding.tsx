'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Leaf, Activity, Camera, Brain, Calendar,
  ChevronRight, ChevronLeft, X, Zap, CheckCircle,
  Wifi, Droplets, Bell
} from 'lucide-react'
import clsx from 'clsx'

const STORAGE_KEY = 'smartfarm-onboarding-done'

interface Step {
  id: number
  emoji: string
  title: string
  subtitle: string
  description: string
  features: string[]
  color: string
  bgColor: string
  icon: React.ReactNode
}

const STEPS: Step[] = [
  {
    id: 1,
    emoji: '🌱',
    title: 'Selamat Datang di Smart Farm',
    subtitle: 'Dashboard Pertanian Cerdas Anda',
    description: 'Smart Farm membantu Anda memantau lahan cabai dan tomat dengan sensor IoT dan kecerdasan buatan — langsung dari HP.',
    features: [
      'Monitor lahan 24 jam dari mana saja',
      'AI analisis kondisi tanaman otomatis',
      'Rekomendasi tindakan harian yang tepat',
    ],
    color: 'text-green-700',
    bgColor: 'from-green-500 to-green-600',
    icon: <Leaf className="w-16 h-16 text-white" />,
  },
  {
    id: 2,
    emoji: '📍',
    title: 'Tambahkan Plot Lahan',
    subtitle: 'Daftarkan lahan pertama Anda',
    description: 'Setiap plot lahan dipantau secara independen. Isi nama lahan, jenis tanaman, tanggal tanam, dan luas lahan — AI akan menghitung HST otomatis.',
    features: [
      'Mendukung cabai, tomat, dan tanaman lainnya',
      'Sistem menghitung Hari Setelah Tanam (HST) otomatis',
      'Bisa kelola banyak plot sekaligus',
    ],
    color: 'text-blue-700',
    bgColor: 'from-blue-500 to-blue-600',
    icon: <div className="text-6xl">🗺️</div>,
  },
  {
    id: 3,
    emoji: '📡',
    title: 'Sensor IoT Real-Time',
    subtitle: 'Data langsung dari lapangan',
    description: 'Node IoT (ESP32) yang dipasang di lahan mengirim data sensor setiap 30 menit. AI langsung menganalisis dan mengambil tindakan jika diperlukan.',
    features: [
      'Kelembapan tanah, suhu udara, intensitas cahaya',
      'Grafik tren 14 hari dengan zoom dan scroll',
      'Alert otomatis jika sensor di luar batas aman',
    ],
    color: 'text-cyan-700',
    bgColor: 'from-cyan-500 to-cyan-600',
    icon: <Activity className="w-16 h-16 text-white" />,
  },
  {
    id: 4,
    emoji: '🤖',
    title: 'AI Analisis & Otomasi',
    subtitle: 'AI bekerja untuk Anda 24 jam',
    description: 'Upload foto tanaman — AI langsung mendeteksi penyakit, kekurangan nutrisi, dan memberikan rekomendasi. AI juga mengontrol aktuator (pompa, dispenser) secara otomatis.',
    features: [
      'Deteksi 10+ penyakit dan defisiensi nutrisi',
      'Kontrol pompa air, dispenser pupuk otomatis',
      'Riwayat keputusan AI transparan dan bisa diaudit',
    ],
    color: 'text-purple-700',
    bgColor: 'from-purple-500 to-purple-600',
    icon: <Brain className="w-16 h-16 text-white" />,
  },
  {
    id: 5,
    emoji: '📅',
    title: 'Kalender & Notifikasi',
    subtitle: 'Tugas harian yang sudah disiapkan AI',
    description: 'Setiap pagi, AI sudah menyiapkan daftar tugas berdasarkan kondisi sensor, cuaca, dan analisis foto. Tinggal centang selesai!',
    features: [
      'To-do list harian otomatis dari AI setiap pukul 06.00',
      'Notifikasi WhatsApp jika ada kondisi kritis',
      'Chatbot asisten pertanian berbahasa Indonesia',
    ],
    color: 'text-amber-700',
    bgColor: 'from-amber-500 to-amber-600',
    icon: <Calendar className="w-16 h-16 text-white" />,
  },
]

export function useOnboarding() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY)
      if (!done) setShow(true)
    } catch { /* ignore */ }
  }, [])

  const complete = () => {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    setShow(false)
  }

  const reset = () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    setShow(true)
  }

  return { show, complete, reset }
}

interface OnboardingProps {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [animDir, setAnimDir] = useState<'left' | 'right'>('right')
  const router = useRouter()

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const go = (dir: 'next' | 'prev') => {
    setAnimDir(dir === 'next' ? 'right' : 'left')
    if (dir === 'next') setStep(s => Math.min(s + 1, STEPS.length - 1))
    else setStep(s => Math.max(s - 1, 0))
  }

  const handleDone = () => {
    onComplete()
    router.push('/plots/new')
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col max-w-md mx-auto">
      {/* Skip */}
      <div className="flex justify-end p-4">
        <button onClick={onComplete} className="flex items-center gap-1 text-sm text-gray-400 font-medium py-2 px-3 rounded-xl hover:bg-gray-100">
          <X className="w-4 h-4" />
          Lewati
        </button>
      </div>

      {/* Visual area */}
      <div className={clsx('mx-4 rounded-3xl bg-gradient-to-br p-8 flex flex-col items-center justify-center text-center mb-6', current.bgColor)}
        style={{ minHeight: '240px' }}>
        <div className="mb-3">
          {current.icon}
        </div>
        <div className="text-4xl mb-2">{current.emoji}</div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Langkah {step + 1} dari {STEPS.length}
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{current.title}</h2>
        <p className={clsx('text-sm font-semibold mb-3', current.color)}>{current.subtitle}</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{current.description}</p>

        <div className="space-y-2">
          {current.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <CheckCircle className={clsx('w-4 h-4 flex-shrink-0 mt-0.5', current.color)} />
              <p className="text-sm text-gray-700">{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-2 py-4">
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={clsx('rounded-full transition-all', i === step ? 'w-6 h-2 bg-green-600' : 'w-2 h-2 bg-gray-200')} />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 px-6 pb-8">
        {step > 0 && (
          <button
            onClick={() => go('prev')}
            className="flex items-center gap-1.5 px-5 py-3.5 border border-gray-200 rounded-2xl font-semibold text-gray-600 min-h-[52px]"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </button>
        )}
        <button
          onClick={isLast ? handleDone : () => go('next')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white min-h-[52px] transition-colors shadow-lg',
            isLast ? 'bg-green-600 shadow-green-200' : 'bg-gray-900'
          )}
        >
          {isLast ? (
            <>Mulai Tambah Plot <Leaf className="w-5 h-5" /></>
          ) : (
            <>Selanjutnya <ChevronRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </div>
  )
}
