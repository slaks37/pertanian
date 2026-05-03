export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">📡</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Tidak Ada Koneksi</h1>
      <p className="text-gray-500 mb-8 leading-relaxed">
        Smart Farm memerlukan koneksi internet untuk fitur AI dan sensor real-time.
        Kalender dan riwayat tugas tersedia dalam mode offline.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 w-full max-w-sm mb-6 text-left space-y-3">
        <p className="font-bold text-gray-700 text-sm mb-2">Tersedia offline:</p>
        {[
          ['✅', 'Kalender to-do list hari ini'],
          ['✅', 'Riwayat tugas 24 jam terakhir'],
          ['✅', 'Data sensor terakhir yang tersimpan'],
          ['✅', 'Informasi plot dan lahan'],
          ['⏳', 'Analisis foto AI (perlu online)'],
          ['⏳', 'Chatbot asisten (perlu online)'],
          ['⏳', 'Update sensor real-time (perlu online)'],
        ].map(([icon, label]) => (
          <div key={label as string} className="flex items-center gap-2.5">
            <span className="text-base">{icon}</span>
            <span className="text-sm text-gray-600">{label as string}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => window.location.reload()}
        className="w-full max-w-sm py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200"
      >
        Coba Sambungkan Ulang
      </button>
    </div>
  )
}
