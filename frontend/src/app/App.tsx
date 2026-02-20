import { useState, useEffect, useCallback, useRef } from 'react'
import { X, HelpCircle, Calendar, Plus, User } from 'lucide-react'
import { BossSettingsModal } from './components/BossSettingsModal'
import { DailySettingsModal } from './components/DailySettingsModal'
import { WeeklySettingsModal } from './components/WeeklySettingsModal'
import { HuntingSettingsModal } from './components/HuntingSettingsModal'
import { SchedulerPanel } from './components/SchedulerPanel'
import * as api from './api'

interface Boss {
  id: number
  name: string
  reward_amount: number
  checked: boolean
  checked_at: string | null
}

function formatMeso(n: number): string {
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '억'
  if (n >= 1e4) return (n / 1e4).toFixed(0) + '만'
  return String(n)
}

export default function App() {
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [isGuildExpanded, setIsGuildExpanded] = useState(false)
  const [isBossSettingsOpen, setIsBossSettingsOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [isDailySettingsOpen, setIsDailySettingsOpen] = useState(false)
  const [isWeeklySettingsOpen, setIsWeeklySettingsOpen] = useState(false)
  const [isHuntingSettingsOpen, setIsHuntingSettingsOpen] = useState(false)
  const [additionalSchedulerIds, setAdditionalSchedulerIds] = useState<number[]>([])
  const [openAdditionalSchedulerId, setOpenAdditionalSchedulerId] = useState<number | null>(null)
  const nextSchedulerIdRef = useRef(1)

  const [goalBalance, setGoalBalance] = useState({ goal_amount: 0, current_amount: 0, ratio_percent: 0 })
  const [bosses, setBosses] = useState<Boss[]>([])
  const [materialSettings, setMaterialSettings] = useState({
    meso_per_run: 0,
    sol_erda_count: 0,
    sol_erda_price: 0,
    material_run_count: 0,
  })
  const [records, setRecords] = useState<Array<{ id: number; type: string; amount: number; description: string }>>([])

  const refresh = useCallback(async () => {
    try {
      const [gb, bossData, mat, recData] = await Promise.all([
        api.getGoalBalance(),
        api.getBosses(),
        api.getMaterialSettings(),
        api.getRecords(new Date().toISOString().slice(0, 7)),
      ])
      setGoalBalance(gb)
      setBosses(bossData.bosses || [])
      setMaterialSettings(mat)
      setRecords(recData.records || [])
    } catch (_) {}
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggleBoss = async (id: number) => {
    const boss = bosses.find((b) => b.id === id)
    if (!boss || boss.checked) return
    try {
      await api.checkBoss({ boss_id: id })
      await refresh()
    } catch (e) {
      alert((e as Error).message)
    }
  }

  const materialCount = materialSettings.material_run_count
  const setMaterialCount = async (next: number) => {
    try {
      await api.updateMaterialSettings({ material_run_count: Math.max(0, next) })
      setMaterialSettings((m) => ({ ...m, material_run_count: Math.max(0, next) }))
    } catch (e) {
      alert((e as Error).message)
    }
  }

  const completedBosses = bosses.filter((b) => b.checked).length
  const totalBosses = bosses.length

  const addNewScheduler = () => {
    const id = nextSchedulerIdRef.current++
    setAdditionalSchedulerIds((prev) => [...prev, id])
  }
  const removeAdditionalScheduler = (id: number) => {
    setAdditionalSchedulerIds((prev) => prev.filter((x) => x !== id))
    if (openAdditionalSchedulerId === id) setOpenAdditionalSchedulerId(null)
  }
  const toggleAdditionalScheduler = (id: number) => {
    setOpenAdditionalSchedulerId((prev) => (prev === id ? null : id))
    setIsSchedulerOpen(false)
    setIsStatsOpen(false)
  }

  const incomeFromRecords = records.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const expenseFromRecords = records.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  // 총 수입에 더함: 횟수 × (1 소재획당 메소 + 솔 에르다 조각 개수 × 솔 에르다 조각 가격)
  const materialIncome =
    (materialSettings.meso_per_run + materialSettings.sol_erda_count * materialSettings.sol_erda_price) *
    materialSettings.material_run_count
  const totalIncome = incomeFromRecords + materialIncome
  const totalExpense = expenseFromRecords
  const netProfit = totalIncome - totalExpense

  const ratioPercent = Math.min(100, goalBalance.ratio_percent || 0)
  const progressOffset = 251.2 - (251.2 * ratioPercent) / 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 gap-8">
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => {
            setIsStatsOpen(!isStatsOpen)
            if (!isStatsOpen) setIsSchedulerOpen(false)
          }}
          className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-2xl border-4 border-cyan-500 hover:scale-110 transition-transform duration-300 flex items-center justify-center group relative"
        >
          <div className="relative w-14 h-14">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.3)" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray="251.2"
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm drop-shadow-lg">{ratioPercent}%</span>
            </div>
          </div>
          <div className="absolute -bottom-8 text-cyan-300 font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            진행률
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSchedulerOpen(!isSchedulerOpen)
            if (!isSchedulerOpen) setIsStatsOpen(false)
          }}
          className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-2xl border-4 border-yellow-500 hover:scale-110 transition-transform duration-300 flex items-center justify-center group relative"
        >
          <Calendar className="w-10 h-10 text-white drop-shadow-lg" />
          <div className="absolute -bottom-8 text-yellow-300 font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {isSchedulerOpen ? '닫기' : '스케줄러 열기'}
          </div>
        </button>

        {additionalSchedulerIds.map((id, index) => (
          <button
            key={id}
            type="button"
            onClick={() => toggleAdditionalScheduler(id)}
            className={`w-20 h-20 rounded-full shadow-2xl border-4 hover:scale-110 transition-all duration-300 flex items-center justify-center group relative ${
              openAdditionalSchedulerId === id
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-400'
                : 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-500'
            }`}
          >
            <User className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={2.5} />
            <div className="absolute -bottom-8 text-emerald-300 font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              캐릭터 {index + 1}
            </div>
          </button>
        ))}

        <button
          type="button"
          onClick={addNewScheduler}
          className="w-20 h-20 bg-gray-700/50 rounded-full shadow-2xl border-4 border-dashed border-gray-400 hover:border-cyan-400 hover:bg-gray-600/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group relative"
        >
          <Plus className="w-10 h-10 text-gray-300 group-hover:text-cyan-300 drop-shadow-lg" strokeWidth={3} />
          <div className="absolute -bottom-8 text-cyan-300 font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            캐릭터 추가
          </div>
        </button>
      </div>

      {isSchedulerOpen && (
        <SchedulerPanel
          title="MAPLE SCHEDULER"
          onClose={() => setIsSchedulerOpen(false)}
          bosses={bosses}
          completedBosses={completedBosses}
          totalBosses={totalBosses}
          onToggleBoss={toggleBoss}
          materialCount={materialCount}
          onMaterialIncrement={() => setMaterialCount(materialCount + 1)}
          onMaterialDecrement={() => setMaterialCount(materialCount - 1)}
          materialIncome={materialIncome}
          onOpenDailySettings={() => setIsDailySettingsOpen(true)}
          onOpenWeeklySettings={() => setIsWeeklySettingsOpen(true)}
          onOpenHuntingSettings={() => setIsHuntingSettingsOpen(true)}
          onOpenBossSettings={() => setIsBossSettingsOpen(true)}
        />
      )}

      {openAdditionalSchedulerId !== null && (() => {
        const id = openAdditionalSchedulerId
        const index = additionalSchedulerIds.indexOf(id)
        if (index === -1) return null
        return (
          <SchedulerPanel
            key={id}
            title={`캐릭터 ${index + 1}`}
            onClose={() => setOpenAdditionalSchedulerId(null)}
            onDelete={() => {
              if (confirm('이 프로필을 삭제할까요?')) {
                removeAdditionalScheduler(id)
                setOpenAdditionalSchedulerId(null)
              }
            }}
            bosses={bosses}
            completedBosses={completedBosses}
            totalBosses={totalBosses}
            onToggleBoss={toggleBoss}
            materialCount={materialCount}
            onMaterialIncrement={() => setMaterialCount(materialCount + 1)}
            onMaterialDecrement={() => setMaterialCount(materialCount - 1)}
            materialIncome={materialIncome}
            onOpenDailySettings={() => setIsDailySettingsOpen(true)}
            onOpenWeeklySettings={() => setIsWeeklySettingsOpen(true)}
            onOpenHuntingSettings={() => setIsHuntingSettingsOpen(true)}
            onOpenBossSettings={() => setIsBossSettingsOpen(true)}
          />
        )
      })()}

      <BossSettingsModal isOpen={isBossSettingsOpen} onClose={() => setIsBossSettingsOpen(false)} />
      <DailySettingsModal isOpen={isDailySettingsOpen} onClose={() => setIsDailySettingsOpen(false)} />
      <WeeklySettingsModal isOpen={isWeeklySettingsOpen} onClose={() => setIsWeeklySettingsOpen(false)} />
      <HuntingSettingsModal
        isOpen={isHuntingSettingsOpen}
        onClose={() => setIsHuntingSettingsOpen(false)}
        onSaved={refresh}
      />

      {isStatsOpen && (
        <div className="w-full max-w-4xl bg-[#475466] rounded-lg shadow-2xl border-4 border-gray-700 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-3 rounded-t-lg flex items-center justify-between border-b-2 border-gray-800">
            <div className="text-2xl font-bold text-cyan-300 tracking-wider" style={{ fontFamily: 'system-ui, sans-serif' }}>
              주간 통계
            </div>
            <button
              type="button"
              onClick={() => setIsStatsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#5A6475] rounded-lg p-5 border-2 border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-gray-300">총 수입</div>
                  <div className="text-2xl">💰</div>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-1">{formatMeso(totalIncome)}</div>
                <div className="text-xs text-gray-400">메소</div>
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">기록 수입</span>
                    <span className="text-green-400 font-medium">{formatMeso(incomeFromRecords)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-400">소재획 수입</span>
                    <span className="text-green-400 font-medium">{formatMeso(materialIncome)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#5A6475] rounded-lg p-5 border-2 border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-gray-300">총 지출</div>
                  <div className="text-2xl">💸</div>
                </div>
                <div className="text-3xl font-bold text-red-400 mb-1">{formatMeso(totalExpense)}</div>
                <div className="text-xs text-gray-400">메소</div>
              </div>
              <div className="bg-[#5A6475] rounded-lg p-5 border-2 border-cyan-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold text-gray-300">순이익</div>
                    <div className="text-2xl">📈</div>
                  </div>
                  <div className="text-3xl font-bold text-cyan-400 mb-1">{formatMeso(netProfit)}</div>
                  <div className="text-xs text-gray-400">메소</div>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-[#5A6475] rounded-lg p-4 border-2 border-gray-600">
              <div className="text-sm font-bold text-gray-300 mb-3">이번달 요약</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">보스 클리어</span>
                  <span className="text-white font-bold">
                    {completedBosses} / {totalBosses}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">소재획 횟수</span>
                  <span className="text-white font-bold">{materialCount}회</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
