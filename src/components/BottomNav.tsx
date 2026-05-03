'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Activity, Camera, Calendar, MessageCircle, Calculator } from 'lucide-react'
import clsx from 'clsx'
import { useStore } from '@/lib/store'

interface NavItem {
  label: string
  icon: React.ReactNode
  href: (plotId: string | null) => string
  matchPaths?: string[]
}

const navItems: NavItem[] = [
  {
    label: 'Beranda',
    icon: <Home className="w-5 h-5" />,
    href: () => '/dashboard',
    matchPaths: ['/dashboard'],
  },
  {
    label: 'Sensor',
    icon: <Activity className="w-5 h-5" />,
    href: (plotId) => plotId ? `/plot/${plotId}/sensor` : '/dashboard',
    matchPaths: ['/sensor'],
  },
  {
    label: 'Foto',
    icon: <Camera className="w-5 h-5" />,
    href: (plotId) => plotId ? `/plot/${plotId}/photos` : '/dashboard',
    matchPaths: ['/photos'],
  },
  {
    label: 'Kalender',
    icon: <Calendar className="w-5 h-5" />,
    href: (plotId) => plotId ? `/plot/${plotId}/calendar` : '/dashboard',
    matchPaths: ['/calendar'],
  },
  {
    label: 'Chat',
    icon: <MessageCircle className="w-5 h-5" />,
    href: (plotId) => plotId ? `/plot/${plotId}/chatbot` : '/dashboard',
    matchPaths: ['/chatbot'],
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { state } = useStore()
  const plotId = state.activePlotId

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40">
      <div className="flex items-stretch max-w-md mx-auto">
        {navItems.map((item) => {
          const href = item.href(plotId)
          const isActive = item.matchPaths
            ? item.matchPaths.some(p => pathname.includes(p))
            : pathname === href

          return (
            <button
              key={item.label}
              onClick={() => router.push(href)}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] transition-colors',
                isActive ? 'text-green-600' : 'text-gray-400 active:text-gray-600'
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-8 bg-green-600 rounded-t-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
