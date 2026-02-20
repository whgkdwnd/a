const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const XLSX = require('xlsx')

const DATA_SHEETS = ['Goal', 'Records', 'Contents', 'Bosses', 'Meta', 'Material']

function getDataPath() {
  return path.join(app.getPath('userData'), 'data.xlsx')
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function loadWorkbook() {
  const dataPath = getDataPath()
  if (!fs.existsSync(dataPath)) return null
  return XLSX.readFile(dataPath)
}

function getNextIds(wb) {
  const meta = wb.Sheets['Meta'] ? XLSX.utils.sheet_to_json(wb.Sheets['Meta']) : []
  const row = meta[0] || {}
  return {
    records: row.records != null ? row.records : 1,
    contents: row.contents != null ? row.contents : 1,
    bosses: row.bosses != null ? row.bosses : 1,
  }
}

function initWorkbook() {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['goal_amount', 'current_amount'], [0, 0]]), 'Goal')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['id', 'type', 'amount', 'description', 'date', 'created_at']]), 'Records')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['id', 'name', 'cost', 'category']]), 'Contents')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['id', 'name', 'reward_amount', 'checked', 'checked_at']]), 'Bosses')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['records', 'contents', 'bosses'], [1, 1, 1]]), 'Meta')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['meso_per_run', 'sol_erda_count', 'sol_erda_price', 'material_run_count'], [0, 0, 0, 0]]), 'Material')
  return wb
}

function loadOrCreateWorkbook() {
  let wb = loadWorkbook()
  if (!wb) {
    wb = initWorkbook()
    ensureDir(getDataPath())
    XLSX.writeFile(wb, getDataPath())
  } else if (!wb.Sheets['Material']) {
    wb.Sheets['Material'] = XLSX.utils.aoa_to_sheet([['meso_per_run', 'sol_erda_count', 'sol_erda_price', 'material_run_count'], [0, 0, 0, 0]])
    saveWorkbook(wb)
  }
  return wb
}

function sheetToArray(ws) {
  if (!ws) return []
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
  if (rows.length < 2) return []
  const headers = rows[0]
  return rows.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => { if (h != null) obj[h] = row[i] })
    return obj
  })
}

function rowToRecord(row) {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    description: row.description || '',
    date: row.date,
    created_at: row.created_at,
  }
}

function rowToContent(row) {
  return {
    id: row.id,
    name: row.name,
    cost: row.cost,
    category: row.category,
  }
}

function rowToBoss(row) {
  return {
    id: row.id,
    name: row.name,
    reward_amount: row.reward_amount || 0,
    checked: !!row.checked,
    checked_at: row.checked_at || null,
  }
}

function saveWorkbook(wb) {
  ensureDir(getDataPath())
  XLSX.writeFile(wb, getDataPath())
}

// ---------- IPC Handlers (API 호환) ----------

ipcMain.handle('getGoalBalance', () => {
  const wb = loadOrCreateWorkbook()
  const ws = wb.Sheets['Goal']
  const rows = ws ? XLSX.utils.sheet_to_json(ws, { header: 1 }) : []
  const goal = rows[1] ? rows[1][0] : 0
  const current = rows[1] ? rows[1][1] : 0
  const ratio = goal > 0 ? Math.round((current / goal) * 1000) / 10 : 0
  return { goal_amount: goal, current_amount: current, ratio_percent: ratio }
})

ipcMain.handle('updateGoalBalance', (_, body) => {
  const wb = loadOrCreateWorkbook()
  const ws = wb.Sheets['Goal']
  const rows = ws ? XLSX.utils.sheet_to_json(ws, { header: 1 }) : [[0, 0], [0, 0]]
  if (rows.length < 2) rows.push([0, 0])
  if (body.goal_amount != null) rows[1][0] = body.goal_amount
  if (body.current_amount != null) rows[1][1] = body.current_amount
  wb.Sheets['Goal'] = XLSX.utils.aoa_to_sheet(rows)
  saveWorkbook(wb)
  return { goal_amount: rows[1][0], current_amount: rows[1][1], ratio_percent: rows[1][0] > 0 ? Math.round((rows[1][1] / rows[1][0]) * 1000) / 10 : 0 }
})

