'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Leaf, User, Phone, Lock, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Nama wajib diisi'
    if (!form.phone) errs.phone = 'Nomor HP wajib diisi'
    else if (!/^08\d{8,11}$/.test(form.phone)) errs.phone = 'Format HP tidak valid (contoh: 081234567890)'
    if (!form.password) errs.password = 'Password wajib diisi'
    else if (form.password.length < 6) errs.password = 'Password minimal 6 karakter'
    if (!form.confirm) errs.confirm = 'Konfirmasi password wajib diisi'
    else if (form.confirm !== form.password) errs.confirm = 'Password tidak sama'
    return errs
  }

  const handleRegister = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    router.push('/login')
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }))
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-700 flex flex-col">
      <div className="flex items-center px-4 pt-12 pb-6">
        <Link href="/login" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white mr-3">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">Smart Farm</h1>
          </div>
          <p className="text-green-200 text-sm">Buat akun baru</p>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl px-6 pt-8 pb-10 flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Daftar Akun</h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              {...field('name')}
              placeholder="Budi Santoso"
              className={clsx(
                'w-full pl-10 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base',
                errors.name ? 'border-red-300' : 'border-gray-200'
              )}
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor HP</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              {...field('phone')}
              placeholder="081234567890"
              className={clsx(
                'w-full pl-10 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base',
                errors.phone ? 'border-red-300' : 'border-gray-200'
              )}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPass ? 'text' : 'password'}
              {...field('password')}
              placeholder="Min. 6 karakter"
              className={clsx(
                'w-full pl-10 pr-12 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base',
                errors.password ? 'border-red-300' : 'border-gray-200'
              )}
            />
            <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        {/* Confirm password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showConfirm ? 'text' : 'password'}
              {...field('confirm')}
              placeholder="Ulangi password"
              className={clsx(
                'w-full pl-10 pr-12 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base',
                errors.confirm ? 'border-red-300' : 'border-gray-200'
              )}
            />
            <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-4 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-200 min-h-[52px] text-base"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Daftar Sekarang
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-green-600 font-semibold">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
