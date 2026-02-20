import { Plus, Minus } from "lucide-react";

interface CounterItemProps {
  title: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function CounterItem({ title, count, onIncrement, onDecrement }: CounterItemProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-[#9FA4B0] rounded-lg">
      <div className="flex-1 text-sm font-medium text-gray-800">
        {title}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrement}
          className="w-8 h-8 rounded-full bg-gray-500 hover:bg-gray-600 transition-colors flex items-center justify-center"
          disabled={count <= 0}
        >
          <Minus className="w-4 h-4 text-white" strokeWidth={3} />
        </button>
        <div className="min-w-[60px] text-center">
          <span className="text-lg font-bold text-gray-800">{count}</span>
          <span className="text-sm text-gray-600 ml-1">회</span>
        </div>
        <button
          onClick={onIncrement}
          className="w-8 h-8 rounded-full bg-cyan-400 hover:bg-cyan-500 transition-colors flex items-center justify-center"
        >
          <Plus className="w-4 h-4 text-white" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
