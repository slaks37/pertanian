'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { SensorReading } from '@/types'

interface MqttStreamState {
  latest: SensorReading | null
  isConnected: boolean
  lastUpdate: string | null
  error: string | null
}

export function useMqttStream(plotId: string, cropType: string, enabled = true) {
  const [state, setState] = useState<MqttStreamState>({
    latest: null,
    isConnected: false,
    lastUpdate: null,
    error: null,
  })
  const esRef = useRef<EventSource | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (!enabled || !plotId) return
    if (esRef.current) {
      esRef.current.close()
    }

    const url = `/api/mqtt/stream?plotId=${encodeURIComponent(plotId)}&cropType=${encodeURIComponent(cropType)}`
    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => {
      setState(p => ({ ...p, isConnected: true, error: null }))
    }

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SensorReading & { plotId: string }
        setState(p => ({
          ...p,
          latest: {
            timestamp: data.timestamp,
            soilMoisture: data.soilMoisture,
            soilTemp: data.soilTemp,
            airTemp: data.airTemp,
            airHumidity: data.airHumidity,
            lightIntensity: data.lightIntensity,
          },
          isConnected: true,
          lastUpdate: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          error: null,
        }))
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      es.close()
      setState(p => ({ ...p, isConnected: false, error: 'Koneksi MQTT terputus, mencoba ulang...' }))
      // Reconnect after 5 seconds
      reconnectTimer.current = setTimeout(connect, 5000)
    }
  }, [plotId, cropType, enabled])

  useEffect(() => {
    connect()
    return () => {
      esRef.current?.close()
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    }
  }, [connect])

  return state
}
