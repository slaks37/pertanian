import { SensorReading, Task, Photo, ChatMessage } from '@/types'

function randomBetween(min: number, max: number, decimals = 1): number {
  const val = Math.random() * (max - min) + min
  return parseFloat(val.toFixed(decimals))
}

export function generateSensorHistory(plotId: string): SensorReading[] {
  const readings: SensorReading[] = []
  const now = new Date()
  const isCabai = plotId === 'plot-1'

  // 14 days x 48 readings (every 30 minutes)
  for (let day = 13; day >= 0; day--) {
    for (let slot = 0; slot < 48; slot++) {
      const ts = new Date(now)
      ts.setDate(ts.getDate() - day)
      ts.setHours(Math.floor(slot / 2), (slot % 2) * 30, 0, 0)

      const hour = ts.getHours()
      const isDaytime = hour >= 6 && hour <= 18
      const isAnomaly = day === 5 && slot >= 16 && slot <= 24

      let soilMoisture: number
      let soilTemp: number
      let airTemp: number
      let airHumidity: number
      let lightIntensity: number

      if (isCabai) {
        // Cabai normal ranges
        soilMoisture = isAnomaly
          ? randomBetween(35, 45)
          : randomBetween(60, 75)
        soilTemp = randomBetween(24, 28)
        airTemp = isDaytime
          ? randomBetween(28, 32)
          : randomBetween(22, 26)
        airHumidity = isDaytime
          ? randomBetween(60, 72)
          : randomBetween(72, 82)
        lightIntensity = isDaytime
          ? isAnomaly
            ? randomBetween(5000, 15000, 0)
            : randomBetween(20000, 60000, 0)
          : 0
      } else {
        // Tomat normal ranges
        soilMoisture = isAnomaly
          ? randomBetween(88, 95)
          : randomBetween(65, 80)
        soilTemp = randomBetween(22, 26)
        airTemp = isDaytime
          ? randomBetween(24, 28)
          : randomBetween(18, 22)
        airHumidity = isDaytime
          ? randomBetween(55, 70)
          : randomBetween(68, 78)
        lightIntensity = isDaytime
          ? randomBetween(25000, 65000, 0)
          : 0
      }

      readings.push({
        timestamp: ts.toISOString(),
        soilMoisture,
        soilTemp,
        airTemp,
        airHumidity,
        lightIntensity,
      })
    }
  }

  return readings
}

