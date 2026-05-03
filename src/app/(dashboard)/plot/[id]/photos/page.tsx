'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useState, useRef } from 'react'
import { Camera, Upload, AlertCircle, CheckCircle, AlertTriangle, ImageIcon, X } from 'lucide-react'
import { Photo, PhotoAnalysis } from '@/types'
import clsx from 'clsx'

export default function PhotosPage() {
  const { id } = useParams<{ id: string }>()
  const { state, addPhoto, updatePhotoAnalysis, getHST } = useStore()

  const plot = state.plots.find(p => p.id === id)
  const photos = state.photos.filter(p => p.plotId === id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<PhotoAnalysis | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const hst = plot ? getHST(plot.plantingDate) : 0

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setAnalysisResult(null)
    setError('')
    const reader = new FileReader()
    reader.onload = ev => setPreviewUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!selectedFile || !previewUrl) return
    setAnalyzing(true)
    setError('')

    try {
      // Convert to base64
      const base64 = previewUrl.split(',')[1]

      const res = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mediaType: selectedFile.type,
          cropType: plot?.cropType ?? 'cabai',
          hst,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Gagal menganalisis foto')

      const analysis: PhotoAnalysis = data.analysis
      setAnalysisResult(analysis)

      // Save photo
      const photoId = `photo-${Date.now()}`
      const newPhoto: Photo = {
        id: photoId,
        plotId: id,
        url: previewUrl,
        hst,
        timestamp: new Date().toISOString(),
        analysis,
      }
      addPhoto(newPhoto)

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errMsg)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setAnalysisResult(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const severityConfig = {
    normal: { label: 'Normal', color: 'text-green-700 bg-green-100', icon: <CheckCircle className="w-5 h-5 text-green-600" /> },
    perhatian: { label: 'Perhatian', color: 'text-amber-700 bg-amber-100', icon: <AlertTriangle className="w-5 h-5 text-amber-600" /> },
    kritis: { label: 'Kritis', color: 'text-red-700 bg-red-100', icon: <AlertCircle className="w-5 h-5 text-red-600" /> },
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Analisis Foto</h1>
        <span className="text-sm text-gray-500">{photos.length} foto</span>
      </div>

      {/* Upload section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          id="photo-input"
        />

        {!previewUrl ? (
          <label
            htmlFor="photo-input"
            className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 rounded-xl py-8 cursor-pointer bg-green-50 hover:bg-green-100 transition-colors"
          >
            <Camera className="w-10 h-10 text-green-500 mb-2" />
            <p className="font-semibold text-green-700">Ambil atau Pilih Foto</p>
            <p className="text-xs text-gray-500 mt-1">Foto daun, batang, atau buah tanaman</p>
          </label>
        ) : (
          <div>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview" className="w-full h-56 object-cover rounded-xl" />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/50 rounded-full px-3 py-1">
                <span className="text-white text-xs font-medium">HST {hst}</span>
              </div>
            </div>

            {!analysisResult && !analyzing && (
              <button
                onClick={handleAnalyze}
                className="mt-3 w-full py-3.5 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 min-h-[52px]"
              >
                <Upload className="w-5 h-5" />
                Analisis dengan AI
              </button>
            )}

            {analyzing && (
              <div className="mt-3 bg-green-50 rounded-xl p-4 flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-sm text-green-700 font-medium">AI sedang menganalisis tanaman Anda...</span>
              </div>
            )}

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis result */}
      {analysisResult && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Hasil Analisis AI</h2>
              <span className={clsx('text-xs font-bold px-3 py-1 rounded-full', severityConfig[analysisResult.severity].color)}>
                {severityConfig[analysisResult.severity].label}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Condition + confidence */}
            <div className="flex items-start gap-3">
              {severityConfig[analysisResult.severity].icon}
              <div>
                <p className="font-semibold text-gray-900">{analysisResult.condition}</p>
                <p className="text-sm text-gray-500">Tingkat kepercayaan: <strong>{analysisResult.confidence}%</strong></p>
              </div>
            </div>

            {/* Issues */}
            {analysisResult.issues.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">Masalah Terdeteksi</h3>
                <ul className="space-y-1">
                  {analysisResult.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-red-400 mt-0.5">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">Rekomendasi</h3>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-green-50 rounded-lg p-2">
                    <span className="text-green-500 mt-0.5 font-bold">{i + 1}.</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleClear}
              className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm"
            >
              Analisis Foto Lain
            </button>
          </div>
        </div>
      )}

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Galeri Foto</h2>
          <div className="grid grid-cols-2 gap-3">
            {photos.map(photo => (
              <div key={photo.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="relative h-32 bg-green-50 flex items-center justify-center">
                  {photo.url.startsWith('data:') || photo.url.startsWith('http') ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={photo.url} alt={`HST ${photo.hst}`} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-green-300" />
                  )}
                  {photo.analysis && (
                    <span className={clsx(
                      'absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full',
                      severityConfig[photo.analysis.severity].color
                    )}>
                      {severityConfig[photo.analysis.severity].label}
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-700">HST {photo.hst}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(photo.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && !previewUrl && (
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Belum ada foto tersimpan</p>
          <p className="text-gray-400 text-xs mt-1">Ambil foto tanaman untuk analisis AI</p>
        </div>
      )}
    </div>
  )
}
