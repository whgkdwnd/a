function formatMeso(n) {
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '억'
  if (n >= 1e4) return (n / 1e4).toFixed(0) + '만'
  return String(n)
}

/** Electron IPC로 엑셀 데이터 읽기/쓰기 */
async function api(method, path, body) {
  const electron = typeof window !== 'undefined' && window.electronAPI
  if (!electron) throw new Error('이 앱은 데스크톱 프로그램으로만 실행할 수 있습니다. (Electron)')
  try {
    if (method === 'GET' && path === '/goal-balance') return await electron.getGoalBalance()
    if (method === 'PUT' && path === '/goal-balance') return await electron.updateGoalBalance(body)
    if (method === 'GET' && path === '/material-settings') return await electron.getMaterialSettings()
    if (method === 'PUT' && path === '/material-settings') return await electron.updateMaterialSettings(body)
    if (method === 'GET' && path.startsWith('/records')) {
      const q = path.includes('?') ? path.split('?')[1] : ''
      const month = q ? new URLSearchParams(q).get('month') : null
      return await electron.getRecords(month || null)
    }
    if (method === 'POST' && path === '/records') return await electron.createRecord(body)
    if (method === 'DELETE' && path.startsWith('/records/')) {
      const id = Number(path.replace(/^\/records\//, ''))
      return await electron.deleteRecord(id)
    }
    if (method === 'GET' && path === '/contents') return await electron.getContents()
    if (method === 'POST' && path === '/contents') return await electron.createContent(body)
    if (method === 'POST' && path === '/contents/spend') return await electron.spendContent(body)
    if (method === 'GET' && path === '/bosses') return await electron.getBosses()
    if (method === 'POST' && path === '/bosses') return await electron.createBoss(body)
    if (method === 'DELETE' && path.startsWith('/bosses/')) {
      const id = Number(path.replace(/^\/bosses\//, ''))
      return await electron.deleteBoss(id)
    }
    if (method === 'PUT' && path === '/bosses/reorder') return await electron.reorderBosses(body)
    if (method === 'POST' && path === '/bosses/check') return await electron.checkBoss(body)
    if (method === 'POST' && path === '/bosses/reset') return await electron.resetBosses()
    if (method === 'POST' && path === '/ahmae') return await electron.recordAhmae(body)
  } catch (e) {
    throw new Error(e.message || '요청 실패')
  }
  throw new Error('Unknown API: ' + method + ' ' + path)
}

const state = {
  goalBalance: { goal_amount: 0, current_amount: 0, ratio_percent: 0 },
  records: [],
  contents: [],
  bosses: [],
  currentMonth: new Date().toISOString().slice(0, 7),
  bossEditMode: false,
  materialSettings: { meso_per_run: 0, sol_erda_count: 0, sol_erda_price: 0, material_run_count: 0 },
}

function getMonth() {
  return state.currentMonth
}

async function loadGoalBalance() {
  state.goalBalance = await api('GET', '/goal-balance')
  return state.goalBalance
}

async function loadRecords(month) {
  const q = month ? `?month=${month}` : ''
  const data = await api('GET', '/records' + q)
  state.records = data.records || []
  return state.records
}

async function loadContents() {
  const data = await api('GET', '/contents')
  state.contents = data.contents || []
  return state.contents
}

async function loadBosses() {
  const data = await api('GET', '/bosses')
  state.bosses = data.bosses || []
  return state.bosses
}

async function loadMaterialSettings() {
  state.materialSettings = await api('GET', '/material-settings')
  return state.materialSettings
}

function renderSummary() {
  const g = state.goalBalance
  const monthRecords = state.records
  let income = monthRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const expense = monthRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)

  const m = state.materialSettings
  const materialIncome = (Number(m.meso_per_run) + Number(m.sol_erda_count) * Number(m.sol_erda_price)) * Number(m.material_run_count)
  income += materialIncome

  document.getElementById('summary-current').textContent = formatMeso(g.current_amount)
  document.getElementById('summary-goal').textContent = formatMeso(g.goal_amount)
  document.getElementById('summary-ratio').textContent = g.ratio_percent + '%'
  document.getElementById('summary-month-income').textContent = formatMeso(income)
  document.getElementById('summary-month-expense').textContent = formatMeso(expense)
}

function renderMaterialCounter() {
  const el = document.getElementById('material-counter-value')
  if (el) el.textContent = state.materialSettings.material_run_count
}

function renderDonut() {
  const g = state.goalBalance
  const ratio = Math.min(100, g.ratio_percent || 0)
  const deg = (ratio / 100) * 360
  const el = document.getElementById('donut-chart')
  if (el) {
    el.style.setProperty('--donut-deg', deg + 'deg')
    el.setAttribute('title', `목표: ${formatMeso(g.goal_amount)}\n보유: ${formatMeso(g.current_amount)}`)
  }
  const valEl = document.getElementById('donut-value')
  if (valEl) valEl.textContent = ratio + '%'
}

function renderBarChart() {
  const wrap = document.getElementById('bar-chart-wrap')
  if (!wrap) return
  const days = 7
  const labels = ['일', '월', '화', '수', '목', '금', '토']
  const byDay = Array(days).fill(0).map(() => ({ income: 0, expense: 0, records: [] }))
  const now = new Date()

  state.records.forEach(r => {
    const d = r.date ? new Date(r.date) : new Date(r.created_at)
    if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return
    const dayIdx = d.getDay()
    if (r.type === 'income') byDay[dayIdx].income += r.amount
    else byDay[dayIdx].expense += r.amount
    byDay[dayIdx].records.push(r)
  })

  let max = 1
  byDay.forEach(({ income, expense }) => {
    if (income + expense > max) max = income + expense
  })

  wrap.innerHTML = labels.map((label, i) => {
    const { income, expense } = byDay[i]
    const total = income + expense
    const totalH = max ? (total / max) * 100 : 0
    const incomeRatio = total ? (income / total) * 100 : 0
    const expenseRatio = total ? (expense / total) * 100 : 0
    return `
      <div class="bar-group" data-day-index="${i}" data-day-label="${label}">
        <span class="bar-label">${label}</span>
        <div class="bar-wrap" style="align-items: stretch;">
          <div class="bar-stack" style="height: ${totalH}%; flex-direction: column;">
            <div class="bar-fill income" style="height: ${incomeRatio}%"></div>
            <div class="bar-fill expense" style="height: ${expenseRatio}%"></div>
          </div>
        </div>
      </div>
    `
  }).join('')

  // 툴팁용 요소 (한 번만 생성)
  let tooltipEl = document.getElementById('bar-chart-tooltip')
  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.id = 'bar-chart-tooltip'
    tooltipEl.className = 'bar-chart-tooltip'
    document.body.appendChild(tooltipEl)
  }

  function showTooltip(barGroup, byDayData) {
    const label = barGroup.dataset.dayLabel
    const records = byDayData.records || []
    const incomeTotal = byDayData.income || 0
    const expenseTotal = byDayData.expense || 0

    let html = `<div class="bar-tooltip-title">${label}요일</div>`
    if (records.length === 0) {
      html += '<div class="bar-tooltip-empty">내역 없음</div>'
    } else {
      records.forEach(r => {
        const typeLabel = r.type === 'income' ? '수입' : '지출'
        const desc = escapeHtml((r.description || '').trim()) || '-'
        html += `<div class="bar-tooltip-row ${r.type}"><span class="bar-tooltip-type">${typeLabel}</span> <span class="bar-tooltip-amount">${formatMeso(r.amount)}</span> ${desc}</div>`
      })
      html += `<div class="bar-tooltip-summary"><span class="income">수입 ${formatMeso(incomeTotal)}</span> / <span class="expense">지출 ${formatMeso(expenseTotal)}</span></div>`
    }
    tooltipEl.innerHTML = html
    tooltipEl.classList.add('visible')

    const rect = barGroup.getBoundingClientRect()
    const tooltipRect = tooltipEl.getBoundingClientRect()
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2
    let top = rect.top - tooltipRect.height - 8
    if (top < 8) top = rect.bottom + 8
    if (left < 8) left = 8
    if (left + tooltipRect.width > window.innerWidth - 8) left = window.innerWidth - tooltipRect.width - 8
    tooltipEl.style.left = left + 'px'
    tooltipEl.style.top = top + 'px'
  }

  function hideTooltip() {
    tooltipEl.classList.remove('visible')
  }

  wrap.querySelectorAll('.bar-group').forEach((barGroup, i) => {
    const barData = byDay[i]
    barGroup.addEventListener('mouseenter', () => showTooltip(barGroup, barData))
    barGroup.addEventListener('mouseleave', hideTooltip)
  })
}

function renderContentList(containerId, full = false) {
  const list = document.getElementById(containerId)
  if (!list) return
  const items = state.contents
  if (items.length === 0) {
    list.innerHTML = '<li class="empty-msg">등록된 메포 컨텐츠가 없습니다. + 추가에서 등록하세요.</li>'
    return
  }
  list.innerHTML = items.map(c => `
    <li class="${full ? 'content-card' : 'content-item'}">
      <span class="name">${escapeHtml(c.name)}</span>
      <span class="cost">${formatMeso(c.cost)} 메소</span>
      <button type="button" class="btn-spend" data-id="${c.id}">딸깍 지출</button>
    </li>
  `).join('')
  list.querySelectorAll('.btn-spend').forEach(btn => {
    btn.addEventListener('click', () => spendContent(Number(btn.dataset.id)))
  })
}

function renderRecordList(containerId) {
  const list = document.getElementById(containerId)
  if (!list) return
  const items = state.records.slice(0, containerId === 'record-list-page' ? 999 : 10)
  if (items.length === 0) {
    list.innerHTML = '<li class="empty-msg">이번달 기록이 없습니다.</li>'
    return
  }
  list.innerHTML = items.map(r => `
    <li class="record-item">
      <span>
        <span class="type ${r.type}">${r.type === 'income' ? '수입' : '지출'}</span>
        <span class="amount">${formatMeso(r.amount)}</span>
        <span class="desc">${escapeHtml(r.description || '')}</span>
      </span>
      <span>
        <span class="date">${(r.date || '').slice(0, 10)}</span>
        ${containerId === 'record-list-page' ? `<button type="button" class="btn-delete" data-id="${r.id}">삭제</button>` : ''}
      </span>
    </li>
  `).join('')
  if (containerId === 'record-list-page') {
    list.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteRecord(Number(btn.dataset.id)))
    })
  }
}

