export type CropType = 'cabai' | 'tomat' | 'lainnya'
export type PlotStatus = 'baik' | 'perhatian' | 'kritis'
export type SoilType = 'lempung' | 'pasir' | 'liat'
export type TaskType = 'siram' | 'pupuk' | 'semprot' | 'pantau' | 'lainnya'
export type TaskStatus = 'pending' | 'selesai' | 'ditunda' | 'skip'

export interface Plot {
  id: string
  name: string
  cropType: CropType
  plantingDate: string // ISO date
  soilType: SoilType
  area: number // m²
  conditionScore: number // 0-100
  status: PlotStatus
  nodeId?: string
  createdAt: string
  archived: boolean
}

export interface SensorReading {
  timestamp: string
  soilMoisture: number // %
  soilTemp: number // °C
  airTemp: number // °C
  airHumidity: number // %
  lightIntensity: number // lux
}

export interface Task {
  id: string
  plotId: string
  date: string
  type: TaskType
  title: string
  description: string
  reason: string
  bestTime: string
  priority: 'rendah' | 'sedang' | 'tinggi'
  status: TaskStatus
  completedAt?: string
}

export interface Photo {
  id: string
  plotId: string
  url: string
  hst: number
  timestamp: string
  analysis?: PhotoAnalysis
}

export interface PhotoAnalysis {
  condition: string
  confidence: number
  issues: string[]
  recommendations: string[]
  severity: 'normal' | 'perhatian' | 'kritis'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface User {
  id: string
  name: string
  phone: string
  role: 'petani' | 'koordinator' | 'admin'
}

export interface AppState {
  user: User | null
  plots: Plot[]
  activePlotId: string | null
  tasks: Task[]
  photos: Photo[]
  sensorData: Record<string, SensorReading[]>
  chatHistory: Record<string, ChatMessage[]>
}
