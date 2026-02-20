import { Check, ChevronRight } from "lucide-react";

interface BossItemProps {
  name: string;
  difficulty: "CHAOS" | "HARD" | "NORMAL" | "EASY";
  icon: string;
  completed?: boolean;
  onToggle?: () => void;
}

export function BossItem({ name, difficulty, icon, completed, onToggle }: BossItemProps) {
  const difficultyColors = {
    CHAOS: "bg-gray-600 text-white",
    HARD: "bg-purple-600 text-white",
    NORMAL: "bg-cyan-500 text-white",
    EASY: "bg-gray-500 text-white",
  };

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
        completed ? "bg-[#6B7280]" : "bg-[#8B909C]"
      } hover:bg-[#7B8290]`}
      onClick={onToggle}
    >
      <div className="w-10 h-10 bg-white/10 rounded border-2 border-gray-600 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div className={`px-3 py-0.5 rounded-full text-xs font-bold ${difficultyColors[difficulty]}`}>
        {difficulty}
      </div>
      <div className="flex-1 text-white font-medium">
        {name}
      </div>
      {completed ? (
        <Check className="w-6 h-6 text-white" strokeWidth={3} />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-400" />
      )}
    </div>
  );
}