ipcMain.handle('getMaterialSettings', () => {
  const wb = loadOrCreateWorkbook()
  const ws = wb.Sheets['Material']
  const rows = ws ? XLSX.utils.sheet_to_json(ws, { header: 1 }) : []
  const row = rows[1] || [0, 0, 0, 0]
  return {
    meso_per_run: row[0] != null ? Number(row[0]) : 0,
    sol_erda_count: row[1] != null ? Number(row[1]) : 0,
    sol_erda_price: row[2] != null ? Number(row[2]) : 0,
    material_run_count: row[3] != null ? Number(row[3]) : 0,
  }
})

ipcMain.handle('updateMaterialSettings', (_, body) => {
  const wb = loadOrCreateWorkbook()
  const ws = wb.Sheets['Material']
  const rows = ws ? XLSX.utils.sheet_to_json(ws, { header: 1 }) : [['meso_per_run', 'sol_erda_count', 'sol_erda_price', 'material_run_count'], [0, 0, 0, 0]]
  if (rows.length < 2) rows.push([0, 0, 0, 0])
  const r = rows[1]
  if (body.meso_per_run != null) r[0] = body.meso_per_run
  if (body.sol_erda_count != null) r[1] = body.sol_erda_count
  if (body.sol_erda_price != null) r[2] = body.sol_erda_price
  if (body.material_run_count != null) r[3] = body.material_run_count
  wb.Sheets['Material'] = XLSX.utils.aoa_to_sheet(rows)
  saveWorkbook(wb)
  return { meso_per_run: r[0], sol_erda_count: r[1], sol_erda_price: r[2], material_run_count: r[3] }
})

function getRecordsFromSheet(wb, monthFilter) {
  const arr = sheetToArray(wb.Sheets['Records'])
  let list = arr.map(r => rowToRecord(r))
  if (monthFilter) {
    const [y, m] = monthFilter.split('-').map(Number)
    list = list.filter(r => {
      const d = (r.date || '').slice(0, 7)
      const [ry, rm] = d.split('-').map(Number)
      return ry === y && rm === m
    })
  }
  return list.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.id - a.id)
}

ipcMain.handle('getRecords', (_, month) => {
  const wb = loadOrCreateWorkbook()
  const records = getRecordsFromSheet(wb, month || null)
  return { records }
})

ipcMain.handle('createRecord', (_, body) => {
  const wb = loadOrCreateWorkbook()
  const ids = getNextIds(wb)
  const rid = ids.records++
  const date = body.date || new Date().toISOString().slice(0, 10)
  const record = {
    id: rid,
    type: body.type,
    amount: body.amount,
    description: body.description || '',
    date,
    created_at: new Date().toISOString(),
  }
  const arr = sheetToArray(wb.Sheets['Records'])
  arr.push(record)
  wb.Sheets['Records'] = XLSX.utils.json_to_sheet(arr)
  if (body.type === 'income') {
    const goalWs = wb.Sheets['Goal']
    const rows = XLSX.utils.sheet_to_json(goalWs, { header: 1 })
    if (rows[1]) rows[1][1] = (rows[1][1] || 0) + body.amount
    wb.Sheets['Goal'] = XLSX.utils.aoa_to_sheet(rows)
  } else {
    const goalWs = wb.Sheets['Goal']
    const rows = XLSX.utils.sheet_to_json(goalWs, { header: 1 })
    if (rows[1]) rows[1][1] = (rows[1][1] || 0) - body.amount
    wb.Sheets['Goal'] = XLSX.utils.aoa_to_sheet(rows)
  }
  const metaRows = [[ids.records, ids.contents, ids.bosses]]
  wb.Sheets['Meta'] = XLSX.utils.aoa_to_sheet([['records', 'contents', 'bosses'], metaRows[0]])
  saveWorkbook(wb)
  return record
})

ipcMain.handle('deleteRecord', (_, recordId) => {
  const wb = loadOrCreateWorkbook()
  const arr = sheetToArray(wb.Sheets['Records'])
  const idx = arr.findIndex(r => r.id === recordId)
  if (idx === -1) throw new Error('Record not found')
  const rec = arr.splice(idx, 1)[0]
  if (rec.type === 'income') {
    const goalWs = wb.Sheets['Goal']
    const rows = XLSX.utils.sheet_to_json(goalWs, { header: 1 })
    if (rows[1]) rows[1][1] = (rows[1][1] || 0) - rec.amount
    wb.Sheets['Goal'] = XLSX.utils.aoa_to_sheet(rows)
  } else {
    const goalWs = wb.Sheets['Goal']
    const rows = XLSX.utils.sheet_to_json(goalWs, { header: 1 })
    if (rows[1]) rows[1][1] = (rows[1][1] || 0) + rec.amount
    wb.Sheets['Goal'] = XLSX.utils.aoa_to_sheet(rows)
  }
  wb.Sheets['Records'] = XLSX.utils.json_to_sheet(arr)
  saveWorkbook(wb)
  return { deleted: recordId }
})

