'use client'

import { useState } from 'react'
import { Calculator, ChevronDown, FlaskConical, Clock } from 'lucide-react'

interface InputType {
  label: string
  unit: string
  dosePerM2: number
  mixRatio?: string
  applicationTime: string
  notes: string
}

const INPUT_TYPES: Record<string, InputType> = {
  'pupuk-urea': {
    label: 'Pupuk Urea (46% N)',
    unit: 'gram',
    dosePerM2: 5,
    applicationTime: 'Pagi 07.00-09.00',
    notes: 'Larutkan dalam air sebelum disiramkan ke tanah. Jangan aplikasi saat hujan.',
  },
  'pupuk-npk': {
    label: 'Pupuk NPK 16-16-16',
    unit: 'gram',
    dosePerM2: 8,
    applicationTime: 'Pagi 07.00-09.00',
    notes: 'Untuk pemupukan berimbang. Campurkan dengan 2 liter air per tanaman.',
  },
  'pupuk-kcl': {
    label: 'Pupuk KCl (Kalium Klorida)',
    unit: 'gram',
    dosePerM2: 4,
    applicationTime: 'Pagi 08.00-10.00',
    notes: 'Meningkatkan kualitas buah dan ketahanan penyakit. Larutkan sebelum siram.',
  },
  'pupuk-kompos': {
    label: 'Pupuk Kompos Organik',
    unit: 'kilogram',
    dosePerM2: 2,
    applicationTime: 'Pagi kapan saja',
    notes: 'Campur rata dengan tanah pada kedalaman 10-15 cm. Sangat baik untuk struktur tanah.',
  },
  'fungisida-dithane': {
    label: 'Fungisida Dithane M-45',
    unit: 'gram',
    dosePerM2: 0.4,
    mixRatio: '2g per liter air',
    applicationTime: 'Sore 16.00-18.00',
    notes: 'Jangan semprot saat suhu > 32°C atau angin kencang. Pakai APD lengkap.',
  },
  'fungisida-antracol': {
    label: 'Fungisida Antracol 70WP',
    unit: 'gram',
    dosePerM2: 0.35,
    mixRatio: '1.75g per liter air',
    applicationTime: 'Sore 15.00-17.00',
    notes: 'Efektif untuk hawar daun tomat. Rotasi dengan fungisida lain setiap 2 minggu.',
  },
  'insektisida-decis': {
    label: 'Insektisida Decis 2.5EC',
    unit: 'ml',
    dosePerM2: 0.1,
    mixRatio: '0.5ml per liter air',
    applicationTime: 'Pagi 07.00-08.00',
    notes: 'Untuk kutu daun dan trips. Tambahkan perekat (spreader) untuk hasil optimal.',
  },
  'insektisida-confidor': {
    label: 'Insektisida Confidor 200SL',
    unit: 'ml',
    dosePerM2: 0.05,
    mixRatio: '0.25ml per liter air',
    applicationTime: 'Pagi 06.00-08.00',
    notes: 'Sistemik, efektif 2-3 minggu. Hindari penggunaan berulang untuk mencegah resistensi.',
  },
  'kapur-pertanian': {
    label: 'Kapur Pertanian (Dolomit)',
    unit: 'gram',
    dosePerM2: 50,
    applicationTime: '1 minggu sebelum tanam',
    notes: 'Menaikkan pH tanah. Aplikasi jauh sebelum pemupukan untuk hindari reaksi kimia.',
  },
}

