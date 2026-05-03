import { NextRequest, NextResponse } from 'next/server'

const DEMO_RESPONSES: Record<string, string> = {
  panen: `Berdasarkan data tanaman Anda:\n\n**Prediksi Waktu Panen:**\n- Cabai: HST 70-90 (petik perdana), lanjut setiap 3-5 hari\n- Tomat: HST 60-80, saat 75-80% buah berwarna merah\n\n**Tanda siap panen:**\n• Warna buah sudah berubah optimal\n• Ukuran buah maksimal\n• Tangkai masih segar\n\n💡 Panen pagi hari sebelum suhu naik untuk kualitas terbaik.`,
  kuning: `**Kemungkinan Penyebab Daun Kuning:**\n\n1. **Kekurangan Nitrogen** — pupuk urea 5g/tanaman, siramkan ke akar\n2. **Overwatering** — kurangi frekuensi siram, perbaiki drainase\n3. **Kekurangan Magnesium** — semprotkan MgSO4 10g/liter ke daun\n4. **Serangan kutu akar** — cek pangkal tanaman, aplikasi insektisida sistemik\n5. **Penyakit layu** — amati apakah layu mulai dari pucuk atau daun bawah\n\n⚠️ Foto daun yang menguning dan gunakan fitur Analisis Foto untuk diagnosa akurat.`,
  pupuk: `**Rekomendasi Pemupukan Hari Ini:**\n\n📋 Sesuaikan dengan fase HST tanaman Anda:\n\n**HST 1-30 (Vegetatif):**\n• Urea: 3g/tanaman + NPK: 5g/tanaman, 2x seminggu\n\n**HST 30-60 (Pembungaan):**\n• NPK 16-16-16: 8g/tanaman + KCl: 3g/tanaman, seminggu sekali\n• Kurangi N, tambah P dan K\n\n**HST 60+ (Pembuahan):**\n• KCl: 5g/tanaman + Kalsium-Boron: 2ml/liter semprot daun\n\n⏰ Waktu terbaik: pagi 07.00-09.00, larutkan sebelum disiram.`,
  hama: `**Panduan Pengendalian Hama Terpadu (PHT):**\n\n🔍 **Identifikasi dulu hama yang menyerang:**\n\n**Trips** (bintik putih/perak pada daun):\n→ Insektisida Spinosad atau Abamectin, semprot pagi\n\n**Kutu Daun** (koloni hijau/hitam):\n→ Insektisida Imidakloprid atau Thiamethoksam\n\n**Ulat Grayak** (daun bolong-bolong):\n→ Insektisida Klorantraniliprol atau B.thuringiensis\n\n**Tungau** (daun keriting, putih berbintik):\n→ Akarisida Abamectin + sabun cuci encer\n\n💡 Rotasi bahan aktif setiap 2-3 aplikasi untuk cegah resistensi.`,
  cuaca: `**Prakiraan & Rekomendasi Cuaca:**\n\n☀️ **Besok:** Cerah berawan, suhu 27-31°C, kelembapan 68%\n\n**Rekomendasi kegiatan besok:**\n• ✅ Pagi (06.00-08.00): Penyiraman & pemupukan\n• ✅ Pagi (08.00-10.00): Pemantauan dan pencatatan\n• ⚠️ Siang: Hindari penyemprotan (suhu tinggi)\n• ✅ Sore (16.00-18.00): Penyemprotan pestisida jika diperlukan\n\n🌧️ **Peringatan:** Potensi hujan ringan 3 hari ke depan. Tunda pemupukan granul saat hujan, tapi manfaatkan untuk kurangi jadwal penyiraman.`,
}

function getDemoResponse(message: string): string {
  const msg = message.toLowerCase()
  if (msg.includes('panen')) return DEMO_RESPONSES.panen
  if (msg.includes('kuning') || msg.includes('layu')) return DEMO_RESPONSES.kuning
  if (msg.includes('pupuk') || msg.includes('dosis')) return DEMO_RESPONSES.pupuk
  if (msg.includes('hama') || msg.includes('serangga') || msg.includes('semprot')) return DEMO_RESPONSES.hama
  if (msg.includes('cuaca') || msg.includes('besok') || msg.includes('hujan')) return DEMO_RESPONSES.cuaca

  return `Terima kasih atas pertanyaan Anda! 🌱\n\nSebagai Asisten TaniCerdas, saya siap membantu dengan:\n• Jadwal panen dan estimasi hasil\n• Diagnosa masalah tanaman\n• Rekomendasi pemupukan\n• Pengendalian hama penyakit\n• Prakiraan cuaca & saran kegiatan\n\nSilakan ajukan pertanyaan lebih spesifik tentang tanaman Anda untuk mendapat saran yang lebih tepat.`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, plotName, cropType, hst, sensorData, history } = body

    if (!message) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      // Demo mode
      await new Promise(r => setTimeout(r, 800))
      return NextResponse.json({ reply: getDemoResponse(message) })
    }

    // Real API call
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey })

    const sensorContext = sensorData
      ? `\nData sensor terkini:
- Kelembapan tanah: ${sensorData.soilMoisture?.toFixed(1)}%
- Suhu tanah: ${sensorData.soilTemp?.toFixed(1)}°C
- Suhu udara: ${sensorData.airTemp?.toFixed(1)}°C
- Kelembapan udara: ${sensorData.airHumidity?.toFixed(1)}%
- Intensitas cahaya: ${sensorData.lightIntensity?.toFixed(0)} lux`
      : ''

    const systemPrompt = `Kamu adalah Asisten TaniCerdas, asisten AI pertanian untuk petani cabai dan tomat Indonesia.

Konteks lahan petani:
- Nama lahan: ${plotName}
- Jenis tanaman: ${cropType}
- Umur tanaman: ${hst} HST (Hari Setelah Tanam)${sensorContext}

Panduan respons:
1. Gunakan bahasa Indonesia yang sederhana dan mudah dipahami petani
2. Berikan saran praktis dan spesifik sesuai kondisi aktual
3. Gunakan format yang mudah dibaca (poin-poin, angka)
4. Sertakan dosis atau takaran yang konkret bila relevan
5. Selalu pertimbangkan kondisi sensor saat memberikan rekomendasi
6. Tutup dengan tips singkat yang actionable
7. Jangan lebih dari 300 kata kecuali diminta detail`

    const anthropicMessages = [
      ...(history ?? []).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : 'Maaf, tidak dapat memproses respons.'

    return NextResponse.json({ reply })
  } catch (error: unknown) {
    console.error('Chatbot error:', error)
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Gagal memproses: ${errMsg}` }, { status: 500 })
  }
}
