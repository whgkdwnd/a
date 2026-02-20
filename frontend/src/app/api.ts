const electron = typeof window !== 'undefined' ? window.electronAPI : undefined

function requireElectron(): NonNullable<typeof electron> {
  if (!electron) throw new Error('이 앱은 데스크톱 프로그램으로만 실행할 수 있습니다. (Electron)')
  return electron
}

export async function getGoalBalance() {
  return requireElectron().getGoalBalance()
}

export async function updateGoalBalance(body: { goal_amount?: number; current_amount?: number }) {
  return requireElectron().updateGoalBalance(body)
}

export async function getMaterialSettings() {
  return requireElectron().getMaterialSettings()
}

export async function updateMaterialSettings(body: {
  meso_per_run?: number
  sol_erda_count?: number
  sol_erda_price?: number
  material_run_count?: number
}) {
  return requireElectron().updateMaterialSettings(body)
}

export async function getRecords(month: string | null) {
  return requireElectron().getRecords(month)
}

export async function createRecord(body: { type: string; amount: number; description?: string }) {
  return requireElectron().createRecord(body)
}

export async function deleteRecord(id: number) {
  return requireElectron().deleteRecord(id)
}

export async function getContents() {
  return requireElectron().getContents()
}

export async function createContent(body: { name: string; cost: number }) {
  return requireElectron().createContent(body)
}

export async function spendContent(body: { content_id: number }) {
  return requireElectron().spendContent(body)
}

export async function getBosses() {
  return requireElectron().getBosses()
}

export async function createBoss(body: { name: string; reward_amount: number }) {
  return requireElectron().createBoss(body)
}

export async function deleteBoss(id: number) {
  return requireElectron().deleteBoss(id)
}

export async function reorderBosses(body: { ordered_ids: number[] }) {
  return requireElectron().reorderBosses(body)
}

export async function checkBoss(body: { boss_id: number; reward_amount?: number }) {
  return requireElectron().checkBoss(body)
}

export async function resetBosses() {
  return requireElectron().resetBosses()
}

export async function recordAhmae(body: { amount: number; description?: string }) {
  return requireElectron().recordAhmae(body)
}