export function generateDemoTasks(plotId: string): Task[] {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const isCabai = plotId === 'plot-1'

  if (isCabai) {
    return [
      {
        id: `task-${plotId}-1`,
        plotId,
        date: today,
        type: 'siram',
        title: 'Penyiraman Pagi',
        description: 'Siram tanaman cabai dengan air bersih secara merata di sekitar pangkal tanaman',
        reason: 'Kelembapan tanah turun ke 58%, di bawah optimal 60-75% untuk cabai. Penyiraman pagi lebih efektif karena mengurangi penguapan.',
        bestTime: 'Pagi < 08.00',
        priority: 'tinggi',
        status: 'pending',
      },
      {
        id: `task-${plotId}-2`,
        plotId,
        date: today,
        type: 'pupuk',
        title: 'Pemupukan NPK',
        description: 'Aplikasi pupuk NPK 16-16-16 dosis 5g/tanaman, larutkan dalam air sebelum disiramkan',
        reason: 'Jadwal pemupukan rutin minggu ke-6. Cabai di fase HST 42 membutuhkan nutrisi tinggi untuk pertumbuhan buah.',
        bestTime: 'Pagi 07.00-09.00',
        priority: 'sedang',
        status: 'pending',
      },
      {
        id: `task-${plotId}-3`,
        plotId,
        date: today,
        type: 'pantau',
        title: 'Pemantauan Hama',
        description: 'Periksa bagian bawah daun dan pucuk tanaman untuk mendeteksi hama trips, kutu daun, atau gejala penyakit antraknos',
        reason: 'Kelembapan udara 78% mendukung perkembangan penyakit jamur. Deteksi dini mencegah kehilangan hasil panen.',
        bestTime: 'Pagi 08.00-10.00',
        priority: 'sedang',
        status: 'selesai',
        completedAt: new Date().toISOString(),
      },
      {
        id: `task-${plotId}-4`,
        plotId,
        date: today,
        type: 'semprot',
        title: 'Penyemprotan Fungisida',
        description: 'Semprotkan fungisida Dithane M-45 dosis 2g/liter air ke seluruh bagian tanaman secara merata',
        reason: 'Cuaca lembap dalam 3 hari terakhir meningkatkan risiko serangan penyakit embun tepung dan antraknos.',
        bestTime: 'Sore 16.00-18.00',
        priority: 'tinggi',
        status: 'pending',
      },
      {
        id: `task-${plotId}-5`,
        plotId,
        date: today,
        type: 'lainnya',
        title: 'Pemangkasan Tunas Air',
        description: 'Pangkas tunas air (wiwilan) yang tumbuh di ketiak daun untuk memusatkan energi ke pembentukan buah',
        reason: 'Tanaman cabai di HST 42 dalam fase berbuah aktif. Pemangkasan tunas air meningkatkan ukuran dan kualitas buah.',
        bestTime: 'Siang 10.00-14.00',
        priority: 'rendah',
        status: 'ditunda',
      },
      {
        id: `task-${plotId}-6`,
        plotId,
        date: tomorrow,
        type: 'siram',
        title: 'Penyiraman Pagi',
        description: 'Siram tanaman cabai secara rutin',
        reason: 'Jadwal penyiraman rutin harian',
        bestTime: 'Pagi < 08.00',
        priority: 'tinggi',
        status: 'pending',
      },
    ]
  } else {
    return [
      {
        id: `task-${plotId}-1`,
        plotId,
        date: today,
        type: 'siram',
        title: 'Irigasi Tetes',
        description: 'Aktifkan sistem irigasi tetes selama 45 menit untuk memenuhi kebutuhan air tanaman tomat',
        reason: 'Kelembapan tanah 67%, mendekati batas bawah optimal 65-80% untuk tomat. Irigasi tetes mencegah busuk akar.',
        bestTime: 'Pagi 06.00-07.00',
        priority: 'tinggi',
        status: 'selesai',
        completedAt: new Date().toISOString(),
      },
      {
        id: `task-${plotId}-2`,
        plotId,
        date: today,
        type: 'pantau',
        title: 'Cek Serangan Hawar Daun',
        description: 'Periksa daun bawah dan tengah untuk gejala bercak coklat atau hawar daun (blight). Foto dan catat perkembangan.',
        reason: 'Kondisi tanaman saat ini mendapat skor 62 (perhatian). Hawar daun tomat dapat menyebar cepat jika tidak ditangani.',
        bestTime: 'Pagi 07.00-09.00',
        priority: 'tinggi',
        status: 'pending',
      },
      {
        id: `task-${plotId}-3`,
        plotId,
        date: today,
        type: 'pupuk',
        title: 'Pemupukan Kalsium Boron',
        description: 'Semprotkan pupuk daun kalsium-boron 2ml/liter untuk mencegah busuk ujung buah (BER)',
        reason: 'Tomat di HST 23 mulai masuk fase pembentukan buah. Defisiensi kalsium menyebabkan busuk ujung buah yang merugikan.',
        bestTime: 'Sore 15.00-17.00',
        priority: 'sedang',
        status: 'pending',
      },
      {
        id: `task-${plotId}-4`,
        plotId,
        date: today,
        type: 'lainnya',
        title: 'Pemasangan Ajir Tambahan',
        description: 'Pasang ajir bambu dan ikat batang utama tomat yang mulai condong akibat beban buah',
        reason: 'Tanaman tomat di HST 23 mulai berbuah. Penopang yang baik mencegah batang patah dan buah menyentuh tanah.',
        bestTime: 'Siang 09.00-11.00',
        priority: 'rendah',
        status: 'pending',
      },
      {
        id: `task-${plotId}-5`,
        plotId,
        date: tomorrow,
        type: 'semprot',
        title: 'Penyemprotan Bakterisida',
        description: 'Semprotkan bakterisida untuk pencegahan penyakit layu bakteri',
        reason: 'Jadwal pencegahan rutin mingguan',
        bestTime: 'Pagi 07.00-09.00',
        priority: 'sedang',
        status: 'pending',
      },
    ]
  }
}

export function generateDemoPhotos(plotId: string): Photo[] {
  const isCabai = plotId === 'plot-1'
  const hstBase = isCabai ? 42 : 23

  return [
    {
      id: `photo-${plotId}-1`,
      plotId,
      url: '/placeholder-farm.jpg',
      hst: hstBase - 7,
      timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
      analysis: {
        condition: 'Normal',
        confidence: 92,
        issues: [],
        recommendations: ['Pertahankan jadwal penyiraman saat ini', 'Lanjutkan pemupukan rutin'],
        severity: 'normal',
      },
    },
    {
      id: `photo-${plotId}-2`,
      plotId,
      url: '/placeholder-farm.jpg',
      hst: hstBase - 3,
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
      analysis: {
        condition: isCabai ? 'Perhatian - Bercak Daun Terdeteksi' : 'Perhatian - Gejala Hawar Awal',
        confidence: 78,
        issues: isCabai
          ? ['Bercak coklat kecil pada 3-4 lembar daun bagian bawah', 'Kemungkinan awal infeksi antraknos']
          : ['Bercak kuning kecoklatan pada tepi daun', 'Gejala awal hawar daun (early blight)'],
        recommendations: isCabai
          ? ['Semprot fungisida Dithane M-45 dosis 2g/liter', 'Buang daun yang terinfeksi dan musnahkan', 'Kurangi kelembapan dengan pemangkasan']
          : ['Aplikasi fungisida tembaga segera', 'Pangkas daun yang menunjukkan gejala', 'Tingkatkan sirkulasi udara'],
        severity: 'perhatian',
      },
    },
  ]
}

