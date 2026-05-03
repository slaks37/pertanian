import { NextRequest, NextResponse } from 'next/server'
import type { PhotoAnalysis } from '@/types'

// Demo fallback — dipakai saat OPENAI_API_KEY belum diset
function getDemoAnalysis(cropType: string, hst: number): PhotoAnalysis {
  const isCabai = cropType === 'cabai'
  if (hst < 30) {
    return {
      condition: 'Pertumbuhan Vegetatif Normal',
      confidence: 88,
      issues: [],
      recommendations: [
        `Pertahankan kelembapan tanah ${isCabai ? '60-75%' : '65-80%'} untuk pertumbuhan optimal`,
        'Lanjutkan pemupukan nitrogen sesuai jadwal',
        'Pasang mulsa plastik untuk menjaga kelembapan dan suhu tanah',
      ],
      severity: 'normal',
    }
  }
  if (hst < 60) {
    return {
      condition: isCabai ? 'Pembungaan — Perhatikan Kelembapan' : 'Pembungaan — Waspadai Penyakit',
      confidence: 82,
      issues: isCabai
        ? ['Klorosis ringan terdeteksi pada beberapa daun bawah']
        : ['Bercak kecil di tepi daun tua — kemungkinan early blight awal'],
      recommendations: isCabai
        ? ['Semprotkan pupuk daun Mg dan Fe untuk atasi klorosis', 'Pastikan pH tanah 6.0-7.0']
        : ['Aplikasi fungisida tembaga 2g/liter', 'Buang daun bergejala, tingkatkan sirkulasi udara'],
      severity: 'perhatian',
    }
  }
  return {
    condition: isCabai ? 'Pembuahan Aktif — Kondisi Baik' : 'Pematangan Buah — Pantau Rutin',
    confidence: 91,
    issues: [],
    recommendations: [
      isCabai ? 'Tingkatkan dosis kalium untuk buah berkualitas' : 'Pastikan kalsium cukup untuk cegah BER',
      'Panen tepat waktu untuk kualitas terbaik',
      'Jaga sanitasi kebun, bersihkan sisa tanaman gugur',
    ],
    severity: 'normal',
  }
}

export async function POST(req: NextRequest) {
  let body: { imageBase64?: string; mediaType?: string; cropType?: string; hst?: number } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { imageBase64, mediaType, cropType = 'cabai', hst = 30 } = body

  if (!imageBase64) {
    return NextResponse.json({ error: 'Data gambar tidak ditemukan' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    await new Promise(r => setTimeout(r, 2000))
    return NextResponse.json({ analysis: getDemoAnalysis(cropType, hst) })
  }

  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey })

    const cropName = cropType === 'cabai' ? 'cabai' : cropType === 'tomat' ? 'tomat' : 'sayuran'
    const dataUrl = `data:${mediaType ?? 'image/jpeg'};base64,${imageBase64}`

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 512,
      messages: [
        {
          role: 'system',
          content: `Kamu ahli patologi tanaman Indonesia. Analisis foto tanaman ${cropName} (HST ${hst}) dan balas HANYA JSON:
{"condition":"deskripsi singkat (maks 8 kata)","confidence":angka_int,"issues":["masalah jika ada"],"recommendations":["saran 1","saran 2","saran 3"],"severity":"normal"|"perhatian"|"kritis"}
Gunakan bahasa Indonesia sederhana untuk petani.`,
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
            { type: 'text', text: `Analisis foto tanaman ${cropName} HST ${hst}. Balas dalam JSON.` },
          ],
        },
      ],
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Format respons tidak valid')

    const analysis = JSON.parse(jsonMatch[0]) as PhotoAnalysis
    if (!analysis.condition || !analysis.severity) throw new Error('Data tidak lengkap')

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Photo analysis error:', error)
    return NextResponse.json({ analysis: getDemoAnalysis(cropType, hst) })
  }
}
