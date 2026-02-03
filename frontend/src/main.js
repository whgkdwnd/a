const API = '/api'

function formatMeso(n) {
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '억'
  if (n >= 1e4) return (n / 1e4).toFixed(0) + '만'
  return String(n)
}

async function api(method, path, body) {
  const opts = { method, headers: {} }
  if (body) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(API + path, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || res.statusText)
  }
  return res.json()
}

const state = {
  goalBalance: { goal_amount: 0, current_amount: 0, ratio_percent: 0 },
  records: [],
  contents: [],
  bosses: [],
  currentMonth: new Date().toISOString().slice(0, 7),
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

function renderSummary() {
  const g = state.goalBalance
  const monthRecords = state.records
  const income = monthRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const expense = monthRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)

  document.getElementById('summary-current').textContent = formatMeso(g.current_amount)
  document.getElementById('summary-goal').textContent = formatMeso(g.goal_amount)
  document.getElementById('summary-ratio').textContent = g.ratio_percent + '%'
  document.getElementById('summary-month-income').textContent = formatMeso(income)
  document.getElementById('summary-month-expense').textContent = formatMeso(expense)
}

function renderDonut() {
  const ratio = Math.min(100, state.goalBalance.ratio_percent || 0)
  const deg = (ratio / 100) * 360
  const el = document.getElementById('donut-chart')
  if (el) {
    el.style.setProperty('--donut-deg', deg + 'deg')
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
  if (state.bosses.length === 0) {
    list.innerHTML = '<li class="empty-msg">등록된 보스가 없습니다. + 보스 추가에서 등록하세요.</li>'
    return
  }
  list.innerHTML = state.bosses.map(b => `
    <li class="boss-item ${b.checked ? 'checked' : ''}" data-id="${b.id}">
      <div>
        <div class="boss-name">${escapeHtml(b.name)}</div>
        <div class="boss-reward">보상 ${formatMeso(b.reward_amount)}</div>
      </div>
      <button type="button" class="btn-check" data-id="${b.id}" ${b.checked ? 'disabled' : ''}>
        ${b.checked ? '완료' : '체크'}
      </button>
    </li>
  `).join('')
  list.querySelectorAll('.btn-check:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => checkBoss(Number(btn.dataset.id)))
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
  renderSummary()
  renderDonut()
  renderBarChart()
  renderContentList('content-list')
  renderContentList('content-list-page', true)
  renderRecordList('record-list')
  renderRecordList('record-list-page')
  renderBossList()
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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await refreshDashboard()
  } catch (e) {
    console.error(e)
    document.body.insertAdjacentHTML('beforeend', '<div style="position:fixed;bottom:1rem;right:1rem;background:#dc2626;color:white;padding:0.75rem 1rem;border-radius:8px;">백엔드 연결 실패. localhost:8000 확인하세요.</div>')
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

  document.getElementById('quick-ahmae-amount').value = ''
  document.getElementById('quick-ahmae-desc').value = ''
  document.getElementById('btn-quick-ahmae')?.addEventListener('click', async () => {
    const amount = Number(document.getElementById('quick-ahmae-amount').value)
    const desc = document.getElementById('quick-ahmae-desc').value.trim()
    if (!amount || amount < 0) return
    try {
      await api('POST', '/ahmae', { amount, description: desc || '[아매획] 수익' })
      document.getElementById('quick-ahmae-amount').value = ''
      document.getElementById('quick-ahmae-desc').value = ''
      await refreshDashboard()
    } catch (err) {
      alert(err.message)
    }
  })

  document.getElementById('btn-ahmae')?.addEventListener('click', () => {
    document.getElementById('quick-ahmae-amount').focus()
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

  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', () => modal(false))
  })
})
