// ============================================================
//  dashboard.js  —  Dashboard page logic
// ============================================================

async function pageInit(user) {
  setGreeting(user);
  await loadStats(user.uid);
  await loadHeatmap(user.uid);
  await loadTodayLog(user.uid);
  await loadRecentSessions(user.uid);
  await loadGitHub(user.uid);
}

// ---- GREETING ----
function setGreeting(user) {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const name = (user.displayName || 'Developer').split(' ')[0];
  document.getElementById('greeting-text').textContent = `Good ${time}, ${name} 👋`;
  document.getElementById('greeting-sub').textContent  = getMotivationalLine();
}

function getMotivationalLine() {
  const lines = [
    "Every line of code gets you closer. Let's build.",
    "Consistency beats talent. Show up today.",
    "You're building something real. Keep going.",
    "Day by day, skill by skill. You've got this.",
    "Real developers ship. What are you shipping today?",
    "Progress is progress, no matter how small."
  ];
  return lines[new Date().getDay() % lines.length];
}

// ---- LOAD STATS ----
async function loadStats(uid) {
  // User profile (streak, total days, total hours, skills)
  const userDoc = await db.collection('users').doc(uid).get();
  const profile = userDoc.data();

  document.getElementById('streak-number').textContent = profile.streak || 0;
  document.getElementById('stat-total-days').textContent = profile.totalDaysActive || 0;
  document.getElementById('stat-total-time').textContent =
    profile.totalHours >= 1 ? `${Math.round(profile.totalHours)}h` : `${Math.round((profile.totalHours || 0) * 60)}m`;

  // Count checked skills
  const skills = profile.checkedSkills || {};
  document.getElementById('stat-skills-done').textContent = Object.values(skills).filter(Boolean).length;

  // Today's time
  const todayMin = await Tracker.getTodayTime(uid);
  document.getElementById('stat-today-time').textContent = Tracker.formatTime(todayMin);

  // Today's efficiency from check-in
  const today = new Date().toISOString().split('T')[0];
  const checkinSnap = await db.collection('users').doc(uid)
    .collection('checkins').where('dateISO', '==', today).limit(1).get();

  if (!checkinSnap.empty) {
    const ci = checkinSnap.docs[0].data();
    document.getElementById('stat-efficiency').textContent = `${ci.efficiency || '—'}/10`;
  }
}

// ---- HEATMAP ----
async function loadHeatmap(uid) {
  const snap = await db.collection('users').doc(uid)
    .collection('sessions')
    .orderBy('dateISO', 'desc')
    .limit(200).get();

  // Aggregate minutes per day
  const dayMap = {};
  snap.forEach(doc => {
    const d = doc.data().dateISO;
    if (d) dayMap[d] = (dayMap[d] || 0) + (doc.data().durationMin || 0);
  });

  // Build 12-week grid
  const container = document.getElementById('heatmap');
  container.innerHTML = '';

  const today = new Date();
  today.setHours(0,0,0,0);

  // Start 12 weeks ago on Sunday
  const start = new Date(today);
  start.setDate(today.getDate() - 84 + (today.getDay() === 0 ? 0 : 7 - today.getDay()));

  for (let w = 0; w < 12; w++) {
    const col = document.createElement('div');
    col.className = 'hm-col';
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const iso   = date.toISOString().split('T')[0];
      const mins  = dayMap[iso] || 0;
      const level = mins === 0 ? 0 : mins < 30 ? 1 : mins < 60 ? 2 : mins < 120 ? 3 : 4;
      const cell  = document.createElement('div');
      cell.className = `hm-cell lvl-${level}`;
      cell.title = `${iso}: ${Tracker.formatTime(mins)}`;
      col.appendChild(cell);
    }
    container.appendChild(col);
  }
}

// ---- TODAY'S LOG ----
async function loadTodayLog(uid) {
  const today = new Date().toISOString().split('T')[0];
  const snap  = await db.collection('users').doc(uid)
    .collection('checkins').where('dateISO', '==', today).limit(1).get();

  const el = document.getElementById('today-log-content');
  if (snap.empty) {
    el.innerHTML = '<div class="empty-state">No check-in yet today.<br/>Tap "Check In" to log your day →</div>';
    return;
  }

  const d = snap.docs[0].data();
  const moodEmojis = { 5:'😄',4:'🙂',3:'😐',2:'😕',1:'😩' };

  el.innerHTML = `
    <div class="log-item"><span class="log-label">Mood</span><span>${moodEmojis[d.mood] || '—'}</span></div>
    <div class="log-item"><span class="log-label">Energy</span><span>${d.energy || '—'}/10</span></div>
    <div class="log-item"><span class="log-label">Hours</span><span>${d.hoursWorked || '—'}h</span></div>
    <div class="log-item"><span class="log-label">Efficiency</span><span>${d.efficiency || '—'}/10</span></div>
    <div class="log-item"><span class="log-label">Capacity</span><span>${d.capacity || '—'}</span></div>
    ${d.accomplishment ? `<div class="log-item"><span class="log-label">Done</span><span>${d.accomplishment}</span></div>` : ''}
    ${d.win ? `<div class="log-item"><span class="log-label">Win 🏆</span><span>${d.win}</span></div>` : ''}
    ${d.tools?.length ? `<div class="log-item"><span class="log-label">Tools</span><span>${d.tools.join(', ')}</span></div>` : ''}
  `;
}

// ---- RECENT SESSIONS ----
async function loadRecentSessions(uid) {
  const snap = await db.collection('users').doc(uid)
    .collection('sessions')
    .orderBy('startedAt', 'desc')
    .limit(7).get();

  const el = document.getElementById('recent-sessions');
  if (snap.empty) { el.innerHTML = '<div class="empty-state">No sessions recorded yet.</div>'; return; }

  el.innerHTML = snap.docs.map(doc => {
    const d = doc.data();
    const date = d.startedAt?.toDate ? d.startedAt.toDate().toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' }) : d.date;
    return `
      <div class="session-row">
        <span class="session-date">${date}</span>
        <span>${d.os || ''} · ${d.browser || ''}</span>
        <span class="session-duration">${Tracker.formatTime(d.durationMin || 0)}</span>
      </div>`;
  }).join('');
}

// ---- GITHUB ----
async function loadGitHub(uid) {
  const profile = (await db.collection('users').doc(uid).get()).data();
  const username = profile?.github;
  if (!username) return;

  try {
    const res  = await fetch(`https://api.github.com/users/${username}/events/public?per_page=30`);
    const events = await res.json();
    if (!Array.isArray(events)) return;

    const pushes = events.filter(e => e.type === 'PushEvent').slice(0, 8);
    if (!pushes.length) return;

    document.getElementById('github-card').style.display = 'block';
    document.getElementById('github-username-label').textContent = `@${username}`;
    document.getElementById('stat-github').textContent = pushes.length + '+';

    const list = document.getElementById('github-commits-list');
    list.innerHTML = pushes.map(e => {
      const msg   = e.payload?.commits?.[0]?.message || 'No message';
      const repo  = e.repo?.name || '';
      const date  = new Date(e.created_at).toLocaleDateString('en-IN', { month:'short', day:'numeric' });
      return `
        <div class="commit-row">
          <div class="commit-repo">${repo} <span style="color:var(--muted);font-weight:400">· ${date}</span></div>
          <div class="commit-msg">${msg.slice(0,80)}${msg.length > 80 ? '…' : ''}</div>
        </div>`;
    }).join('');
  } catch (e) {
    console.log('GitHub fetch failed:', e);
  }
}
