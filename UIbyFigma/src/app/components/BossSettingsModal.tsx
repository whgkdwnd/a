import { X } from "lucide-react";

interface BossSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BossSettingsModal({ isOpen, onClose }: BossSettingsModalProps) {
  if (!isOpen) return null;

  const bossData = [
    { id: 1, name: "자쿰", icon: "🐲", difficulties: ["CHAOS"], party: 1 },
    { id: 2, name: "매그", icon: "👻", difficulties: ["HARD"], party: 1 },
    { id: 3, name: "힐라", icon: "💀", difficulties: ["HARD"], party: 1 },
    { id: 4, name: "파풀", icon: "🦋", difficulties: ["CHAOS"], party: 1 },
    { id: 5, name: "피에르", icon: "🎪", difficulties: ["CHAOS"], party: 1 },
    { id: 6, name: "반반", icon: "⚔️", difficulties: ["CHAOS"], party: 1 },
    { id: 7, name: "블러", icon: "👁️", difficulties: ["CHAOS"], party: 1 },
    { id: 8, name: "벨룸", icon: "🗡️", difficulties: ["CHAOS"], party: 1 },
    { id: 9, name: "핑크빈", icon: "🎀", difficulties: ["CHAOS"], party: 1 },
    { id: 10, name: "시그", icon: "🌊", difficulties: ["EASY", "NORMAL"], party: 1 },
    { id: 11, name: "스우", icon: "🔮", difficulties: ["NORMAL", "HARD", "EXTREME"], party: 1 },
    { id: 12, name: "데미안", icon: "😈", difficulties: ["NORMAL", "HARD"], party: 1 },
    { id: 13, name: "가엔슬", icon: "👼", difficulties: ["NORMAL", "CHAOS"], party: 1 },
    { id: 14, name: "루시드", icon: "💜", difficulties: ["EASY", "NORMAL", "HARD"], party: 1 },
    { id: 15, name: "윌", icon: "🌙", difficulties: ["EASY", "NORMAL", "HARD"], party: 1 },
    { id: 16, name: "더스크", icon: "🌑", difficulties: ["NORMAL", "CHAOS"], party: 1 },
    { id: 17, name: "진힐라", icon: "💀", difficulties: ["NORMAL", "HARD"], party: 1 },
    { id: 18, name: "듀렐", icon: "⚔️", difficulties: ["NORMAL", "HARD"], party: 1 },
    { id: 19, name: "세렌", icon: "🌸", difficulties: ["NORMAL", "HARD", "EXTREME"], party: 1 },
    { id: 20, name: "칼로스", icon: "👀", difficulties: ["EASY", "NORMAL", "CHAOS", "EXTREME"], party: 1 },
    { id: 21, name: "대척자", icon: "🎭", difficulties: ["EASY", "NORMAL", "HARD", "EXTREME"], party: 1 },
    { id: 22, name: "카링", icon: "🔥", difficulties: ["EASY", "NORMAL", "HARD", "EXTREME"], party: 1 },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "CHAOS":
        return "bg-gray-800 text-white";
      case "HARD":
        return "bg-pink-500 text-white";
      case "NORMAL":
        return "bg-cyan-400 text-white";
      case "EASY":
        return "bg-gray-400 text-white";
      case "EXTREME":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-2xl animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">⚙</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800">보스 선택</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 border-b border-gray-200 px-6">
          <div className="flex gap-6">
            <button className="px-4 py-3 font-medium text-gray-800 border-b-2 border-gray-800">
              스킬
            </button>
            <button className="px-4 py-3 font-medium text-gray-400 hover:text-gray-600">
              아우릴
            </button>
            <button className="px-4 py-3 font-medium text-gray-400 hover:text-gray-600">
              노블티
            </button>
            <button className="px-4 py-3 font-medium text-gray-400 hover:text-gray-600">
              캠핑숍
            </button>
            <button className="px-4 py-3 font-medium text-gray-400 hover:text-gray-600">
              하데이크
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-[1fr_200px_100px_80px] gap-4 items-center">
            <div className="text-sm font-bold text-gray-700">보스</div>
            <div className="text-sm font-bold text-gray-700">난이도</div>
            <div className="text-sm font-bold text-gray-700">파티원</div>
            <div className="text-sm font-bold text-gray-700 flex items-center gap-1">
              가격
              <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>

        {/* Boss List */}
        <div className="overflow-y-auto flex-1">
          {bossData.map((boss) => (
            <div 
              key={boss.id}
              className="px-6 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-[1fr_200px_100px_80px] gap-4 items-center">
                {/* Boss Name & Checkbox */}
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-2 border-gray-300 checked:bg-cyan-400 checked:border-cyan-400"
                  />
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-lg">
                    {boss.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{boss.name}</span>
                </div>

                {/* Difficulties */}
                <div className="flex flex-wrap gap-1">
                  {boss.difficulties.map((diff) => (
                    <span 
                      key={diff}
                      className={`px-2 py-0.5 text-xs font-bold rounded ${getDifficultyColor(diff)}`}
                    >
                      {diff}
                    </span>
                  ))}
                </div>

                {/* Party Size */}
                <div>
                  <select className="w-full px-3 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6</option>
                  </select>
                </div>

                {/* Price (placeholder) */}
                <div className="text-sm text-gray-600">
                  -
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}