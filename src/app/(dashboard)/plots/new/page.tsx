'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, Calendar, Sprout, Ruler } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Plot, CropType, SoilType } from '@/types'
import clsx from 'clsx'

export default function NewPlotPage() {
  const router = useRouter()
  const { addPlot } = useStore()
  const [form, setForm] = useState({
    name: '',
    cropType: 'cabai' as CropType,
    plantingDate: new Date().toISOString().split('T')[0],
    soilType: 'lempung' as SoilType,
    area: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Nama plot wajib diisi'
    if (!form.plantingDate) errs.plantingDate = 'Tanggal tanam wajib diisi'
    if (!form.area || isNaN(Number(form.area)) || Number(form.area) <= 0) errs.area = 'Luas lahan harus angka positif'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    const newPlot: Plot = {
      id: `plot-${Date.now()}`,
      name: form.name.trim(),
      cropType: form.cropType,
      plantingDate: form.plantingDate,
      soilType: form.soilType,
      area: Number(form.area),
      conditionScore: 75,
      status: 'baik',
      nodeId: `NODE-${Math.floor(Math.random() * 900) + 100}`,
      createdAt: new Date().toISOString(),
      archived: false,
    }
    addPlot(newPlot)
    router.replace(`/plot/${newPlot.id}`)
  }

  const set = (key: string, val: string) => {
    setForm(p => ({ ...p, [key]: val }))
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }))
  }

  const cropOptions: { value: CropType; label: string; emoji: string }[] = [
    { value: 'cabai', label: 'Cabai', emoji: '🌶️' },
    { value: 'tomat', label: 'Tomat', emoji: '🍅' },
    { value: 'lainnya', label: 'Lainnya', emoji: '🌿' },
  ]

  const soilOptions: { value: SoilType; label: string; desc: string }[] = [
    { value: 'lempung', label: 'Tanah Lempung', desc: 'Subur, baik untuk sebagian besar tanaman' },
    { value: 'pasir', label: 'Tanah Pasir', desc: 'Drainase baik, perlu irigasi lebih sering' },
    { value: 'liat', label: 'Tanah Liat', desc: 'Retensi air tinggi, perlu pengolahan' },
  ]

  return (
    <div className="px-4 py-4">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-green-700 font-medium mb-4">
        <ChevronLeft className="w-5 h-5" />
        Kembali
      </button>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Tambah Plot Baru</h1>

      {/* Plot name */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <MapPin className="inline w-4 h-4 mr-1 text-green-600" />
          Nama Plot
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Contoh: Kebun Cabai Belakang"
          className={clsx('w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-base', errors.name ? 'border-red-300' : 'border-gray-200')}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Crop type */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Sprout className="inline w-4 h-4 mr-1 text-green-600" />
          Jenis Tanaman
        </label>
        <div className="grid grid-cols-3 gap-2">
          {cropOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => set('cropType', opt.value)}
              className={clsx('py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-colors', form.cropType === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white')}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className={clsx('text-xs font-semibold', form.cropType === opt.value ? 'text-green-700' : 'text-gray-600')}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Planting date */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Calendar className="inline w-4 h-4 mr-1 text-green-600" />
          Tanggal Tanam
        </label>
        <input
          type="date"
          value={form.plantingDate}
          onChange={e => set('plantingDate', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={clsx('w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-base', errors.plantingDate ? 'border-red-300' : 'border-gray-200')}
        />
        {errors.plantingDate && <p className="text-xs text-red-500 mt-1">{errors.plantingDate}</p>}
      </div>

      {/* Soil type */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Tanah</label>
        <div className="space-y-2">
          {soilOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => set('soilType', opt.value)}
              className={clsx('w-full px-4 py-3 rounded-xl border-2 text-left transition-colors', form.soilType === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white')}
            >
              <p className={clsx('font-semibold text-sm', form.soilType === opt.value ? 'text-green-700' : 'text-gray-900')}>{opt.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Area */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Ruler className="inline w-4 h-4 mr-1 text-green-600" />
          Luas Lahan (m²)
        </label>
        <input
          type="number"
          value={form.area}
          onChange={e => set('area', e.target.value)}
          placeholder="Contoh: 500"
          min="1"
          className={clsx('w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-base', errors.area ? 'border-red-300' : 'border-gray-200')}
        />
        {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-200 min-h-[52px] text-base"
      >
        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Simpan Plot'}
      </button>
    </div>
  )
}
