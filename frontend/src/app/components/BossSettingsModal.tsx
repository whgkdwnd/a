import { X } from 'lucide-react'

interface BossSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BossSettingsModal({ isOpen, onClose }: BossSettingsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-2xl animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">⚙</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800">보스 설정</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500">보스는 스케줄러 패널에서 체크하여 완료할 수 있습니다.</p>
        </div>
      </div>
    </div>
  )
}
