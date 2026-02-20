export interface ElectronAPI {
  getGoalBalance: () => Promise<{ goal_amount: number; current_amount: number; ratio_percent: number }>
  updateGoalBalance: (body: { goal_amount?: number; current_amount?: number }) => Promise<unknown>
  getMaterialSettings: () => Promise<{
    meso_per_run: number
    sol_erda_count: number
    sol_erda_price: number
    material_run_count: number
  }>
  updateMaterialSettings: (body: Partial<{
    meso_per_run: number
    sol_erda_count: number
    sol_erda_price: number
    material_run_count: number
  }>) => Promise<unknown>
  getRecords: (month: string | null) => Promise<{ records: Array<{
    id: number
    type: string
    amount: number
    description: string
    date: string
    created_at: string
  }> }>
  createRecord: (body: { type: string; amount: number; description?: string }) => Promise<unknown>
  deleteRecord: (id: number) => Promise<unknown>
  getContents: () => Promise<{ contents: Array<{ id: number; name: string; cost: number }> }>
  createContent: (body: { name: string; cost: number }) => Promise<unknown>
  spendContent: (body: { content_id: number }) => Promise<unknown>
  getBosses: () => Promise<{ bosses: Array<{
    id: number
    name: string
    reward_amount: number
    checked: boolean
    checked_at: string | null
  }> }>
  createBoss: (body: { name: string; reward_amount: number }) => Promise<unknown>
  deleteBoss: (id: number) => Promise<unknown>
  reorderBosses: (body: { ordered_ids: number[] }) => Promise<unknown>
  checkBoss: (body: { boss_id: number; reward_amount?: number }) => Promise<unknown>
  resetBosses: () => Promise<unknown>
  recordAhmae: (body: { amount: number; description?: string }) => Promise<unknown>
  getDataPath: () => Promise<string>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