export function generateDemoChatHistory(plotId: string): ChatMessage[] {
  const isCabai = plotId === 'plot-1'
  const plotName = isCabai ? 'Kebun Cabai Utara' : 'Lahan Tomat Selatan'
  const crop = isCabai ? 'cabai' : 'tomat'
  const hst = isCabai ? 42 : 23

  return [
    {
      id: `msg-${plotId}-1`,
      role: 'user',
      content: `Kapan ${crop} saya bisa dipanen?`,
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: `msg-${plotId}-2`,
      role: 'assistant',
      content: isCabai
        ? `Berdasarkan data ${plotName} Anda:\n\n🌶️ **Prediksi Panen Cabai:**\nTanaman cabai Anda saat ini di HST ${hst}. Cabai umumnya siap panen pada HST 70-90 hari.\n\n**Estimasi panen pertama:** sekitar ${90 - hst} hari lagi (HST 90)\n\n**Tanda cabai siap panen:**\n• Warna berubah dari hijau ke merah/oranye\n• Ukuran buah maksimal (8-10 cm)\n• Tangkai buah masih segar, tidak layu\n\n**Tips:** Panen pagi hari saat suhu sejuk untuk menjaga kesegaran cabai. Gunakan gunting tajam, jangan memetik paksa agar tidak merusak batang.`
        : `Berdasarkan data ${plotName} Anda:\n\n🍅 **Prediksi Panen Tomat:**\nTanaman tomat Anda saat ini di HST ${hst}. Tomat umumnya siap panen pada HST 60-80 hari.\n\n**Estimasi panen pertama:** sekitar ${70 - hst} hari lagi (HST 70)\n\n**Tanda tomat siap panen:**\n• Warna berubah merata menjadi merah\n• Buah terasa sedikit lunak saat ditekan\n• Dasar buah mulai kekuningan\n\n**Tips:** Panen tomat saat warna 75-80% merah untuk distribusi pasar. Simpan di suhu ruang, hindari kulkas agar rasa tidak rusak.`,
      timestamp: new Date(Date.now() - 2 * 3600000 + 30000).toISOString(),
    },
    {
      id: `msg-${plotId}-3`,
      role: 'user',
      content: 'Dosis pupuk apa yang tepat hari ini?',
      timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: `msg-${plotId}-4`,
      role: 'assistant',
      content: isCabai
        ? `**Rekomendasi Pemupukan Cabai HST ${hst}:**\n\n📋 **Fase Saat Ini:** Pembungaan & Pembuahan Awal\n\n**Pupuk Utama (hari ini):**\n• NPK 16-16-16: **5 gram/tanaman** (larutkan dalam 1 liter air)\n• KCl: **2 gram/tanaman** (untuk meningkatkan kualitas buah)\n\n**Cara Aplikasi:**\n1. Larutkan pupuk dalam air\n2. Siramkan di sekitar pangkal tanaman (radius 15cm)\n3. Siram air biasa setelahnya\n\n**Waktu terbaik:** Pagi 07.00-09.00\n\n⚠️ **Perhatian:** Jangan pupuk saat tanah terlalu kering atau terlalu basah. Pastikan kelembapan tanah 60-75% sebelum pemupukan.`
        : `**Rekomendasi Pemupukan Tomat HST ${hst}:**\n\n📋 **Fase Saat Ini:** Pembungaan Awal\n\n**Pupuk Utama (hari ini):**\n• Kalsium-Boron: **2 ml/liter** (semprot daun, cegah BER)\n• NPK 15-15-15: **4 gram/tanaman** (siram akar)\n\n**Cara Aplikasi:**\n1. Semprotkan Ca-B di pagi hari ke seluruh daun\n2. Larutkan NPK dalam 2 liter air per tanaman\n3. Siramkan merata di zona akar\n\n**Waktu terbaik:** Sore 15.00-17.00\n\n⚠️ **Perhatian:** Tomat sangat sensitif terhadap defisiensi kalsium di fase ini. Pastikan pH tanah 6.0-6.8 untuk penyerapan optimal.`,
      timestamp: new Date(Date.now() - 1 * 3600000 + 45000).toISOString(),
    },
  ]
}
