import { useState } from "react";
import { Settings, X, HelpCircle, Calendar, Plus } from "lucide-react";
import { QuestItem } from "./components/QuestItem";
import { BossItem } from "./components/BossItem";
import { ContentItem } from "./components/ContentItem";
import { CounterItem } from "./components/CounterItem";
import { BossSettingsModal } from "./components/BossSettingsModal";
import { DailySettingsModal } from "./components/DailySettingsModal";
import { WeeklySettingsModal } from "./components/WeeklySettingsModal";
import { HuntingSettingsModal } from "./components/HuntingSettingsModal";

interface Quest {
  id: string;
  title: string;
  current: number;
  max: number;
  completed: boolean;
}

interface Boss {
  id: string;
  name: string;
  difficulty: "CHAOS" | "HARD" | "NORMAL" | "EASY";
  icon: string;
  completed: boolean;
}

export default function App() {
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isGuildExpanded, setIsGuildExpanded] = useState(false);
  const [isBossSettingsOpen, setIsBossSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isDailySettingsOpen, setIsDailySettingsOpen] = useState(false);
  const [isWeeklySettingsOpen, setIsWeeklySettingsOpen] = useState(false);
  const [isHuntingSettingsOpen, setIsHuntingSettingsOpen] = useState(false);
  
  // Daily content completion state
  const [dailyContentCompletion, setDailyContentCompletion] = useState({
    arcaneRiver: false,
    grandis: false,
    monsterPark: false,
  });

  // Weekly content completion state
  const [weeklyContentCompletion, setWeeklyContentCompletion] = useState({
    monsterParkExtreme: false,
    epicDungeon: false,
    guildUnderground: false,
    guildFlagRace: false,
  });

  // Weekly quest completion state
  const [weeklyQuestCompletion, setWeeklyQuestCompletion] = useState({
    mapleUnion: false,
  });

  // Hunting content counter state
  const [materialCount, setMaterialCount] = useState(0);
  
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([
    { id: "1", title: "[일일 퀘스트] 호텔 아르크스..", current: 0, max: 100, completed: false },
    { id: "2", title: "[일일 퀘스트] 오디움 알데..", current: 0, max: 100, completed: false },
    { id: "3", title: "[일일 퀘스트] 도핑경 오영..", current: 0, max: 100, completed: false },
    { id: "4", title: "[일일 퀘스트] 아테데이아 잔..", current: 0, max: 300, completed: false },
    { id: "5", title: "[일일 퀘스트] 카트시온 복구..", current: 500, max: 500, completed: false },
  ]);

  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([
    { id: "w1", title: "[메이플 유니언] 주간 드래곤..", current: 0, max: 1, completed: false },
  ]);

  const [bosses, setBosses] = useState<Boss[]>([
    { id: "b1", name: "피콜리투스", difficulty: "CHAOS", icon: "🐲", completed: false },
    { id: "b2", name: "스우", difficulty: "HARD", icon: "👻", completed: true },
    { id: "b3", name: "데미안", difficulty: "HARD", icon: "😈", completed: true },
    { id: "b4", name: "가디언 엔젤 슬리맵", difficulty: "CHAOS", icon: "👼", completed: true },
    { id: "b5", name: "루시드", difficulty: "HARD", icon: "💜", completed: true },
    { id: "b6", name: "윌", difficulty: "HARD", icon: "👁️", completed: true },
    { id: "b7", name: "더스크", difficulty: "CHAOS", icon: "🌙", completed: true },
    { id: "b8", name: "진 힐라", difficulty: "HARD", icon: "💀", completed: true },
    { id: "b9", name: "듀랠", difficulty: "HARD", icon: "⚔️", completed: true },
    { id: "b10", name: "선택받은 세렌", difficulty: "NORMAL", icon: "🌸", completed: false },
    { id: "b11", name: "감시자 칼로스", difficulty: "EASY", icon: "👀", completed: false },
    { id: "b12", name: "최초의 대척자", difficulty: "EASY", icon: "🎭", completed: false },
  ]);

  const toggleBoss = (id: string) => {
    setBosses(bosses.map(boss => 
      boss.id === id ? { ...boss, completed: !boss.completed } : boss
    ));
  };

  const completeQuest = (id: string, isWeekly: boolean = false) => {
    if (isWeekly) {
      setWeeklyQuests(weeklyQuests.map(quest =>
        quest.id === id ? { ...quest, completed: true } : quest
      ));
    } else {
      setDailyQuests(dailyQuests.map(quest =>
        quest.id === id ? { ...quest, completed: true } : quest
      ));
    }
  };

  const completedBosses = bosses.filter(b => b.completed).length;
  const totalBosses = bosses.length;

  // Check if guild content is completed (both sub-items completed)
  const isGuildContentCompleted = weeklyContentCompletion.guildUnderground && weeklyContentCompletion.guildFlagRace;

  // Function to complete all daily content
  const completeAllDailyContent = () => {
    setDailyContentCompletion({
      arcaneRiver: true,
      grandis: true,
      monsterPark: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 gap-8">
      {/* Toggle Buttons */}
      <div className="flex items-center gap-6">
        {/* Progress Chart Button */}
        <button
          onClick={() => {
            setIsStatsOpen(!isStatsOpen);
            if (!isStatsOpen) setIsSchedulerOpen(false);
          }}
          className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-2xl border-4 border-cyan-500 hover:scale-110 transition-transform duration-300 flex items-center justify-center group relative"
        >
          {/* Circular Progress */}
          <div className="relative w-14 h-14">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray="251.2"
                strokeDashoffset="62.8"
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm drop-shadow-lg">75%</span>
            </div>
          </div>
          <div className="absolute -bottom-8 text-cyan-300 font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            진행률
          </div>
        </button>

        {/* Scheduler Toggle Button */}
        <button
          onClick={() => {
            setIsSchedulerOpen(!isSchedulerOpen);
            if (!isSchedulerOpen) setIsStatsOpen(false);
          }}
          className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-2xl border-4 border-yellow-500 hover:scale-110 transition-transform duration-300 flex items-center justify-center group relative"
        >
          <Calendar className="w-10 h-10 text-white drop-shadow-lg" />
          <div className="absolute -bottom-8 text-yellow-300 font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {isSchedulerOpen ? "닫기" : "스케줄러 열기"}
          </div>
        </button>

        {/* Add Character Button */}
        <button
          onClick={() => alert('캐릭터 추가 기능')}
          className="w-20 h-20 bg-gray-700/50 rounded-full shadow-2xl border-4 border-dashed border-gray-400 hover:border-cyan-400 hover:bg-gray-600/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group relative"
        >
          <Plus className="w-10 h-10 text-gray-300 group-hover:text-cyan-300 drop-shadow-lg" strokeWidth={3} />
          <div className="absolute -bottom-8 text-cyan-300 font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            캐릭터 추가
          </div>
        </button>
      </div>

      {/* Scheduler UI */}
      {isSchedulerOpen && (
        <div className="w-full max-w-6xl bg-[#475466] rounded-lg shadow-2xl border-4 border-gray-700 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-3 rounded-t-lg flex items-center justify-between border-b-2 border-gray-800">
            <div className="text-2xl font-bold text-yellow-300 tracking-wider" style={{ fontFamily: 'system-ui, sans-serif' }}>
              MAPLE SCHEDULER
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* Left Panel - Daily Content */}
            <div className="space-y-4">
              {/* Daily Quests */}
              <div className="bg-[#5A6475] rounded-lg p-3 border-2 border-gray-600">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                    일일 컨텐츠
                  </div>
                  <button 
                    onClick={() => setIsDailySettingsOpen(true)}
                    className="p-2 bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                <div className="bg-[#767C8C] rounded px-3 py-2 mb-2 flex items-center justify-between">
                  <div className="text-white font-bold text-sm">QUEST</div>
                  <button 
                    className="px-3 py-1 bg-gray-500 text-white rounded text-xs font-medium hover:bg-gray-600 transition-colors" 
                    onClick={completeAllDailyContent}
                  >
                    일괄완료
                  </button>
                </div>

                <div className="space-y-2">
                  <ContentItem 
                    title="아케인리버 일일퀘스트" 
                    completed={dailyContentCompletion.arcaneRiver}
                    onToggleComplete={() => setDailyContentCompletion({
                      ...dailyContentCompletion,
                      arcaneRiver: !dailyContentCompletion.arcaneRiver
                    })}
                  />
                  <ContentItem 
                    title="그란디스 일일 퀘스트" 
                    completed={dailyContentCompletion.grandis}
                    onToggleComplete={() => setDailyContentCompletion({
                      ...dailyContentCompletion,
                      grandis: !dailyContentCompletion.grandis
                    })}
                  />
                  <ContentItem 
                    title="몬스터파크" 
                    completed={dailyContentCompletion.monsterPark}
                    onToggleComplete={() => setDailyContentCompletion({
                      ...dailyContentCompletion,
                      monsterPark: !dailyContentCompletion.monsterPark
                    })}
                  />
                </div>
              </div>

              {/* Weekly Content */}
              <div className="bg-[#5A6475] rounded-lg p-3 border-2 border-gray-600">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                    주간 컨텐츠
                  </div>
                  <button 
                    onClick={() => setIsWeeklySettingsOpen(true)}
                    className="p-2 bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="bg-[#767C8C] rounded px-3 py-2 mb-2">
                  <div className="text-white font-bold text-sm">CONTENTS</div>
                </div>

                <div className="space-y-2 mb-4">
                  <ContentItem 
                    title="몬스터 파크 익스트림" 
                    progress="0 / 2" 
                    completed={weeklyContentCompletion.monsterParkExtreme}
                    onToggleComplete={() => setWeeklyContentCompletion({
                      ...weeklyContentCompletion,
                      monsterParkExtreme: !weeklyContentCompletion.monsterParkExtreme
                    })}
                  />
                  <ContentItem 
                    title="에픽던전" 
                    completed={weeklyContentCompletion.epicDungeon}
                    onToggleComplete={() => setWeeklyContentCompletion({
                      ...weeklyContentCompletion,
                      epicDungeon: !weeklyContentCompletion.epicDungeon
                    })}
                  />
                  <div>
                    <ContentItem 
                      title="길드 컨텐츠" 
                      completed={isGuildContentCompleted}
                      onAction={() => setIsGuildExpanded(!isGuildExpanded)}
                      showArrow={true}
                    />
                    {isGuildExpanded && (
                      <div className="mt-2 ml-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <ContentItem 
                          title="지하 수로" 
                          completed={weeklyContentCompletion.guildUnderground}
                          onToggleComplete={() => setWeeklyContentCompletion({
                            ...weeklyContentCompletion,
                            guildUnderground: !weeklyContentCompletion.guildUnderground
                          })}
                        />
                        <ContentItem 
                          title="플레그 레이스" 
                          completed={weeklyContentCompletion.guildFlagRace}
                          onToggleComplete={() => setWeeklyContentCompletion({
                            ...weeklyContentCompletion,
                            guildFlagRace: !weeklyContentCompletion.guildFlagRace
                          })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#767C8C] rounded px-3 py-2 mb-2">
                  <div className="text-white font-bold text-sm">QUEST</div>
                </div>

                <div className="space-y-2">
                  <QuestItem
                    title="[메이플 유니언] 주간 드래곤.."
                    completed={weeklyQuestCompletion.mapleUnion}
                    showProgress={false}
                    onToggleComplete={() => setWeeklyQuestCompletion({
                      ...weeklyQuestCompletion,
                      mapleUnion: !weeklyQuestCompletion.mapleUnion
                    })}
                  />
                </div>
              </div>

              {/* Hunting Content */}
              <div className="bg-[#5A6475] rounded-lg p-3 border-2 border-gray-600">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                    사냥 컨텐츠
                  </div>
                  <button 
                    onClick={() => setIsHuntingSettingsOpen(true)}
                    className="p-2 bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="bg-[#767C8C] rounded px-3 py-2 mb-2">
                  <div className="text-white font-bold text-sm">HUNTING</div>
                </div>

                <div className="space-y-2">
                  <CounterItem 
                    title="소재획득 횟수"
                    count={materialCount}
                    onIncrement={() => setMaterialCount(materialCount + 1)}
                    onDecrement={() => setMaterialCount(Math.max(0, materialCount - 1))}
                  />
                </div>
              </div>
            </div>

            {/* Right Panel - Boss Content */}
            <div className="space-y-4">
              <div className="bg-[#5A6475] rounded-lg p-3 border-2 border-gray-600">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                    보스 컨텐츠
                  </div>
                  <button 
                    onClick={() => setIsBossSettingsOpen(true)}
                    className="p-2 bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="bg-[#767C8C] rounded px-3 py-2 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-white font-bold text-sm">WEEKLY</div>
                    <div className="flex items-center gap-1 text-xs text-gray-300">
                      <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-[10px]">ⓘ</span>
                      </div>
                      <span>주간 보스 처치 제한</span>
                    </div>
                  </div>
                  <div className="text-white font-bold text-sm">
                    {completedBosses} / {totalBosses}
                  </div>
                </div>

                <div className="space-y-2">
                  {bosses.map((boss) => (
                    <BossItem
                      key={boss.id}
                      name={boss.name}
                      difficulty={boss.difficulty}
                      icon={boss.icon}
                      completed={boss.completed}
                      onToggle={() => toggleBoss(boss.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 pb-4">
            <button className="w-8 h-8 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-700 transition-colors">
              <HelpCircle className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      )}

      {/* Boss Settings Modal */}
      <BossSettingsModal 
        isOpen={isBossSettingsOpen}
        onClose={() => setIsBossSettingsOpen(false)}
      />

      {/* Daily Settings Modal */}
      <DailySettingsModal 
        isOpen={isDailySettingsOpen}
        onClose={() => setIsDailySettingsOpen(false)}
      />

      {/* Weekly Settings Modal */}
      <WeeklySettingsModal 
        isOpen={isWeeklySettingsOpen}
        onClose={() => setIsWeeklySettingsOpen(false)}
      />

      {/* Hunting Settings Modal */}
      <HuntingSettingsModal 
        isOpen={isHuntingSettingsOpen}
        onClose={() => setIsHuntingSettingsOpen(false)}
      />

      {/* Weekly Stats Panel */}
      {isStatsOpen && (
        <div className="w-full max-w-4xl bg-[#475466] rounded-lg shadow-2xl border-4 border-gray-700 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-3 rounded-t-lg flex items-center justify-between border-b-2 border-gray-800">
            <div className="text-2xl font-bold text-cyan-300 tracking-wider" style={{ fontFamily: 'system-ui, sans-serif' }}>
              주간 통계
            </div>
            <button 
              onClick={() => setIsStatsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Income */}
              <div className="bg-[#5A6475] rounded-lg p-5 border-2 border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-gray-300">총 수입</div>
                  <div className="text-2xl">💰</div>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-1">15,750,000</div>
                <div className="text-xs text-gray-400">메소</div>
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">보스 수입</span>
                    <span className="text-green-400 font-medium">12,000,000</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-400">기타 수입</span>
                    <span className="text-green-400 font-medium">3,750,000</span>
                  </div>
                </div>
              </div>

              {/* Total Expense */}
              <div className="bg-[#5A6475] rounded-lg p-5 border-2 border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-gray-300">총 지출</div>
                  <div className="text-2xl">💸</div>
                </div>
                <div className="text-3xl font-bold text-red-400 mb-1">4,250,000</div>
                <div className="text-xs text-gray-400">메소</div>
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">장비 강화</span>
                    <span className="text-red-400 font-medium">3,000,000</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-400">소비 아이템</span>
                    <span className="text-red-400 font-medium">1,250,000</span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="bg-[#5A6475] rounded-lg p-5 border-2 border-cyan-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold text-gray-300">순이익</div>
                    <div className="text-2xl">📈</div>
                  </div>
                  <div className="text-3xl font-bold text-cyan-400 mb-1">11,500,000</div>
                  <div className="text-xs text-gray-400">메소</div>
                  <div className="mt-3 pt-3 border-t border-cyan-600">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-full" style={{ width: '73%' }}></div>
                      </div>
                      <span className="text-cyan-400 font-bold text-sm">+73%</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">전주 대비 수익률</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 bg-[#5A6475] rounded-lg p-4 border-2 border-gray-600">
              <div className="text-sm font-bold text-gray-300 mb-3">이번주 주요 활동</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">보스 클리어</span>
                  <span className="text-white font-bold">{completedBosses} / {totalBosses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">일일퀘 완료</span>
                  <span className="text-white font-bold">18 / 21</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">사냥 시간</span>
                  <span className="text-white font-bold">24시간</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">메소 획득률</span>
                  <span className="text-cyan-400 font-bold">+15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}