function renderBossList() {
  const list = document.getElementById('boss-list')
  if (!list) return
  const editMode = state.bossEditMode
  const editBtn = document.getElementById('btn-boss-edit-mode')
  if (editBtn) editBtn.textContent = editMode ? '편집 완료' : '편집모드'

  if (state.bosses.length === 0) {
    list.innerHTML = '<li class="empty-msg">등록된 보스가 없습니다. + 보스 추가에서 등록하세요.</li>'
    return
  }
  list.innerHTML = state.bosses.map((b, index) => {
    const isFirst = index === 0
    const isLast = index === state.bosses.length - 1
    return `
    <li class="boss-item ${b.checked ? 'checked' : ''} ${editMode ? 'edit-mode' : ''}" data-id="${b.id}" data-index="${index}">
      ${editMode ? `
      <div class="boss-reorder">
        <button type="button" class="btn-reorder btn-reorder-up" data-id="${b.id}" ${isFirst ? 'disabled' : ''} title="위로">↑</button>
        <button type="button" class="btn-reorder btn-reorder-down" data-id="${b.id}" ${isLast ? 'disabled' : ''} title="아래로">↓</button>
      </div>
      ` : ''}
      <div>
        <div class="boss-name">${escapeHtml(b.name)}</div>
        <div class="boss-reward">보상 ${formatMeso(b.reward_amount)}</div>
      </div>
      <div class="boss-item-actions">
        ${editMode
          ? `<button type="button" class="btn btn-outline btn-sm btn-delete-boss" data-id="${b.id}" title="삭제">삭제</button>`
          : `
        <button type="button" class="btn-check" data-id="${b.id}" ${b.checked ? 'disabled' : ''}>
          ${b.checked ? '완료' : '체크'}
        </button>
        `}
      </div>
    </li>
  `}).join('')

}

