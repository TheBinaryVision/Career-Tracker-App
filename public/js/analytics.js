// ============================================================
//  analytics.js  —  Charts, stats, history
// ============================================================

let allCheckins = [];
let currentPeriod = 7;

async function pageInit(user) {
  // Load all checkins
  const snap = await db.collection('users').doc(user.uid)
    .collection('checkins')
    .orderBy('dateISO', 'desc')
    .limit(365).get();

  allCheckins = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  renderAnalytics(user.uid);
  renderDeviceInfo();
}

function setPeriod(days, btn) {
  document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentPeriod = days;
  auth.onAuthStateChanged(user => { if (user) renderAnalytics(user.uid); });
}

function filterByPeriod(data, days) {
  if (days === 0) return data;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutISO = cutoff.toISOString().split('T')[0];
  return data.filter(d => d.dateISO >= cutISO);
}

async function renderAnalytics(uid) {
  const filtered = filterByPeriod(allCheckins, currentPeriod);

  // KPIs
  const avgHours = filtered.length
    ? (filtered.reduce((a,d) => a + (d.hoursWorked || 0), 0) / filtered.length).toFixed(1)
    : '—';
  const avgEff = filtered.length
    ? (filtered.reduce((a,d) => a + (d.efficiency || 0), 0) / filtered.length).toFixed(1)
    : '—';

  // Total hours
  const totalHrs = filtered.reduce((a,d) => a + (d.hoursWorked || 0), 0);

  // Best streak from user profile
  const profile = (await db.collection('users').doc(uid).get()).data();

  document.getElementById('kpi-avg-hours').textContent    = avgHours === '—' ? '—' : `${avgHours}h`;
  document.getElementById('kpi-avg-efficiency').textContent = avgEff === '—' ? '—' : `${avgEff}/10`;
  document.getElementById('kpi-streak').textContent       = profile?.longestStreak ?? '—';
  document.getElementById('kpi-total-hours').textContent  = `${totalHrs.toFixed(0)}h`;

  // Build sorted (asc) for charts
  const sorted = [...filtered].sort((a,b) => a.dateISO > b.dateISO ? 1 : -1).slice(-14);

  renderBarChart('hours-chart',      sorted, 'hoursWorked',  '#3b82f6', 'h');
  renderBarChart('efficiency-chart', sorted, 'efficiency',   '#10b981', '/10');
  renderBarChart('mood-chart',       sorted, 'mood',         '#f59e0b', '');
  renderToolsBreakdown(filtered);
  renderWeekdayChart(filtered);
  renderCapacityChart(filtered);
  renderHistory(filtered);
}

function renderBarChart(containerId, data, field, color, unit) {
  const el = document.getElementById(containerId);
  if (!data.length) { el.innerHTML = '<div class="empty-state" style="padding:16px">No data yet</div>'; return; }

  const max = Math.max(...data.map(d => d[field] || 0), 1);

  el.innerHTML = `<div class="bar-chart">${data.map(d => {
    const val = d[field] || 0;
    const h   = Math.round((val / max) * 120);
    const label = d.dateISO ? d.dateISO.slice(5) : '';
    return `
      <div class="bar-col">
        <div class="bar-val">${val}${unit}</div>
        <div class="bar-fill" style="height:${h}px;background:${color};width:100%"></div>
        <div class="bar-label">${label}</div>
      </div>`;
  }).join('')}</div>`;
}

function renderToolsBreakdown(data) {
  const counts = {};
  data.forEach(d => {
    (d.tools || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  });

  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,10);
  const el = document.getElementById('tools-breakdown');

  if (!sorted.length) { el.innerHTML = '<div class="empty-state" style="padding:16px">No tool data yet</div>'; return; }
  const max = sorted[0][1];

  el.innerHTML = sorted.map(([tool, count]) => `
    <div class="tool-row">
      <span class="tool-name">${tool}</span>
      <div class="tool-bar-bg">
        <div class="tool-bar-fill" style="width:${Math.round((count/max)*100)}%"></div>
      </div>
      <span class="tool-count">${count}x</span>
    </div>`).join('');
}

function renderWeekdayChart(data) {
  const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const sums  = Array(7).fill(0);
  const counts= Array(7).fill(0);

  data.forEach(d => {
    if (!d.dateISO) return;
    const dow = new Date(d.dateISO).getDay();
    sums[dow]  += d.hoursWorked || 0;
    counts[dow]++;
  });

  const avgs = sums.map((s,i) => counts[i] ? (s/counts[i]).toFixed(1) : 0);
  const max  = Math.max(...avgs, 1);
  const colors = ['#f59e0b','#3b82f6','#3b82f6','#3b82f6','#3b82f6','#8b5cf6','#f59e0b'];

  const el = document.getElementById('weekday-chart');
  el.innerHTML = avgs.map((avg, i) => `
    <div class="weekday-col">
      <div class="bar-val" style="font-size:11px">${avg}h</div>
      <div class="bar-fill" style="height:${Math.round((avg/max)*100)}px;background:${colors[i]};width:100%;border-radius:4px 4px 0 0"></div>
      <div class="bar-label">${days[i]}</div>
    </div>`).join('');
}

function renderCapacityChart(data) {
  const counts = { low:0, medium:0, high:0, peak:0 };
  data.forEach(d => { if (d.capacity) counts[d.capacity]++; });
  const total = data.length || 1;
  const colors = { low:'#ef4444', medium:'#f59e0b', high:'#3b82f6', peak:'#10b981' };
  const labels = { low:'🪫 Low', medium:'⚡ Medium', high:'🚀 High', peak:'🔥 Peak' };

  document.getElementById('capacity-chart').innerHTML =
    Object.entries(counts).map(([key, count]) => `
      <div class="cap-item">
        <div class="cap-dot" style="background:${colors[key]}"></div>
        <span class="cap-name">${labels[key]}</span>
        <span class="cap-pct">${Math.round((count/total)*100)}%</span>
      </div>`).join('');
}

function renderDeviceInfo() {
  const info = Tracker.getDeviceInfo();
  document.getElementById('device-info').innerHTML =
    Object.entries(info).map(([k, v]) =>
      `<div class="device-chip"><strong>${k}:</strong> ${v}</div>`
    ).join('');
}

function renderHistory(data) {
  const el = document.getElementById('checkin-history');
  if (!data.length) {
    el.innerHTML = '<div class="empty-state">No check-ins recorded yet.</div>';
    return;
  }
  const moodEmojis = { 5:'😄',4:'🙂',3:'😐',2:'😕',1:'😩' };
  el.innerHTML = `
    <div class="history-row" style="font-size:11px;color:var(--muted);font-weight:700">
      <span>Date</span><span>Accomplishment</span><span>Hours</span><span>Eff.</span><span>Mood</span>
    </div>
    ${data.map(d => `
    <div class="history-row">
      <span class="history-date">${d.dateISO || ''}</span>
      <span style="font-size:12px;color:var(--muted)">${(d.accomplishment||'—').slice(0,40)}</span>
      <span>${d.hoursWorked || '—'}h</span>
      <span>${d.efficiency || '—'}/10</span>
      <span class="history-mood">${moodEmojis[d.mood] || '—'}</span>
    </div>`).join('')}`;
}
