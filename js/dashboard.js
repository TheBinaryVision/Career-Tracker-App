// ============================================================
//  dashboard.js — FIXED & IMPROVED
//  Real stats, live timer, GitHub, correct skill count
// ============================================================

async function pageInit(user) {
  setGreeting(user);
  // Load everything in parallel for speed
  await Promise.all([
    loadStats(user.uid),
    loadHeatmap(user.uid),
    loadTodayLog(user.uid),
    loadRecentSessions(user.uid),
    loadGitHub(user.uid),
  ]);
  // Start live updating today's time every 30s
  startStatRefresh(user.uid);
}

// ---- GREETING ----
function setGreeting(user) {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const name = (user.displayName || 'Developer').split(' ')[0];
  const greetEl = document.getElementById('greeting-text');
  const subEl   = document.getElementById('greeting-sub');
  if (greetEl) greetEl.textContent = `Good ${time}, ${name} 👋`;
  if (subEl)   subEl.textContent   = getMotivationalLine();
}

function getMotivationalLine() {
  const lines = [
    "Every line of code gets you closer. Let's build.",
    "Consistency beats talent. Show up today.",
    "You're building something real. Keep going.",
    "Day by day, skill by skill. You've got this.",
    "Real developers ship. What are you shipping today?",
    "Progress is progress, no matter how small.",
    "One checkbox at a time. You're doing it.",
  ];
  return lines[new Date().getDay() % lines.length];
}

// ---- LOAD STATS ----
async function loadStats(uid) {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return;
    const profile = userDoc.data();

    // Streak
    const streakEl = document.getElementById('streak-number');
    if (streakEl) streakEl.textContent = profile.streak || 0;

    // Days active
    const daysEl = document.getElementById('stat-total-days');
    if (daysEl) daysEl.textContent = profile.totalDaysActive || 0;

    // Total hours
    const hoursEl = document.getElementById('stat-total-time');
    if (hoursEl) {
      const h = profile.totalHours || 0;
      hoursEl.textContent = h >= 1 ? `${Math.round(h)}h` : `${Math.round(h * 60)}m`;
    }

    // App opens
    const opensEl = document.getElementById('stat-app-opens');
    if (opensEl) opensEl.textContent = profile.totalOpens || 1;

    // Skills done — count completed roadmap subtopics
    const checked = profile.checkedItems || profile.checkedSkills || {};
    const skillsDoneEl = document.getElementById('stat-skills-done');
    if (skillsDoneEl) {
      skillsDoneEl.textContent = Object.values(checked).filter(Boolean).length;
    }

    // Today's time — live (includes current session)
    const todayMin = await Tracker.getTodayTime(uid);
    const todayEl  = document.getElementById('stat-today-time');
    if (todayEl) todayEl.textContent = Tracker.formatTime(todayMin);

    // Today's check-in efficiency
    const today = new Date().toISOString().split('T')[0];
    const ciSnap = await db.collection('users').doc(uid)
      .collection('checkins').where('dateISO', '==', today).limit(1).get();

    if (!ciSnap.empty) {
      const ci = ciSnap.docs[0].data();
      const effEl = document.getElementById('stat-efficiency');
      if (effEl) effEl.textContent = ci.efficiency ? `${ci.efficiency}/10` : '—';
    }

  } catch(e) {
    console.warn('[Dashboard] loadStats error:', e.message);
  }
}

// ---- LIVE STAT REFRESH ----
function startStatRefresh(uid) {
  // Refresh today's time every 30 seconds
  setInterval(async () => {
    const mins   = await Tracker.getTodayTime(uid);
    const todayEl = document.getElementById('stat-today-time');
    if (todayEl) todayEl.textContent = Tracker.formatTime(mins);
  }, 30000);
}