function setupBossListDelegation() {
  const list = document.getElementById('boss-list')
  if (!list) return
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]')
    if (!btn) return
    const id = Number(btn.dataset.id)
    if (Number.isNaN(id)) return
    if (btn.classList.contains('btn-check') && !btn.disabled) {
      e.preventDefault()
      checkBoss(id)
      return
    }
    if (btn.classList.contains('btn-delete-boss')) {
      e.preventDefault()
      deleteBoss(id)
      return
    }
    if (btn.classList.contains('btn-reorder-up') && !btn.disabled) {
      e.preventDefault()
      moveBoss(id, -1)
      return
    }
    if (btn.classList.contains('btn-reorder-down') && !btn.disabled) {
      e.preventDefault()
      moveBoss(id, 1)
      return
    }
  })
}

function escapeHtml(s) {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

async function refreshDashboard() {
  await loadGoalBalance()
  await loadRecords()
  await loadContents()
  await loadBosses()
  await loadMaterialSettings()
  renderSummary()
  renderDonut()
  renderBarChart()
  renderContentList('content-list')
  renderContentList('content-list-page', true)
  renderRecordList('record-list')
  renderRecordList('record-list-page')
  renderBossList()
  renderMaterialCounter()
  const badge = document.getElementById('records-badge')
  if (badge) badge.textContent = state.records.length + '+'
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  const page = document.getElementById('page-' + id)
  if (page) page.classList.add('active')
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
  const nav = document.querySelector(`.nav-item[data-page="${id}"]`)
  if (nav) nav.classList.add('active')
}

function modal(open, title, bodyHtml) {
  const m = document.getElementById('modal')
  if (!m) return
  m.setAttribute('aria-hidden', !open)
  if (title) {
    const t = document.getElementById('modal-title')
    if (t) t.textContent = title
  }
  if (bodyHtml !== undefined) {
    const b = document.getElementById('modal-body')
    if (b) b.innerHTML = bodyHtml
  }
}

async function spendContent(contentId) {
  try {
    await api('POST', '/contents/spend', { content_id: contentId })
    await refreshDashboard()
  } catch (e) {
    alert(e.message)
  }
}

async function deleteRecord(id) {
  try {
    await api('DELETE', `/records/${id}`)
    await loadRecords()
    await loadGoalBalance()
    renderSummary()
    renderDonut()
    renderBarChart()
    renderRecordList('record-list')
    renderRecordList('record-list-page')
    const badge = document.getElementById('records-badge')
    if (badge) badge.textContent = state.records.length + '+'
  } catch (e) {
    alert(e.message)
  }
}

async function checkBoss(bossId) {
  try {
    await api('POST', '/bosses/check', { boss_id: bossId })
    await refreshDashboard()
  } catch (e) {
    alert(e.message)
  }
}

async function deleteBoss(bossId) {
  if (!confirm('이 보스를 삭제할까요?')) return
  try {
    await api('DELETE', `/bosses/${bossId}`)
    await refreshDashboard()
  } catch (e) {
    alert(e.message)
  }
}

async function moveBoss(bossId, delta) {
  const idx = state.bosses.findIndex(b => b.id === bossId)
  if (idx === -1) return
  const newIdx = idx + delta
  if (newIdx < 0 || newIdx >= state.bosses.length) return
  const reordered = [...state.bosses]
  const [item] = reordered.splice(idx, 1)
  reordered.splice(newIdx, 0, item)
  const orderedIds = reordered.map(b => b.id)
  try {
    await api('PUT', '/bosses/reorder', { ordered_ids: orderedIds })
    state.bosses = reordered
    renderBossList()
  } catch (e) {
    alert(e.message)
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  setupBossListDelegation()

  try {
    await refreshDashboard()
  } catch (e) {
    console.error(e)
    document.body.insertAdjacentHTML('beforeend', '<div style="position:fixed;bottom:1rem;right:1rem;background:#dc2626;color:white;padding:0.75rem 1rem;border-radius:8px;">데이터 로드 실패. ' + (e.message || '') + '</div>')
  }

  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault()
      showPage(item.dataset.page)
      if (item.dataset.page === 'records') {
        loadRecords().then(() => renderRecordList('record-list-page'))
      }
      if (item.dataset.page === 'contents') {
        loadContents().then(() => renderContentList('content-list-page', true))
      }
      if (item.dataset.page === 'bosses') {
        loadBosses().then(() => renderBossList())
      }
      if (item.dataset.page === 'settings') {
        document.getElementById('settings-goal').value = state.goalBalance.goal_amount || ''
        document.getElementById('settings-current').value = state.goalBalance.current_amount || ''
        const m = state.materialSettings
        document.getElementById('settings-meso-per-run').value = m.meso_per_run ?? ''
        document.getElementById('settings-sol-erda').value = m.sol_erda_count ?? ''
        document.getElementById('settings-sol-erda-price').value = m.sol_erda_price ?? ''
      }
    })
  })

  document.getElementById('record-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const type = document.getElementById('record-type').value
    const amount = Number(document.getElementById('record-amount').value)
    const desc = document.getElementById('record-desc').value.trim()
    if (!amount || amount < 0) return
    try {
      await api('POST', '/records', { type, amount, description: desc })
      document.getElementById('record-amount').value = ''
      document.getElementById('record-desc').value = ''
      await refreshDashboard()
    } catch (err) {
      alert(err.message)
    }
  })

  document.getElementById('btn-add-record')?.addEventListener('click', () => {
    showPage('records')
  })

  document.getElementById('quick-ahmae-amount') && (document.getElementById('quick-ahmae-amount').value = '')
  document.getElementById('quick-ahmae-desc') && (document.getElementById('quick-ahmae-desc').value = '')
  document.getElementById('btn-quick-ahmae')?.addEventListener('click', async () => {
    const amount = Number(document.getElementById('quick-ahmae-amount')?.value)
    const desc = (document.getElementById('quick-ahmae-desc')?.value || '').trim()
    if (!amount || amount < 0) return
    try {
      await api('POST', '/ahmae', { amount, description: desc || '[아매획] 수익' })
      document.getElementById('quick-ahmae-amount') && (document.getElementById('quick-ahmae-amount').value = '')
      document.getElementById('quick-ahmae-desc') && (document.getElementById('quick-ahmae-desc').value = '')
      await refreshDashboard()
    } catch (err) {
      alert(err.message)
    }
  })

  document.getElementById('btn-material-plus')?.addEventListener('click', async () => {
    const next = (state.materialSettings.material_run_count || 0) + 1
    try {
      await api('PUT', '/material-settings', { material_run_count: next })
      state.materialSettings.material_run_count = next
      renderMaterialCounter()
      renderSummary()
    } catch (err) {
      alert(err.message)
    }
  })
  document.getElementById('btn-material-minus')?.addEventListener('click', async () => {
    const current = state.materialSettings.material_run_count || 0
    const next = Math.max(0, current - 1)
    try {
      await api('PUT', '/material-settings', { material_run_count: next })
      state.materialSettings.material_run_count = next
      renderMaterialCounter()
      renderSummary()
    } catch (err) {
      alert(err.message)
    }
  })

  const ahmaeMesoInput = document.getElementById('ahmae-meso-input')
  const submitAhmaeFromHead = async () => {
    const amount = Number(ahmaeMesoInput?.value)
    if (!amount || amount < 0) return
    try {
      await api('POST', '/ahmae', { amount, description: '[아매획] 수익' })
      ahmaeMesoInput.value = ''
      await refreshDashboard()
    } catch (err) {
      alert(err.message)
    }
  }
  document.getElementById('btn-ahmae-submit')?.addEventListener('click', submitAhmaeFromHead)
  ahmaeMesoInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitAhmaeFromHead()
    }
  })

  function openContentModal() {
    modal(true, '메포 컨텐츠 추가', `
      <form id="content-form">
        <div class="form-group">
          <label>이름</label>
          <input type="text" id="content-name" placeholder="예: 주간보스" required />
        </div>
        <div class="form-group">
          <label>비용 (메소)</label>
          <input type="number" id="content-cost" placeholder="500000" min="0" required />
        </div>
        <button type="submit" class="btn btn-primary">추가</button>
      </form>
    `)
    document.getElementById('content-form')?.addEventListener('submit', async (e) => {
      e.preventDefault()
      const name = document.getElementById('content-name').value.trim()
      const cost = Number(document.getElementById('content-cost').value)
      if (!name || cost < 0) return
      try {
        await api('POST', '/contents', { name, cost })
        modal(false)
        await refreshDashboard()
      } catch (err) {
        alert(err.message)
      }
    })
  }

  document.getElementById('btn-add-content')?.addEventListener('click', openContentModal)
  document.getElementById('btn-add-content-page')?.addEventListener('click', openContentModal)

  function openBossModal() {
    modal(true, '보스 추가', `
      <form id="boss-form">
        <div class="form-group">
          <label>보스 이름</label>
          <input type="text" id="boss-name" placeholder="예: 자쿰" required />
        </div>
        <div class="form-group">
          <label>기본 보상 (메소)</label>
          <input type="number" id="boss-reward" placeholder="2000000" min="0" />
        </div>
        <button type="submit" class="btn btn-primary">추가</button>
      </form>
    `)
    document.getElementById('boss-form')?.addEventListener('submit', async (e) => {
      e.preventDefault()
      const name = document.getElementById('boss-name').value.trim()
      const reward_amount = Number(document.getElementById('boss-reward').value) || 0
      if (!name) return
      try {
        await api('POST', '/bosses', { name, reward_amount })
        modal(false)
        await refreshDashboard()
      } catch (err) {
        alert(err.message)
      }
    })
  }

  document.getElementById('btn-add-boss')?.addEventListener('click', openBossModal)

  document.getElementById('btn-boss-edit-mode')?.addEventListener('click', () => {
    state.bossEditMode = !state.bossEditMode
    renderBossList()
  })

  document.getElementById('btn-reset-bosses')?.addEventListener('click', async () => {
    if (!confirm('모든 보스 체크를 초기화할까요?')) return
    try {
      await api('POST', '/bosses/reset')
      await refreshDashboard()
    } catch (err) {
      alert(err.message)
    }
  })

  document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const goal = document.getElementById('settings-goal').value
    const current = document.getElementById('settings-current').value
    const body = {}
    if (goal !== '') body.goal_amount = Number(goal)
    if (current !== '') body.current_amount = Number(current)
    if (Object.keys(body).length === 0) return
    try {
      await api('PUT', '/goal-balance', body)
      await loadGoalBalance()
      renderSummary()
      renderDonut()
    } catch (err) {
      alert(err.message)
    }
  })

  document.getElementById('settings-material-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const mesoPerRun = document.getElementById('settings-meso-per-run').value
    const solErda = document.getElementById('settings-sol-erda').value
    const solErdaPrice = document.getElementById('settings-sol-erda-price').value
    const body = {}
    if (mesoPerRun !== '') body.meso_per_run = Number(mesoPerRun)
    if (solErda !== '') body.sol_erda_count = Number(solErda)
    if (solErdaPrice !== '') body.sol_erda_price = Number(solErdaPrice)
    if (Object.keys(body).length === 0) return
    try {
      await api('PUT', '/material-settings', body)
      await loadMaterialSettings()
      renderSummary()
      renderMaterialCounter()
    } catch (err) {
      alert(err.message)
    }
  })

  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', () => modal(false))
  })
})
