import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import * as api from '../api'

interface HuntingSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
}

export function HuntingSettingsModal({ isOpen, onClose, onSaved }: HuntingSettingsModalProps) {
  const [mesoPerRun, setMesoPerRun] = useState('')
  const [solErdaCount, setSolErdaCount] = useState('')
  const [solErdaPrice, setSolErdaPrice] = useState('')

  useEffect(() => {
    if (isOpen) {
      api.getMaterialSettings().then((m) => {
        setMesoPerRun(String(m.meso_per_run || ''))
        setSolErdaCount(String(m.sol_erda_count || ''))
        setSolErdaPrice(String(m.sol_erda_price || ''))
      }).catch(() => {})
    }
  }, [isOpen])

  const handleSave = async () => {
    const body: Parameters<typeof api.updateMaterialSettings>[0] = {}
    if (mesoPerRun !== '') body.meso_per_run = Number(mesoPerRun)
    if (solErdaCount !== '') body.sol_erda_count = Number(solErdaCount)
    if (solErdaPrice !== '') body.sol_erda_price = Number(solErdaPrice)
    if (Object.keys(body).length === 0) {
      onClose()
      return
    }
    try {
      await api.updateMaterialSettings(body)
      onSaved?.()
      onClose()
    } catch (e) {
      alert((e as Error).message)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-[#475466] rounded-lg shadow-2xl border-4 border-gray-700 animate-in zoom-in-95 fade-in duration-300">
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4 rounded-t-lg flex items-center justify-between border-b-2 border-gray-800">
          <div className="text-xl font-bold text-cyan-300 tracking-wider">사냥 컨텐츠 설정</div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-600 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-[#5A6475] rounded-lg p-4 border-2 border-gray-600">
            <h3 className="text-white font-bold mb-3 text-sm">소재획 설정</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">1 소재획당 얻는 메소</label>
                <input
                  type="number"
                  min={0}
                  value={mesoPerRun}
                  onChange={(e) => setMesoPerRun(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded border-2 border-gray-500 focus:border-cyan-400 outline-none text-sm"
                  placeholder="예: 500000"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">솔 에르다 조각 개수</label>
                <input
                  type="number"
                  min={0}
                  value={solErdaCount}
                  onChange={(e) => setSolErdaCount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded border-2 border-gray-500 focus:border-cyan-400 outline-none text-sm"
                  placeholder="예: 10"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">솔 에르다 조각 가격</label>
                <input
                  type="number"
                  min={0}
                  value={solErdaPrice}
                  onChange={(e) => setSolErdaPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded border-2 border-gray-500 focus:border-cyan-400 outline-none text-sm"
                  placeholder="예: 50000"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-700/50 rounded-b-lg border-t-2 border-gray-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors text-sm"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-cyan-400 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors text-sm"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
