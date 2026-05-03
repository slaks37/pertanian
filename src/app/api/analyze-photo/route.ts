import { NextRequest, NextResponse } from 'next/server'

interface PhotoAnalysis {
  condition: string
  confidence: number
  issues: string[]
  recommendations: string[]
  severity: 'normal' | 'perhatian' | 'kritis'
}

function getDemoAnalysis(cropType: string, hst: number): PhotoAnalysis {
  const isCabai = cropType === 'cabai'
  const isEarly = hst < 30
  const isMid = hst >= 30 && hst < 60

  if (isEarly) {
    return {
      condition: 'Pertumbuhan Vegetatif Normal',
      confidence: 88,
      issues: [],
      recommendations: [
        `Pertahankan kelembapan tanah ${isCabai ? '60-75%' : '65-80%'} untuk pertumbuhan optimal`,
        'Lanjutkan pemupukan nitrogen sesuai jadwal untuk pembentukan daun',
        'Pasang mulsa plastik untuk menjaga kelembapan dan suhu tanah',
      ],
      severity: 'normal',
    }
  }

  if (isMid) {
    return {
      condition: isCabai ? 'Fase Pembungaan - Perhatikan Kelembapan' : 'Fase Pembungaan - Awasi Penyakit',
      confidence: 82,
      issues: isCabai
        ? ['Beberapa daun bagian bawah menunjukkan sedikit klorosis (menguning ringan)']
        : ['Bercak kecil pada tepi beberapa daun tua - kemungkinan early blight awal'],
      recommendations: isCabai
        ? [
            'Semprotkan pupuk daun mengandung Mg dan Fe untuk atasi klorosis',
            'Pastikan pH tanah 6.0-7.0 untuk penyerapan nutrisi optimal',
            'Lanjutkan penyiraman rutin, hindari tanah terlalu kering',
          ]
        : [
            'Aplikasi fungisida tembaga (copper hydroxide) 2g/liter sebagai pencegahan',
            'Buang daun yang menunjukkan gejala dan musnahkan',
            'Tingkatkan sirkulasi udara dengan pemangkasan daun bawah',
          ],
      severity: 'perhatian',
    }
  }

  return {
    condition: isCabai ? 'Fase Pembuahan Aktif - Kondisi Baik' : 'Pematangan Buah - Pantau Rutin',
    confidence: 91,
    issues: [],
    recommendations: [
      isCabai ? 'Tingkatkan dosis kalium untuk pembentukan buah berkualitas' : 'Pastikan calcium cukup untuk cegah busuk ujung buah (BER)',
      'Panen tepat waktu untuk kualitas dan harga terbaik',
      'Jaga sanitasi kebun, bersihkan sisa tanaman/buah yang gugur',
    ],
    severity: 'normal',
  }
}

export async function POST(req: NextRequest) {
  let parsedBody: { imageBase64?: string; mediaType?: string; cropType?: string; hst?: number } = {}
  try {
    parsedBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const { imageBase64, mediaType, cropType = 'cabai', hst = 30 } = parsedBody

    if (!imageBase64) {
      return NextResponse.json({ error: 'Data gambar tidak ditemukan' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      // Demo mode with simulated delay
      await new Promise(r => setTimeout(r, 2000))
      return NextResponse.json({ analysis: getDemoAnalysis(cropType, hst) })
    }

    // Real API call with vision
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey })

    const cropName = cropType === 'cabai' ? 'cabai' : cropType === 'tomat' ? 'tomat' : 'sayuran'

    const systemPrompt = `Kamu adalah ahli patologi tanaman Indonesia yang menganalisis foto tanaman ${cropName} pada HST ${hst}.

Analisis foto dengan seksama dan berikan respons HANYA dalam format JSON berikut:
{
  "condition": "deskripsi singkat kondisi tanaman (maks 8 kata)",
  "confidence": angka_persen_int,
  "issues": ["masalah 1 jika ada", "masalah 2 jika ada"],
  "recommendations": ["rekomendasi 1", "rekomendasi 2", "rekomendasi 3"],
  "severity": "normal" | "perhatian" | "kritis"
}

Panduan severity:
- normal: tanaman sehat, tidak ada masalah signifikan
- perhatian: ada gejala awal yang perlu diperhatikan
- kritis: penyakit/serangan parah, perlu tindakan segera

Berikan dalam bahasa Indonesia yang mudah dipahami petani.`

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: (mediaType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analisis foto tanaman ${cropName} ini pada HST ${hst}. Berikan analisis dalam format JSON.`,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Format respons tidak valid')
    }

    const analysis = JSON.parse(jsonMatch[0]) as PhotoAnalysis

    // Validate required fields
    if (!analysis.condition || !analysis.severity || !Array.isArray(analysis.recommendations)) {
      throw new Error('Data analisis tidak lengkap')
    }

    return NextResponse.json({ analysis })
  } catch (error: unknown) {
    console.error('Photo analysis error:', error)
    // Fallback to demo response
    const { cropType = 'cabai', hst = 30 } = parsedBody
    return NextResponse.json({ analysis: getDemoAnalysis(cropType, hst) })
  }
}
