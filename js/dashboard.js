// ============================================================
//  dashboard.js — FULLY FIXED
// ============================================================

async function pageInit(user) {
  setGreeting(user);
  // First repair any missing fields in user doc
  await repairUserDoc(user.uid);
  // Load all sections in parallel
  await Promise.all([
    loadStats(user.uid),
    loadHeatmap(user.uid),
    loadTodayLog(user.uid),
    loadRecentSessions(user.uid),
    loadGitHub(user.uid),
  ]);
  // Live refresh today's time every 30s
  setInterval(async () => {
    const mins = await Tracker.getTodayTime(user.uid);
    const el = document.getElementById('stat-today-time');
    if (el) el.textContent = Tracker.formatTime(mins);
  }, 30000);
}

// ---- REPAIR USER DOC (fixes missing fields for existing users) ----
async function repairUserDoc(uid) {
  try {
    const ref  = db.collection('users').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return;

    const d       = snap.data();
    const updates = {};
    const today   = new Date().toDateString();
    const todayISO = new Date().toISOString().split('T')[0];

    // Fix missing fields
    if (d.streak          === undefined) updates.streak          = 0;
    if (d.longestStreak   === undefined) updates.longestStreak   = 0;
    if (d.totalDaysActive === undefined) updates.totalDaysActive = 0;
    if (d.totalHours      === undefined) updates.totalHours      = 0;
    if (d.totalOpens      === undefined) updates.totalOpens      = 0;
    if (d.checkedItems    === undefined) updates.checkedItems    = {};

    // Fix streak — if lastActiveDate is missing or stale, update it
    if (!d.lastActiveDate) {
      updates.streak          = 1;
      updates.longestStreak   = 1;
      updates.totalDaysActive = 1;
      updates.lastActiveDate  = today;
    } else if (d.lastActiveDate !== today) {
      // New day — increment streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = d.lastActiveDate === yesterday.toDateString();
      const newStreak    = wasYesterday ? (d.streak || 0) + 1 : 1;
      updates.streak          = newStreak;
      updates.longestStreak   = Math.max(newStreak, d.longestStreak || 0);
      updates.totalDaysActive = (d.totalDaysActive || 0) + 1;
      updates.lastActiveDate  = today;
      updates.totalOpens      = (d.totalOpens || 0) + 1;
    }

    // Compute totalHours from sessions if it's 0 but sessions exist
    if (!d.totalHours || d.totalHours === 0) {
      try {
        const sessSnap = await ref.collection('sessions').get();
        let totalMin = 0;
        sessSnap.forEach(s => { totalMin += s.data().durationMin || 0; });
        if (totalMin > 0) updates.totalHours = totalMin / 60;
      } catch {}
    }

    if (Object.keys(updates).length > 0) {
      await ref.update(updates);
    }
  } catch(e) {
    console.warn('[repair]', e.message);
  }
}

// ---- GREETING ----
function setGreeting(user) {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const name = (user.displayName || user.email || 'Developer').split(' ')[0];
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
    const snap    = await db.collection('users').doc(uid).get();
    if (!snap.exists) return;
    const profile = snap.data();

    // Streak
    setText('streak-number',    profile.streak          || 0);
    // Days active
    setText('stat-total-days',  profile.totalDaysActive || 0);
    // App opens
    setText('stat-app-opens',   profile.totalOpens      || 1);

    // Total hours
    const h = profile.totalHours || 0;
    setText('stat-total-time',  h >= 1 ? `${Math.round(h)}h` : `${Math.round(h * 60)}m`);

    // Skills done — count from checkedItems (new format) or checkedSkills (old)
    const items   = profile.checkedItems || profile.checkedSkills || {};
    const doneCnt = Object.values(items).filter(Boolean).length;
    setText('stat-skills-done', doneCnt);

    // Today's live time (includes current session)
    const todayMin = await Tracker.getTodayTime(uid);
    setText('stat-today-time',  Tracker.formatTime(todayMin));

    // Today's check-in efficiency
    const today   = new Date().toISOString().split('T')[0];
    const ciSnap  = await db.collection('users').doc(uid)
      .collection('checkins').where('dateISO', '==', today).limit(1).get();
    if (!ciSnap.empty) {
      const ci = ciSnap.docs[0].data();
      setText('stat-efficiency', ci.efficiency ? `${ci.efficiency}/10` : '—');
    }

  } catch(e) { console.warn('[loadStats]', e.message); }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ---- HEATMAP ----
