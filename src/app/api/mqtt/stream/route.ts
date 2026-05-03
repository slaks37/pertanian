import { NextRequest } from 'next/server'

// Simulate IoT sensor readings via SSE.
// In production: replace with real MQTT broker subscriber (mqtt.js).
// Each connected plot node sends readings every 30 min via MQTT topic:
//   smartfarm/{plotId}/sensors
// This endpoint simulates that stream for the browser via SSE.

export const dynamic = 'force-dynamic'

const SENSOR_PROFILES: Record<string, {
  soilMoisture: [number, number]
  soilTemp: [number, number]
  airTemp: [number, number]
  airHumidity: [number, number]
  lightIntensity: [number, number]
}> = {
  cabai: {
    soilMoisture: [58, 78],
    soilTemp: [23, 28],
    airTemp: [25, 33],
    airHumidity: [62, 80],
    lightIntensity: [15000, 60000],
  },
  tomat: {
    soilMoisture: [63, 82],
    soilTemp: [21, 26],
    airTemp: [22, 30],
    airHumidity: [58, 78],
    lightIntensity: [20000, 65000],
  },
  lainnya: {
    soilMoisture: [55, 80],
    soilTemp: [20, 30],
    airTemp: [22, 32],
    airHumidity: [60, 80],
    lightIntensity: [15000, 60000],
  },
}

function rand(min: number, max: number, dp = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dp))
}

function generateReading(cropType: string) {
  const profile = SENSOR_PROFILES[cropType] ?? SENSOR_PROFILES.lainnya
  const hour = new Date().getHours()
  const isDaytime = hour >= 6 && hour <= 18

  return {
    timestamp: new Date().toISOString(),
    soilMoisture: rand(...profile.soilMoisture),
    soilTemp: rand(...profile.soilTemp),
    airTemp: isDaytime
      ? rand(profile.airTemp[0] + 3, profile.airTemp[1])
      : rand(profile.airTemp[0], profile.airTemp[0] + 4),
    airHumidity: isDaytime
      ? rand(profile.airHumidity[0], profile.airHumidity[1] - 5)
      : rand(profile.airHumidity[0] + 5, profile.airHumidity[1]),
    lightIntensity: isDaytime
      ? rand(...profile.lightIntensity, 0)
      : 0,
    // Anomaly: 5% chance of out-of-range value to trigger alerts
    ...(Math.random() < 0.05 ? { soilMoisture: rand(28, 38) } : {}),
  }
}

export async function GET(req: NextRequest) {
  const plotId = req.nextUrl.searchParams.get('plotId') ?? 'plot-1'
  const cropType = req.nextUrl.searchParams.get('cropType') ?? 'cabai'

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial reading immediately
      const send = () => {
        const reading = generateReading(cropType)
        const data = JSON.stringify({ plotId, ...reading })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }
      send()

      // Then every 10 seconds for demo (real IoT = every 30 min)
      const interval = setInterval(send, 10000)

      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
