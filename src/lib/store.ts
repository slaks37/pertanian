'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { AppState, Plot, Task, Photo, ChatMessage, User, TaskStatus } from '@/types'
import { generateSensorHistory, generateDemoTasks, generateDemoPhotos, generateDemoChatHistory } from './mockData'

function getHST(plantingDate: string): number {
  const planted = new Date(plantingDate)
  const today = new Date()
  const diffMs = today.getTime() - planted.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

const today = new Date()
const plantDate1 = new Date(today)
plantDate1.setDate(today.getDate() - 42)
const plantDate2 = new Date(today)
plantDate2.setDate(today.getDate() - 23)

const DEMO_PLOTS: Plot[] = [
  {
    id: 'plot-1',
    name: 'Kebun Cabai Utara',
    cropType: 'cabai',
    plantingDate: plantDate1.toISOString().split('T')[0],
    soilType: 'lempung',
    area: 500,
    conditionScore: 87,
    status: 'baik',
    nodeId: 'NODE-001',
    createdAt: plantDate1.toISOString(),
    archived: false,
  },
  {
    id: 'plot-2',
    name: 'Lahan Tomat Selatan',
    cropType: 'tomat',
    plantingDate: plantDate2.toISOString().split('T')[0],
    soilType: 'lempung',
    area: 300,
    conditionScore: 62,
    status: 'perhatian',
    nodeId: 'NODE-002',
    createdAt: plantDate2.toISOString(),
    archived: false,
  },
]

const DEMO_USER: User = {
  id: 'user-1',
  name: 'Budi Santoso',
  phone: '08123456789',
  role: 'petani',
}

function buildInitialState(): AppState {
  return {
    user: null,
    plots: DEMO_PLOTS,
    activePlotId: 'plot-1',
    tasks: [...generateDemoTasks('plot-1'), ...generateDemoTasks('plot-2')],
    photos: [...generateDemoPhotos('plot-1'), ...generateDemoPhotos('plot-2')],
    sensorData: {
      'plot-1': generateSensorHistory('plot-1'),
      'plot-2': generateSensorHistory('plot-2'),
    },
    chatHistory: {
      'plot-1': generateDemoChatHistory('plot-1'),
      'plot-2': generateDemoChatHistory('plot-2'),
    },
  }
}

interface StoreContextType {
  state: AppState
  getHST: (plantingDate: string) => number
  login: (user: User) => void
  logout: () => void
  addPlot: (plot: Plot) => void
  updatePlot: (plotId: string, updates: Partial<Plot>) => void
  archivePlot: (plotId: string) => void
  setActivePlot: (plotId: string) => void
  addTask: (task: Task) => void
  updateTaskStatus: (taskId: string, status: TaskStatus) => void
  addPhoto: (photo: Photo) => void
  updatePhotoAnalysis: (photoId: string, analysis: Photo['analysis']) => void
  addMessage: (plotId: string, message: ChatMessage) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(buildInitialState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartfarm-state')
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AppState>
        setState(prev => ({
          ...prev,
          user: parsed.user ?? null,
          plots: parsed.plots && parsed.plots.length > 0 ? parsed.plots : prev.plots,
          activePlotId: parsed.activePlotId ?? prev.activePlotId,
          tasks: parsed.tasks && parsed.tasks.length > 0 ? parsed.tasks : prev.tasks,
          photos: parsed.photos && parsed.photos.length > 0 ? parsed.photos : prev.photos,
        }))
      }
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      const toSave = {
        user: state.user,
        plots: state.plots,
        activePlotId: state.activePlotId,
        tasks: state.tasks,
        photos: state.photos,
      }
      localStorage.setItem('smartfarm-state', JSON.stringify(toSave))
    } catch {
      // ignore
    }
  }, [state.user, state.plots, state.activePlotId, state.tasks, state.photos, hydrated])

  const login = useCallback((user: User) => {
    setState(prev => ({ ...prev, user }))
  }, [])

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, user: null }))
    localStorage.removeItem('smartfarm-state')
  }, [])

  const addPlot = useCallback((plot: Plot) => {
    setState(prev => ({
      ...prev,
      plots: [...prev.plots, plot],
      activePlotId: plot.id,
      sensorData: {
        ...prev.sensorData,
        [plot.id]: generateSensorHistory(plot.id),
      },
      chatHistory: {
        ...prev.chatHistory,
        [plot.id]: [],
      },
    }))
  }, [])

  const updatePlot = useCallback((plotId: string, updates: Partial<Plot>) => {
    setState(prev => ({
      ...prev,
      plots: prev.plots.map(p => p.id === plotId ? { ...p, ...updates } : p),
    }))
  }, [])

  const archivePlot = useCallback((plotId: string) => {
    setState(prev => ({
      ...prev,
      plots: prev.plots.map(p => p.id === plotId ? { ...p, archived: true } : p),
      activePlotId: prev.activePlotId === plotId
        ? (prev.plots.find(p => p.id !== plotId && !p.archived)?.id ?? null)
        : prev.activePlotId,
    }))
  }, [])

  const setActivePlot = useCallback((plotId: string) => {
    setState(prev => ({ ...prev, activePlotId: plotId }))
  }, [])

  const addTask = useCallback((task: Task) => {
    setState(prev => ({ ...prev, tasks: [...prev.tasks, task] }))
  }, [])

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId
          ? { ...t, status, completedAt: status === 'selesai' ? new Date().toISOString() : t.completedAt }
          : t
      ),
    }))
  }, [])

  const addPhoto = useCallback((photo: Photo) => {
    setState(prev => ({ ...prev, photos: [...prev.photos, photo] }))
  }, [])

  const updatePhotoAnalysis = useCallback((photoId: string, analysis: Photo['analysis']) => {
    setState(prev => ({
      ...prev,
      photos: prev.photos.map(p => p.id === photoId ? { ...p, analysis } : p),
    }))
  }, [])

  const addMessage = useCallback((plotId: string, message: ChatMessage) => {
    setState(prev => ({
      ...prev,
      chatHistory: {
        ...prev.chatHistory,
        [plotId]: [...(prev.chatHistory[plotId] ?? []), message],
      },
    }))
  }, [])

  const ctx: StoreContextType = {
    state,
    getHST,
    login,
    logout,
    addPlot,
    updatePlot,
    archivePlot,
    setActivePlot,
    addTask,
    updateTaskStatus,
    addPhoto,
    updatePhotoAnalysis,
    addMessage,
  }

  return React.createElement(StoreContext.Provider, { value: ctx }, children)
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export { getHST, DEMO_USER }