// ---- HEATMAP ----
async function loadHeatmap(uid) {
  try {
    const snap = await db.collection('users').doc(uid)
      .collection('sessions')
      .orderBy('dateISO', 'desc')
      .limit(300).get();

    // Also count check-ins as activity
    const ciSnap = await db.collection('users').doc(uid)
      .collection('checkins').orderBy('dateISO', 'desc').limit(100).get();

    const dayMap = {};

    // Add session minutes
    snap.forEach(doc => {
      const d = doc.data().dateISO;
      if (d) dayMap[d] = (dayMap[d] || 0) + (doc.data().durationMin || 0);
    });

    // Mark check-in days (minimum 30 min if they checked in)
    ciSnap.forEach(doc => {
      const d = doc.data().dateISO;
      if (d && !dayMap[d]) dayMap[d] = 30;
    });

    const container = document.getElementById('heatmap');
    if (!container) return;
    container.innerHTML = '';

    const today = new Date();
    today.setHours(0,0,0,0);

    // Start from 84 days ago (12 weeks), aligned to Sunday
    const start = new Date(today);
    const dayOfWeek = today.getDay();
    start.setDate(today.getDate() - 83 - dayOfWeek);

    for (let w = 0; w < 13; w++) {
      const col = document.createElement('div');
      col.className = 'hm-col';
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        if (date > today) continue; // skip future
        const iso   = date.toISOString().split('T')[0];
        const mins  = dayMap[iso] || 0;
        const level = mins === 0 ? 0 : mins < 30 ? 1 : mins < 60 ? 2 : mins < 120 ? 3 : 4;
        const cell  = document.createElement('div');
        cell.className = `hm-cell lvl-${level}`;
        cell.title     = `${iso}: ${mins > 0 ? Tracker.formatTime(mins) : 'No activity'}`;
        col.appendChild(cell);
      }
      container.appendChild(col);
    }
  } catch(e) {
    console.warn('[Dashboard] heatmap error:', e.message);
  }
}

// ---- TODAY'S LOG ----
async function loadTodayLog(uid) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const snap  = await db.collection('users').doc(uid)
      .collection('checkins').where('dateISO', '==', today).limit(1).get();

    const el = document.getElementById('today-log-content');
    if (!el) return;

    if (snap.empty) {
      el.innerHTML = `<div class="empty-state">No check-in yet today.<br/>Start your daily log →</div>`;
      return;
    }

    const d = snap.docs[0].data();
    const moodEmojis = { 5:'😄', 4:'🙂', 3:'😐', 2:'😕', 1:'😩' };

    el.innerHTML = `
      <div class="log-item"><span class="log-label">Mood</span><span>${moodEmojis[d.mood] || '—'}</span></div>
      <div class="log-item"><span class="log-label">Energy</span><span>${d.energy || '—'}/10</span></div>
      <div class="log-item"><span class="log-label">Hours</span><span>${d.hoursWorked || '—'}h</span></div>
      <div class="log-item"><span class="log-label">Efficiency</span><span>${d.efficiency || '—'}/10</span></div>
      ${d.accomplishment ? `<div class="log-item"><span class="log-label">✅ Done</span><span>${d.accomplishment}</span></div>` : ''}
      ${d.win           ? `<div class="log-item"><span class="log-label">🏆 Win</span><span>${d.win}</span></div>` : ''}
      ${d.tools?.length ? `<div class="log-item"><span class="log-label">🛠️ Tools</span><span>${d.tools.join(', ')}</span></div>` : ''}
    `;
  } catch(e) {
    console.warn('[Dashboard] todayLog error:', e.message);
  }
}

