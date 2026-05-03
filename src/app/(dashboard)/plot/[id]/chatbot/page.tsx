'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Leaf } from 'lucide-react'
import { ChatMessage } from '@/types'
import clsx from 'clsx'

const QUICK_QUESTIONS = [
  'Kapan bisa panen?',
  'Kenapa daun kuning?',
  'Dosis pupuk hari ini?',
  'Cara mengatasi hama?',
]

export default function ChatbotPage() {
  const { id } = useParams<{ id: string }>()
  const { state, addMessage, getHST } = useStore()

  const plot = state.plots.find(p => p.id === id)
  const messages = state.chatHistory[id] ?? []
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hst = plot ? getHST(plot.plantingDate) : 0
  const latestSensor = state.sensorData[id]?.slice(-1)[0]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    setInput('')

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }
    addMessage(id, userMsg)
    setLoading(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          plotName: plot?.name ?? 'Lahan saya',
          cropType: plot?.cropType ?? 'cabai',
          hst,
          sensorData: latestSensor ?? null,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Gagal menghubungi asisten')

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      }
      addMessage(id, aiMsg)
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      const errMsgObj: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Maaf, terjadi kesalahan: ${errMsg}. Silakan coba lagi.`,
        timestamp: new Date().toISOString(),
      }
      addMessage(id, errMsgObj)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Leaf className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">Asisten TaniCerdas</p>
          <p className="text-xs text-green-600">AI • {plot?.name ?? 'Lahan Saya'}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">Online</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bot className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-semibold text-gray-800">Asisten TaniCerdas siap membantu!</p>
            <p className="text-sm text-gray-500 mt-1">Tanyakan apa saja seputar pertanian Anda</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={clsx('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1', msg.role === 'user' ? 'bg-green-600' : 'bg-white border border-gray-200')}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Leaf className="w-4 h-4 text-green-600" />}
            </div>
            <div className={clsx('max-w-[78%]', msg.role === 'user' ? 'items-end' : 'items-start', 'flex flex-col')}>
              <div className={clsx('rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap', msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm')}>
                {msg.content}
              </div>
              <span className="text-xs text-gray-400 mt-1 px-1">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
              <Leaf className="w-4 h-4 text-green-600" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      {messages.length < 2 && (
        <div className="bg-white border-t border-gray-100 px-4 py-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="flex-shrink-0 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 safe-bottom">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder="Tanya asisten pertanian..."
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors', input.trim() && !loading ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400')}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
