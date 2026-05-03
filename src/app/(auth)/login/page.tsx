'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Leaf, Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import clsx from 'clsx'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useStore()
  const [tab, setTab] = useState<'otp' | 'password'>('otp')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleSendOtp = async () => {
    if (!phone) { setError('Masukkan nomor HP terlebih dahulu'); return }
    setError('')
    setOtpLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setOtpLoading(false)
    setOtpSent(true)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleLogin = async () => {
    setError('')
    if (!phone) { setError('Masukkan nomor HP'); return }

    if (tab === 'otp') {
      const otp = otpDigits.join('')
      if (otp.length < 6) { setError('Masukkan 6 digit OTP'); return }
      if (otp !== '123456') { setError('Kode OTP tidak valid. Gunakan 123456 untuk demo.'); return }
    } else {
      if (!password) { setError('Masukkan password'); return }
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))

    login({
      id: 'user-1',
      name: 'Budi Santoso',
      phone,
      role: 'petani',
    })
    router.replace('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-700 flex flex-col">
      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-4">
          <Leaf className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-white">Smart Farm</h1>
        <p className="text-green-200 text-sm mt-1">Monitoring Tanaman Cerdas</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-t-3xl px-6 pt-8 pb-10">
        {/* Tab */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setTab('otp'); setError(''); setOtpSent(false); setOtpDigits(['','','','','','']) }}
            className={clsx('flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all', tab === 'otp' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500')}
          >
            OTP HP
          </button>
          <button
            onClick={() => { setTab('password'); setError('') }}
            className={clsx('flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all', tab === 'password' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500')}
          >
            Password
          </button>
        </div>

        {/* Phone input (both tabs) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor HP</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="081234567890"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
            />
          </div>
        </div>

        {tab === 'otp' && (
          <>
            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={otpLoading}
                className="w-full py-3 bg-green-50 text-green-700 font-semibold rounded-xl border border-green-200 mb-4 flex items-center justify-center gap-2 min-h-[48px]"
              >
                {otpLoading ? (
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                ) : 'Kirim OTP'}
              </button>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Masukkan kode OTP yang dikirim ke <strong>{phone}</strong>
                  <span className="text-green-600 text-xs ml-2">(Demo: gunakan 123456)</span>
                </p>
                <div className="flex gap-2 justify-center">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el }}
                      type="tel"
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      maxLength={1}
                      className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'password' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Demo: gunakan password apa saja</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-200 min-h-[52px] text-base"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Masuk
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-green-600 font-semibold">Daftar</Link>
        </p>
      </div>
    </div>
  )
}
