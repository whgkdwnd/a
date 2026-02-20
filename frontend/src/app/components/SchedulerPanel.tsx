import { useState } from 'react'
import { Settings, X, HelpCircle, Trash2 } from 'lucide-react'
import { QuestItem } from './QuestItem'
import { BossItem } from './BossItem'
import { ContentItem } from './ContentItem'
import { CounterItem } from './CounterItem'

interface Boss {
  id: number
  name: string
  checked: boolean
}

interface SchedulerPanelProps {
  title: string
  onClose: () => void
  onDelete?: () => void
  bosses: Boss[]
  completedBosses: number
  totalBosses: number
  onToggleBoss: (id: number) => void
  materialCount: number
  onMaterialIncrement: () => void
  onMaterialDecrement: () => void
  /** 총 수입에 더해지는 소재 수입 (횟수 × (1소재획당 메소 + 솔에르다 개수 × 가격)) */
  materialIncome?: number
  onOpenDailySettings: () => void
  onOpenWeeklySettings: () => void
  onOpenHuntingSettings: () => void
  onOpenBossSettings: () => void
}

export function SchedulerPanel({
  title,
  onClose,
  onDelete,
  bosses,
  completedBosses,
  totalBosses,
  onToggleBoss,
  materialCount,
  onMaterialIncrement,
  onMaterialDecrement,
  materialIncome = 0,
  onOpenDailySettings,
  onOpenWeeklySettings,
  onOpenHuntingSettings,
  onOpenBossSettings,
}: SchedulerPanelProps) {
  const [dailyContentCompletion, setDailyContentCompletion] = useState({
    arcaneRiver: false,
    grandis: false,
    monsterPark: false,
  })
  const [weeklyContentCompletion, setWeeklyContentCompletion] = useState({
    monsterParkExtreme: false,
    epicDungeon: false,
    guildUnderground: false,
    guildFlagRace: false,
  })
  const [weeklyQuestCompletion, setWeeklyQuestCompletion] = useState({ mapleUnion: false })
  const [isGuildExpanded, setIsGuildExpanded] = useState(false)

  const isGuildContentCompleted =
    weeklyContentCompletion.guildUnderground && weeklyContentCompletion.guildFlagRace

  return (
    <div className="w-full max-w-6xl bg-[#475466] rounded-lg shadow-2xl border-4 border-gray-700 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-3 rounded-t-lg flex items-center justify-between border-b-2 border-gray-800">
        <div
          className="text-2xl font-bold text-yellow-300 tracking-wider"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          {title}
        </div>
        <div className="flex items-center gap-2">
          {onDelete != null && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/20 rounded transition-colors"
              title="프로필 삭제"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          )}
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="space-y-4">
          <div className="bg-[#5A6475] rounded-lg p-3 border-2 border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                일일 컨텐츠
              </div>
              <button
                type="button"
                onClick={onOpenDailySettings}
                className="p-2 bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="bg-[#767C8C] rounded px-3 py-2 mb-2 flex items-center justify-between">
              <div className="text-white font-bold text-sm">QUEST</div>
              <button
                type="button"
                className="px-3 py-1 bg-gray-500 text-white rounded text-xs font-medium hover:bg-gray-600 transition-colors"
                onClick={() =>
                  setDailyContentCompletion({ arcaneRiver: true, grandis: true, monsterPark: true })
                }
              >
                일괄완료
              </button>
            </div>
            <div className="space-y-2">
              <ContentItem
                title="아케인리버 일일퀘스트"
                completed={dailyContentCompletion.arcaneRiver}
                onToggleComplete={() =>
                  setDailyContentCompletion((c) => ({ ...c, arcaneRiver: !c.arcaneRiver }))
                }
              />
              <ContentItem
                title="그란디스 일일 퀘스트"
                completed={dailyContentCompletion.grandis}
                onToggleComplete={() => setDailyContentCompletion((c) => ({ ...c, grandis: !c.grandis }))}
              />
              <ContentItem
                title="몬스터파크"
                completed={dailyContentCompletion.monsterPark}
                onToggleComplete={() =>
                  setDailyContentCompletion((c) => ({ ...c, monsterPark: !c.monsterPark }))
                }
              />
            </div>
          </div>

          <div className="bg-[#5A6475] rounded-lg p-3 border-2 border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                주간 컨텐츠
              </div>
              <button
                type="button"
                onClick={onOpenWeeklySettings}
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
                onToggleComplete={() =>
                  setWeeklyContentCompletion((c) => ({
                    ...c,
                    monsterParkExtreme: !c.monsterParkExtreme,
                  }))
                }
              />
              <ContentItem
                title="에픽던전"
                completed={weeklyContentCompletion.epicDungeon}
                onToggleComplete={() =>
                  setWeeklyContentCompletion((c) => ({ ...c, epicDungeon: !c.epicDungeon }))
                }
              />
              <div>
                <ContentItem
                  title="길드 컨텐츠"
                  completed={isGuildContentCompleted}
                  onAction={() => setIsGuildExpanded(!isGuildExpanded)}
                  showArrow
                />
                {isGuildExpanded && (
                  <div className="mt-2 ml-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <ContentItem
                      title="지하 수로"
                      completed={weeklyContentCompletion.guildUnderground}
                      onToggleComplete={() =>
                        setWeeklyContentCompletion((c) => ({
                          ...c,
                          guildUnderground: !c.guildUnderground,
                        }))
                      }
                    />
                    <ContentItem
                      title="플레그 레이스"
                      completed={weeklyContentCompletion.guildFlagRace}
                      onToggleComplete={() =>
                        setWeeklyContentCompletion((c) => ({
                          ...c,
                          guildFlagRace: !c.guildFlagRace,
                        }))
                      }
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
                onToggleComplete={() =>
                  setWeeklyQuestCompletion((c) => ({ ...c, mapleUnion: !c.mapleUnion }))
                }
              />
            </div>
          </div>

          <div className="bg-[#5A6475] rounded-lg p-3 border-2 border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                사냥 컨텐츠
              </div>
              <button
                type="button"
                onClick={onOpenHuntingSettings}
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
                onIncrement={onMaterialIncrement}
                onDecrement={onMaterialDecrement}
              />
              <p className="text-xs text-gray-300 mt-1 px-3">
                총 수입에 +{materialIncome >= 1e8 ? (materialIncome / 1e8).toFixed(1) + '억' : materialIncome >= 1e4 ? (materialIncome / 1e4).toFixed(0) + '만' : materialIncome} 메소 반영
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#5A6475] rounded-lg p-3 border-2 border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                보스 컨텐츠
              </div>
              <button
                type="button"
                onClick={onOpenBossSettings}
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
                  difficulty="NORMAL"
                  icon="👹"
                  completed={boss.checked}
                  onToggle={() => onToggleBoss(boss.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          className="w-8 h-8 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-700 transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-gray-300" />
        </button>
      </div>
    </div>
  )
}
