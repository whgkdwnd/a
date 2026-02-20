import { X } from "lucide-react";

interface DailySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailySettingsModal({ isOpen, onClose }: DailySettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#475466] rounded-lg shadow-2xl border-4 border-gray-700 animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4 rounded-t-lg flex items-center justify-between border-b-2 border-gray-800">
          <div className="text-xl font-bold text-cyan-300 tracking-wider">
            일일 컨텐츠 설정
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-600 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-[#5A6475] rounded-lg p-4 border-2 border-gray-600">
            <h3 className="text-white font-bold mb-3 text-sm">표시 설정</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  defaultChecked
                  className="w-4 h-4 rounded border-2 border-gray-500 bg-gray-600 checked:bg-cyan-400 checked:border-cyan-400 cursor-pointer"
                />
                <span className="text-sm text-gray-200 group-hover:text-white transition-colors">완료한 퀘스트 숨기기</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-2 border-gray-500 bg-gray-600 checked:bg-cyan-400 checked:border-cyan-400 cursor-pointer"
                />
                <span className="text-sm text-gray-200 group-hover:text-white transition-colors">진행도 바 표시</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  defaultChecked
                  className="w-4 h-4 rounded border-2 border-gray-500 bg-gray-600 checked:bg-cyan-400 checked:border-cyan-400 cursor-pointer"
                />
                <span className="text-sm text-gray-200 group-hover:text-white transition-colors">완료 시 효과음</span>
              </label>
            </div>
          </div>

          <div className="bg-[#5A6475] rounded-lg p-4 border-2 border-gray-600">
            <h3 className="text-white font-bold mb-3 text-sm">알림 설정</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  defaultChecked
                  className="w-4 h-4 rounded border-2 border-gray-500 bg-gray-600 checked:bg-cyan-400 checked:border-cyan-400 cursor-pointer"
                />
                <span className="text-sm text-gray-200 group-hover:text-white transition-colors">일일 초기화 알림</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-2 border-gray-500 bg-gray-600 checked:bg-cyan-400 checked:border-cyan-400 cursor-pointer"
                />
                <span className="text-sm text-gray-200 group-hover:text-white transition-colors">미완료 퀘스트 알림</span>
              </label>
            </div>
          </div>

          <div className="bg-[#5A6475] rounded-lg p-4 border-2 border-gray-600">
            <h3 className="text-white font-bold mb-3 text-sm">컨텐츠 관리</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-cyan-400 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors text-sm">
                컨텐츠 추가
              </button>
              <button className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors text-sm">
                전체 초기화
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-700/50 rounded-b-lg border-t-2 border-gray-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors text-sm"
          >
            취소
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-cyan-400 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors text-sm"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
