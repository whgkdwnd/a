import { ChevronRight, X } from "lucide-react";

interface ContentItemProps {
  title: string;
  subtitle?: string;
  progress?: string;
  onAction?: () => void;
  showArrow?: boolean;
  completed?: boolean;
  onToggleComplete?: () => void;
}

export function ContentItem({ title, subtitle, progress, onAction, showArrow = false, completed = false, onToggleComplete }: ContentItemProps) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
      completed ? "bg-[#6B7280]" : "bg-[#9FA4B0] hover:bg-[#A5AAB6]"
    }`} onClick={onAction}>
      <div className="flex-1">
        <div className={`text-sm font-medium ${completed ? "text-gray-400 line-through" : "text-gray-800"}`}>
          {title}
        </div>
        {subtitle && <div className="text-xs text-gray-600">{subtitle}</div>}
      </div>
      {progress && (
        <div className={`text-sm font-bold ${completed ? "text-gray-400" : "text-gray-700"}`}>
          {progress}
        </div>
      )}
      {showArrow && (
        <button className="p-1.5 rounded-full bg-gray-400 hover:bg-gray-500 transition-colors">
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      )}
      {!showArrow && onToggleComplete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${
            completed
              ? "bg-gray-500 hover:bg-gray-600 text-white flex items-center gap-1"
              : "bg-cyan-400 hover:bg-cyan-500 text-white"
          }`}
        >
          {completed ? (
            <>
              <X className="w-4 h-4" strokeWidth={3} />
              취소
            </>
          ) : (
            "완료"
          )}
        </button>
      )}
    </div>
  );
}