ipcMain.handle('getContents', () => {
  const wb = loadOrCreateWorkbook()
  const arr = sheetToArray(wb.Sheets['Contents'])
  return { contents: arr.map(rowToContent) }
})

ipcMain.handle('createContent', (_, body) => {
  const wb = loadOrCreateWorkbook()
  const ids = getNextIds(wb)
  const cid = ids.contents++
  const content = { id: cid, name: body.name, cost: body.cost, category: body.category || null }
  const arr = sheetToArray(wb.Sheets['Contents'])
  arr.push(content)
  wb.Sheets['Contents'] = XLSX.utils.json_to_sheet(arr)
  const metaRows = [[ids.records, ids.contents, ids.bosses]]
  wb.Sheets['Meta'] = XLSX.utils.aoa_to_sheet([['records', 'contents', 'bosses'], metaRows[0]])
  saveWorkbook(wb)
  return content
})

ipcMain.handle('spendContent', (_, body) => {
  const wb = loadOrCreateWorkbook()
  const arr = sheetToArray(wb.Sheets['Contents'])
  const content = arr.find(c => c.id === body.content_id)
  if (!content) throw new Error('Content not found')
  const ids = getNextIds(wb)
  const rid = ids.records++
  const date = new Date().toISOString().slice(0, 10)
  const record = {
    id: rid,
    type: 'expense',
    amount: content.cost,
    description: `[메포] ${content.name}`,
    date,
    created_at: new Date().toISOString(),
    content_id: content.id,
  }
  const recArr = sheetToArray(wb.Sheets['Records'])
  recArr.push(record)
  wb.Sheets['Records'] = XLSX.utils.json_to_sheet(recArr)
  const goalWs = wb.Sheets['Goal']
  const rows = XLSX.utils.sheet_to_json(goalWs, { header: 1 })
  if (rows[1]) rows[1][1] = (rows[1][1] || 0) - content.cost
  wb.Sheets['Goal'] = XLSX.utils.aoa_to_sheet(rows)
  const metaRows = [[ids.records, ids.contents, ids.bosses]]
  wb.Sheets['Meta'] = XLSX.utils.aoa_to_sheet([['records', 'contents', 'bosses'], metaRows[0]])
  saveWorkbook(wb)
  return { record, content: rowToContent(content) }
})

ipcMain.handle('getBosses', () => {
  const wb = loadOrCreateWorkbook()
  const arr = sheetToArray(wb.Sheets['Bosses'])
  return { bosses: arr.map(rowToBoss) }
})

ipcMain.handle('createBoss', (_, body) => {
  const wb = loadOrCreateWorkbook()
  const ids = getNextIds(wb)
  const bid = ids.bosses++
  const boss = { id: bid, name: body.name, reward_amount: body.reward_amount || 0, checked: false, checked_at: null }
  const arr = sheetToArray(wb.Sheets['Bosses'])
  arr.push(boss)
  wb.Sheets['Bosses'] = XLSX.utils.json_to_sheet(arr)
  const metaRows = [[ids.records, ids.contents, ids.bosses]]
  wb.Sheets['Meta'] = XLSX.utils.aoa_to_sheet([['records', 'contents', 'bosses'], metaRows[0]])
  saveWorkbook(wb)
  return boss
})