export default function CalculatorPage() {
  const [luas, setLuas] = useState('')
  const [inputType, setInputType] = useState('')
  const [doseCustom, setDoseCustom] = useState('')
  const [result, setResult] = useState<{
    total: number
    unit: string
    waterNeeded: number
    inputInfo: InputType
  } | null>(null)

  const calculate = () => {
    if (!luas || !inputType) return
    const luasNum = parseFloat(luas)
    if (isNaN(luasNum) || luasNum <= 0) return

    const info = INPUT_TYPES[inputType]
    const dose = doseCustom ? parseFloat(doseCustom) : info.dosePerM2
    const total = luasNum * dose
    const waterNeeded = Math.ceil(luasNum * 0.5) // ~0.5 liter/m²

    setResult({ total, unit: info.unit, waterNeeded, inputInfo: info })
  }

  const formatTotal = (val: number, unit: string) => {
    if (unit === 'kilogram') return `${val.toFixed(1)} kg`
    if (val >= 1000) return `${(val / 1000).toFixed(2)} kg (${val.toFixed(0)} gram)`
    if (unit === 'ml' && val >= 1000) return `${(val / 1000).toFixed(2)} liter`
    return `${val.toFixed(1)} ${unit}`
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="w-6 h-6 text-green-600" />
        <h1 className="text-lg font-bold text-gray-900">Kalkulator Input Presisi</h1>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        {/* Luas lahan */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Luas Lahan</label>
          <div className="relative">
            <input
              type="number"
              value={luas}
              onChange={e => setLuas(e.target.value)}
              placeholder="500"
              min={1}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">m²</span>
          </div>
        </div>

        {/* Input type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Input</label>
          <div className="relative">
            <select
              value={inputType}
              onChange={e => { setInputType(e.target.value); setResult(null); setDoseCustom('') }}
              className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
            >
              <option value="">Pilih jenis input...</option>
              <optgroup label="Pupuk">
                <option value="pupuk-urea">Pupuk Urea (46% N)</option>
                <option value="pupuk-npk">Pupuk NPK 16-16-16</option>
                <option value="pupuk-kcl">Pupuk KCl</option>
                <option value="pupuk-kompos">Pupuk Kompos Organik</option>
              </optgroup>
              <optgroup label="Fungisida">
                <option value="fungisida-dithane">Fungisida Dithane M-45</option>
                <option value="fungisida-antracol">Fungisida Antracol 70WP</option>
              </optgroup>
              <optgroup label="Insektisida">
                <option value="insektisida-decis">Insektisida Decis 2.5EC</option>
                <option value="insektisida-confidor">Insektisida Confidor 200SL</option>
              </optgroup>
              <optgroup label="Amendemen Tanah">
                <option value="kapur-pertanian">Kapur Pertanian (Dolomit)</option>
              </optgroup>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Custom dose */}
        {inputType && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Dosis per m²
              <span className="font-normal text-gray-400 ml-1">(standar: {INPUT_TYPES[inputType].dosePerM2} {INPUT_TYPES[inputType].unit})</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={doseCustom}
                onChange={e => setDoseCustom(e.target.value)}
                placeholder={String(INPUT_TYPES[inputType].dosePerM2)}
                min={0}
                step={0.1}
                className="w-full px-4 py-3 pr-16 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                {INPUT_TYPES[inputType].unit}/m²
              </span>
            </div>
          </div>
        )}

        <button
          onClick={calculate}
          disabled={!luas || !inputType}
          className="w-full py-4 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
        >
          <Calculator className="w-5 h-5" />
          Hitung Kebutuhan
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-green-600 px-4 py-3">
            <h2 className="font-bold text-white">Hasil Perhitungan</h2>
            <p className="text-green-200 text-xs">{result.inputInfo.label} — {luas} m²</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Total */}
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Total Kebutuhan</p>
              <p className="text-3xl font-bold text-green-700">{formatTotal(result.total, result.unit)}</p>
            </div>

            {/* Mix guide */}
            {result.inputInfo.mixRatio && (
              <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
                <FlaskConical className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Panduan Pencampuran</p>
                  <p className="text-sm text-blue-700 mt-0.5">{result.inputInfo.mixRatio}</p>
                  <p className="text-sm text-blue-600 mt-1">Air yang dibutuhkan: <strong>±{result.waterNeeded} liter</strong></p>
                </div>
              </div>
            )}

            {/* Application time */}
            <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Waktu Aplikasi Terbaik</p>
                <p className="text-sm text-amber-700 mt-0.5">{result.inputInfo.applicationTime}</p>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Catatan Penting</p>
              <p className="text-xs text-gray-600 leading-relaxed">{result.inputInfo.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reference table */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-bold text-gray-900 text-sm mb-3">Tabel Dosis Referensi</h2>
        <div className="space-y-2">
          {Object.entries(INPUT_TYPES).map(([key, info]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-600 flex-1 pr-2">{info.label}</span>
              <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                {info.dosePerM2} {info.unit}/m²
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