async function loadHeatmap(uid) {
  try {
    const [sessSnap, ciSnap] = await Promise.all([
      db.collection('users').doc(uid).collection('sessions')
        .orderBy('dateISO','desc').limit(300).get(),
      db.collection('users').doc(uid).collection('checkins')
        .orderBy('dateISO','desc').limit(200).get()
    ]);

    const dayMap = {};

    sessSnap.forEach(doc => {
      const d = doc.data();
      if (d.dateISO) dayMap[d.dateISO] = (dayMap[d.dateISO] || 0) + (d.durationMin || 0);
    });

    // Count check-in days as at least 30 min activity
    ciSnap.forEach(doc => {
      const d = doc.data();
      if (d.dateISO) {
        const hrs = (d.hoursWorked || 0) * 60;
        dayMap[d.dateISO] = Math.max(dayMap[d.dateISO] || 0, hrs || 30);
      }
    });

    const container = document.getElementById('heatmap');
    if (!container) return;
    container.innerHTML = '';

    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(today);
    start.setDate(today.getDate() - (today.getDay()) - (12 * 7));

    for (let w = 0; w < 13; w++) {
      const col = document.createElement('div');
      col.className = 'hm-col';
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        if (date > today) continue;
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
  } catch(e) { console.warn('[heatmap]', e.message); }
}

// ---- TODAY'S LOG ----
async function loadTodayLog(uid) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const snap  = await db.collection('users').doc(uid)
      .collection('checkins').where('dateISO','==',today).limit(1).get();
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
      ${d.win            ? `<div class="log-item"><span class="log-label">🏆 Win</span><span>${d.win}</span></div>` : ''}
      ${d.tools?.length  ? `<div class="log-item"><span class="log-label">🛠️ Tools</span><span>${d.tools.join(', ')}</span></div>` : ''}
    `;
  } catch(e) { console.warn('[todayLog]', e.message); }
}

// ---- RECENT SESSIONS ----
async function loadRecentSessions(uid) {
  try {
    const snap = await db.collection('users').doc(uid)
      .collection('sessions').orderBy('startedAt','desc').limit(10).get();
    const el = document.getElementById('recent-sessions');
    if (!el) return;

    if (snap.empty) {
      el.innerHTML = `<div class="empty-state">No sessions yet. Keep the app open and your time will be tracked automatically.</div>`;
      return;
    }

    el.innerHTML = snap.docs.map(doc => {
      const d    = doc.data();
      const date = d.startedAt?.toDate
        ? d.startedAt.toDate().toLocaleDateString('en-IN',
            { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
        : d.date || '';
      return `
        <div class="session-row">
          <span class="session-date">${date}</span>
          <span style="color:var(--muted);font-size:12px">${d.device||''} · ${d.browser||''}</span>
          <span class="session-duration">${Tracker.formatTime(d.durationMin || 0)}</span>
        </div>`;
    }).join('');
  } catch(e) { console.warn('[sessions]', e.message); }
}

// ---- GITHUB ----
async function loadGitHub(uid) {
  try {
    const profileSnap = await db.collection('users').doc(uid).get();
    const profile     = profileSnap.data() || {};
    const username    = (profile.github || profile.githubUsername || '').trim().replace('@','');

    const card  = document.getElementById('github-card');
    const setup = document.getElementById('github-setup');

    if (!username) {
      if (card)  card.style.display  = 'block';
      if (setup) setup.style.display = 'block';
      return;
    }

    if (card)  card.style.display  = 'block';
    if (setup) setup.style.display = 'none';

    const label = document.getElementById('github-username-label');
    if (label) label.textContent = `@${username}`;

    const [userRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/events/public?per_page=50`)
    ]);

    if (!userRes.ok) {
      const list = document.getElementById('github-commits-list');
      if (list) list.innerHTML = `<div class="empty-state" style="font-size:13px">GitHub user "@${username}" not found. <button onclick="document.getElementById('github-setup').style.display='block'" style="color:var(--accent);background:none;border:none;cursor:pointer;font-size:13px">Update username</button></div>`;
      return;
    }

    const ghUser = await userRes.json();
    const events = eventsRes.ok ? await eventsRes.json() : [];

    if (!Array.isArray(events)) return;

    // Commits in last 30 days
    const cutoff      = new Date(); cutoff.setDate(cutoff.getDate() - 30);
    const pushes      = events.filter(e => e.type === 'PushEvent' && new Date(e.created_at) > cutoff);
    const totalCommits = pushes.reduce((s, e) => s + (e.payload?.commits?.length || 0), 0);

    setText('stat-github', totalCommits || ghUser.public_repos || 0);

    const list = document.getElementById('github-commits-list');
    if (!list) return;

    if (!pushes.length) {
      list.innerHTML = `
        <div style="display:flex;gap:16px;padding:12px 0;flex-wrap:wrap">
          <div style="text-align:center;padding:10px 16px;background:var(--bg3);border-radius:10px;min-width:80px">
            <div style="font-size:22px;font-weight:900;color:var(--accent)">${ghUser.public_repos||0}</div>
            <div style="font-size:11px;color:var(--muted)">Repos</div>
          </div>
          <div style="text-align:center;padding:10px 16px;background:var(--bg3);border-radius:10px;min-width:80px">
            <div style="font-size:22px;font-weight:900;color:var(--blue)">${ghUser.followers||0}</div>
            <div style="font-size:11px;color:var(--muted)">Followers</div>
          </div>
        </div>
        <div class="empty-state" style="font-size:13px;padding:8px 0">No recent pushes. Start committing! 💪</div>`;
      return;
    }

    list.innerHTML = pushes.slice(0,8).map(e => {
      const commits = e.payload?.commits || [];
      const msg     = commits[0]?.message || 'No message';
      const repo    = e.repo?.name?.split('/')[1] || '';
      const date    = new Date(e.created_at).toLocaleDateString('en-IN', { month:'short', day:'numeric' });
      const cnt     = commits.length;
      return `
        <div class="commit-row">
          <div class="commit-repo">📁 ${repo}
            <span style="color:var(--muted);font-weight:400"> · ${date}</span>
            <span class="commit-count">${cnt} commit${cnt>1?'s':''}</span>
          </div>
          <div class="commit-msg">${msg.slice(0,90)}${msg.length>90?'…':''}</div>
        </div>`;
    }).join('');

  } catch(e) { console.warn('[github]', e.message); }
}

// ---- SAVE GITHUB USERNAME ----
async function saveGitHub() {
  const uid   = getUID();
  const input = document.getElementById('github-input');
  const msg   = document.getElementById('github-save-msg');
  if (!input || !uid) return;
  const username = input.value.trim().replace('@','');
  if (!username) return;
  try {
    await db.collection('users').doc(uid).update({ github: username });
    if (msg) msg.textContent = '✅ Saved! Loading...';
    document.getElementById('github-setup').style.display = 'none';
    await loadGitHub(uid);
  } catch(e) {
    if (msg) msg.textContent = 'Failed to save. Try again.';
  }
}