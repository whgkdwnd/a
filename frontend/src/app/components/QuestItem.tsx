import { X } from 'lucide-react'

interface QuestItemProps {
  title: string
  current?: number
  max?: number
  completed?: boolean
  onToggleComplete?: () => void
  showProgress?: boolean
}

export function QuestItem({
  title,
  current,
  max,
  completed = false,
  onToggleComplete,
  showProgress = true,
}: QuestItemProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        completed ? 'bg-[#6B7280]' : 'bg-[#9FA4B0]'
      }`}
    >
      <div className={`flex-1 text-sm font-medium ${completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
        {title}
      </div>
      {showProgress && current !== undefined && max !== undefined && (
        <div className={`text-sm font-bold ${completed ? 'text-gray-400' : 'text-gray-700'}`}>
          {current} / {max}
        </div>
      )}
      {onToggleComplete != null && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete()
          }}
          className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${
            completed ? 'bg-gray-500 hover:bg-gray-600 text-white flex items-center gap-1' : 'bg-cyan-400 hover:bg-cyan-500 text-white'
          }`}
        >
          {completed ? (
            <>
              <X className="w-4 h-4" strokeWidth={3} />
              취소
            </>
          ) : (
            '완료'
          )}
        </button>
      )}
    </div>
  )
}