ipcMain.handle('checkBoss', (_, body) => {
  const wb = loadOrCreateWorkbook()
  const arr = sheetToArray(wb.Sheets['Bosses'])
  const boss = arr.find(b => b.id === body.boss_id)
  if (!boss) throw new Error('Boss not found')
  if (boss.checked) throw new Error('Already checked')
  const amount = body.reward_amount != null ? body.reward_amount : boss.reward_amount
  boss.checked = true
  boss.checked_at = new Date().toISOString()
  const ids = getNextIds(wb)
  const rid = ids.records++
  const date = new Date().toISOString().slice(0, 10)
  const record = {
    id: rid,
    type: 'income',
    amount,
    description: `[보스] ${boss.name}`,
    date,
    created_at: new Date().toISOString(),
    boss_id: boss.id,
  }
  const recArr = sheetToArray(wb.Sheets['Records'])
  recArr.push(record)
  wb.Sheets['Records'] = XLSX.utils.json_to_sheet(recArr)
  const goalWs = wb.Sheets['Goal']
  const goalRows = XLSX.utils.sheet_to_json(goalWs, { header: 1 })
  if (goalRows[1]) goalRows[1][1] = (goalRows[1][1] || 0) + amount
  wb.Sheets['Goal'] = XLSX.utils.aoa_to_sheet(goalRows)
  wb.Sheets['Bosses'] = XLSX.utils.json_to_sheet(arr)
  const metaRows = [[ids.records, ids.contents, ids.bosses]]
  wb.Sheets['Meta'] = XLSX.utils.aoa_to_sheet([['records', 'contents', 'bosses'], metaRows[0]])
  saveWorkbook(wb)
  return { boss: rowToBoss(boss), record }
})

ipcMain.handle('resetBosses', () => {
  const wb = loadOrCreateWorkbook()
  const arr = sheetToArray(wb.Sheets['Bosses'])
  arr.forEach(b => { b.checked = false; b.checked_at = null })
  wb.Sheets['Bosses'] = XLSX.utils.json_to_sheet(arr)
  saveWorkbook(wb)
  return { bosses: arr.map(rowToBoss) }
})

ipcMain.handle('deleteBoss', (_, bossId) => {
  const wb = loadOrCreateWorkbook()
  const arr = sheetToArray(wb.Sheets['Bosses'])
  const idx = arr.findIndex(b => b.id === bossId)
  if (idx === -1) throw new Error('Boss not found')
  arr.splice(idx, 1)
  wb.Sheets['Bosses'] = XLSX.utils.json_to_sheet(arr)
  saveWorkbook(wb)
  return { ok: true }
})

ipcMain.handle('reorderBosses', (_, body) => {
  const orderedIds = body.ordered_ids
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return { ok: true }
  const wb = loadOrCreateWorkbook()
  const arr = sheetToArray(wb.Sheets['Bosses'])
  const byId = new Map(arr.map(b => [b.id, b]))
  const reordered = orderedIds.map(id => byId.get(id)).filter(Boolean)
  if (reordered.length !== arr.length) throw new Error('Invalid reorder')
  wb.Sheets['Bosses'] = XLSX.utils.json_to_sheet(reordered)
  saveWorkbook(wb)
  return { ok: true }
})

ipcMain.handle('recordAhmae', (_, body) => {
  const wb = loadOrCreateWorkbook()
  const ids = getNextIds(wb)
  const rid = ids.records++
  const date = new Date().toISOString().slice(0, 10)
  const record = {
    id: rid,
    type: 'income',
    amount: body.amount,
    description: body.description || '[아매획] 수익',
    date,
    created_at: new Date().toISOString(),
    source: 'ahmae',
  }
  const recArr = sheetToArray(wb.Sheets['Records'])
  recArr.push(record)
  wb.Sheets['Records'] = XLSX.utils.json_to_sheet(recArr)
  const goalWs = wb.Sheets['Goal']
  const rows = XLSX.utils.sheet_to_json(goalWs, { header: 1 })
  if (rows[1]) rows[1][1] = (rows[1][1] || 0) + body.amount
  wb.Sheets['Goal'] = XLSX.utils.aoa_to_sheet(rows)
  const metaRows = [[ids.records, ids.contents, ids.bosses]]
  wb.Sheets['Meta'] = XLSX.utils.aoa_to_sheet([['records', 'contents', 'bosses'], metaRows[0]])
  saveWorkbook(wb)
  return record
})

ipcMain.handle('getDataPath', () => getDataPath())

// ---------- 창 생성 ----------

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: '메이플 TODO',
  })

  // 개발 모드: Vite 서버(localhost:3000) 연결 → 핫 리로드
  if (process.env.ELECTRON_DEV === '1') {
    win.loadURL('http://localhost:3000')
    win.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html')
    if (require('fs').existsSync(indexPath)) {
      win.loadFile(indexPath)
    } else {
      win.loadURL('http://localhost:3000')
    }
    win.webContents.on('did-fail-load', () => {
      win.loadURL('http://localhost:3000')
    })
  }
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())