// ---- GITHUB ----
async function loadGitHub(uid) {
  try {
    const profileDoc = await db.collection('users').doc(uid).get();
    const profile    = profileDoc.data();

    // Try both field names in case user saved it differently
    const username = profile?.github || profile?.githubUsername || profile?.githubId || '';
    if (!username || username.trim() === '') {
      // Show the setup card so user can add GitHub username
      const card  = document.getElementById('github-card');
      const setup = document.getElementById('github-setup');
      if (card)  card.style.display  = 'block';
      if (setup) setup.style.display = 'block';
      console.log('[GitHub] No username — showing setup');
      return;
    }

    const cleanName = username.trim().replace('@','');
    console.log('[GitHub] Fetching for:', cleanName);

    // Show card, hide setup box
    const card  = document.getElementById('github-card');
    const setup = document.getElementById('github-setup');
    if (card)  card.style.display  = 'block';
    if (setup) setup.style.display = 'none';

    // Fetch user info + events in parallel
    const [userRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${cleanName}`),
      fetch(`https://api.github.com/users/${cleanName}/events/public?per_page=50`)
    ]);

    if (!userRes.ok) {
      console.warn('[GitHub] User not found:', userRes.status);
      return;
    }

    const ghUser  = await userRes.json();
    const events  = await eventsRes.json();

    if (!Array.isArray(events)) {
      console.warn('[GitHub] Events not array:', events);
      return;
    }

    // Card already shown above

    const label = document.getElementById('github-username-label');
    if (label) label.textContent = `@${cleanName}`;

    // Count push events (commits) in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPushes = events.filter(e =>
      e.type === 'PushEvent' && new Date(e.created_at) > thirtyDaysAgo
    );

    const totalCommits = recentPushes.reduce((sum, e) =>
      sum + (e.payload?.commits?.length || 0), 0
    );

    // Update stat card
    const statEl = document.getElementById('stat-github');
    if (statEl) statEl.textContent = totalCommits > 0 ? `${totalCommits}` : ghUser.public_repos || 0;

    // Also show public repos count
    const repoEl = document.getElementById('stat-github-repos');
    if (repoEl) repoEl.textContent = ghUser.public_repos || 0;

    // Render commit list
    const list = document.getElementById('github-commits-list');
    if (!list) return;

    if (!recentPushes.length) {
      list.innerHTML = `<div class="empty-state" style="font-size:13px">No recent pushes found for @${cleanName}.<br/>Start committing! 💪</div>`;
      return;
    }

    list.innerHTML = recentPushes.slice(0, 8).map(e => {
      const commits = e.payload?.commits || [];
      const msg     = commits[0]?.message || 'No message';
      const repo    = e.repo?.name?.split('/')[1] || e.repo?.name || '';
      const date    = new Date(e.created_at).toLocaleDateString('en-IN', { month:'short', day:'numeric' });
      const count   = commits.length;
      return `
        <div class="commit-row">
          <div class="commit-repo">
            📁 ${repo}
            <span style="color:var(--muted);font-weight:400"> · ${date}</span>
            <span class="commit-count">${count} commit${count > 1 ? 's' : ''}</span>
          </div>
          <div class="commit-msg">${msg.slice(0,90)}${msg.length > 90 ? '…' : ''}</div>
        </div>`;
    }).join('');

  } catch(e) {
    console.warn('[GitHub] fetch failed:', e.message);
  }
}

// ---- SAVE GITHUB USERNAME (for users who didn't set it on signup) ----
async function saveGitHub() {
  const uid   = getUID();
  const input = document.getElementById('github-input');
  const msg   = document.getElementById('github-save-msg');
  if (!input || !uid) return;

  const username = input.value.trim().replace('@','');
  if (!username) return;

  try {
    await db.collection('users').doc(uid).update({ github: username });
    if (msg) msg.textContent = '✅ Saved! Loading your GitHub activity...';
    document.getElementById('github-setup').style.display = 'none';
    await loadGitHub(uid);
  } catch(e) {
    if (msg) msg.textContent = 'Failed to save. Try again.';
  }
}

// ---- LOAD RECENT SESSIONS ----
async function loadRecentSessions(uid) {
  try {
    const snap = await db.collection('users').doc(uid)
      .collection('sessions')
      .orderBy('startedAt', 'desc')
      .limit(10).get();

    const el    = document.getElementById('recent-sessions');
    const cntEl = document.getElementById('stat-sessions-count');
    if (!el) return;

    if (snap.empty) {
      el.innerHTML = `<div class="empty-state">No sessions yet.<br/>Your time on the app will appear here.</div>`;
      return;
    }

    if (cntEl) cntEl.textContent = `${snap.size} recent`;

    el.innerHTML = snap.docs.map(doc => {
      const d    = doc.data();
      const date = d.startedAt?.toDate
        ? d.startedAt.toDate().toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
        : d.date || '';
      return `
        <div class="session-row">
          <span class="session-date">${date}</span>
          <span style="color:var(--muted);font-size:12px">${d.device || ''} · ${d.browser || ''}</span>
          <span class="session-duration">${Tracker.formatTime(d.durationMin || 0)}</span>
        </div>`;
    }).join('');
  } catch(e) {
    console.warn('[Dashboard] sessions error:', e.message);
  }
}