import { NextRequest, NextResponse } from 'next/server'
import type OpenAI from 'openai'

// Contoh respons demo — dipakai saat OPENAI_API_KEY belum diset
const DEMO_RESPONSES: Record<string, string> = {
  panen: `Berdasarkan data tanaman Anda:\n\n**Prediksi Waktu Panen:**\n- Cabai: HST 70-90 (petik perdana), lanjut setiap 3-5 hari\n- Tomat: HST 60-80, saat 75-80% buah berwarna merah\n\n**Tanda siap panen:**\n• Warna buah sudah berubah optimal\n• Ukuran buah maksimal\n• Tangkai masih segar\n\n💡 Panen pagi hari sebelum suhu naik untuk kualitas terbaik.`,
  kuning: `**Kemungkinan Penyebab Daun Kuning:**\n\n1. **Kekurangan Nitrogen** — pupuk urea 5g/tanaman, siramkan ke akar\n2. **Overwatering** — kurangi frekuensi siram, perbaiki drainase\n3. **Kekurangan Magnesium** — semprotkan MgSO4 10g/liter ke daun\n4. **Serangan kutu akar** — cek pangkal tanaman, aplikasi insektisida sistemik\n\n⚠️ Foto daun dan gunakan fitur Analisis Foto untuk diagnosa akurat.`,
  pupuk: `**Rekomendasi Pemupukan Hari Ini:**\n\n📋 Sesuaikan dengan fase HST tanaman Anda:\n\n**HST 1-30 (Vegetatif):**\n• Urea: 3g/tanaman + NPK: 5g/tanaman, 2x seminggu\n\n**HST 30-60 (Pembungaan):**\n• NPK 16-16-16: 8g/tanaman + KCl: 3g/tanaman\n\n**HST 60+ (Pembuahan):**\n• KCl: 5g/tanaman + Kalsium-Boron: 2ml/liter semprot daun\n\n⏰ Waktu terbaik: pagi 07.00-09.00.`,
  hama: `**Panduan Pengendalian Hama (PHT):**\n\n**Trips** → Spinosad atau Abamectin\n**Kutu Daun** → Imidakloprid\n**Ulat Grayak** → Klorantraniliprol\n**Tungau** → Akarisida Abamectin\n\n💡 Rotasi bahan aktif setiap 2-3 aplikasi untuk cegah resistensi.`,
  cuaca: `**Prakiraan & Rekomendasi Cuaca:**\n\n☀️ Besok: Cerah berawan, 27-31°C, kelembapan 68%\n\n• Pagi 06.00-08.00: Penyiraman & pemupukan ✅\n• Siang: Hindari penyemprotan (suhu tinggi) ⚠️\n• Sore 16.00-18.00: Semprot jika diperlukan ✅`,
}

function getDemoResponse(message: string): string {
  const msg = message.toLowerCase()
  if (msg.includes('panen')) return DEMO_RESPONSES.panen
  if (msg.includes('kuning') || msg.includes('layu')) return DEMO_RESPONSES.kuning
  if (msg.includes('pupuk') || msg.includes('dosis')) return DEMO_RESPONSES.pupuk
  if (msg.includes('hama') || msg.includes('serangga') || msg.includes('semprot')) return DEMO_RESPONSES.hama
  if (msg.includes('cuaca') || msg.includes('besok') || msg.includes('hujan')) return DEMO_RESPONSES.cuaca
  return `Terima kasih atas pertanyaan Anda! 🌱\n\nSaya siap membantu dengan:\n• Jadwal panen\n• Diagnosa masalah tanaman\n• Rekomendasi pemupukan\n• Pengendalian hama\n• Prakiraan cuaca\n\nAjukan pertanyaan spesifik tentang tanaman Anda!`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, plotName, cropType, hst, sensorData, history } = body

    if (!message) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      await new Promise(r => setTimeout(r, 800))
      return NextResponse.json({ reply: getDemoResponse(message) })
    }

    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey })

    const sensorContext = sensorData
      ? `\nData sensor terkini: kelembapan tanah ${sensorData.soilMoisture?.toFixed(1)}%, suhu tanah ${sensorData.soilTemp?.toFixed(1)}°C, suhu udara ${sensorData.airTemp?.toFixed(1)}°C, kelembapan udara ${sensorData.airHumidity?.toFixed(1)}%, cahaya ${sensorData.lightIntensity?.toFixed(0)} lux`
      : ''

    const systemPrompt = `Kamu adalah Asisten TaniCerdas, asisten AI pertanian untuk petani cabai dan tomat Indonesia.

Konteks lahan: nama "${plotName}", tanaman ${cropType}, umur ${hst} HST.${sensorContext}

Panduan:
1. Gunakan Bahasa Indonesia sederhana untuk petani
2. Berikan saran praktis dan spesifik dengan dosis konkret
3. Format dengan poin-poin yang mudah dibaca
4. Pertimbangkan data sensor aktual dalam rekomendasi
5. Maksimal 300 kata kecuali diminta detail`

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(history ?? []).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ]

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content ?? 'Maaf, tidak dapat memproses respons.'
    return NextResponse.json({ reply })
  } catch (error: unknown) {
    console.error('Chatbot error:', error)
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Gagal memproses: ${errMsg}` }, { status: 500 })
  }
}
