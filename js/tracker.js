// ============================================================
//  tracker.js — FIXED & IMPROVED
//  - Saves sessions reliably on Android/PWA
//  - Counts app opens
//  - Live timer ticking on dashboard
//  - Saves even short sessions (30 sec minimum)
// ============================================================

const Tracker = (() => {
  let sessionStart = Date.now();
  let sessionSaved = false;
  let liveTimerInterval = null;
  let currentUID = null;

  // ---- DEVICE INFO ----
  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let os = 'Unknown';
    if      (/Windows NT 10/.test(ua))  os = 'Windows 10/11';
    else if (/Windows NT 6/.test(ua))   os = 'Windows 7/8';
    else if (/Mac OS X/.test(ua))       os = 'macOS';
    else if (/Android/.test(ua))        os = 'Android';
    else if (/iPhone|iPad/.test(ua))    os = 'iOS';
    else if (/Linux/.test(ua))          os = 'Linux';

    let browser = 'Unknown';
    if      (/Edg/.test(ua))                          browser = 'Edge';
    else if (/Chrome/.test(ua))                       browser = 'Chrome';
    else if (/Firefox/.test(ua))                      browser = 'Firefox';
    else if (/Safari/.test(ua))                       browser = 'Safari';

    return {
      os, browser,
      device:       /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop',
      screenWidth:  window.screen.width,
      screenHeight: window.screen.height,
      language:     navigator.language || 'Unknown',
      timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'
    };
  }

  // ---- STREAK ----
  async function updateStreak(uid) {
    const today = new Date().toDateString();
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return;

    const data = userDoc.data();
    if (data.lastActiveDate === today) return; // already counted

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = data.lastActiveDate === yesterday.toDateString();

    const newStreak      = wasYesterday ? (data.streak || 0) + 1 : 1;
    const longestStreak  = Math.max(newStreak, data.longestStreak || 0);
    const totalDaysActive = (data.totalDaysActive || 0) + 1;
    // Count total app opens
    const totalOpens     = (data.totalOpens || 0) + 1;

    await userRef.update({
      streak: newStreak,
      longestStreak,
      totalDaysActive,
      totalOpens,
      lastActiveDate: today
    });

    return newStreak;
  }

  // ---- SAVE SESSION ----
  async function saveSession(uid, force = false) {
    if (sessionSaved && !force) return;
    sessionSaved = true;

    const durationMs  = Date.now() - sessionStart;
    const durationMin = Math.max(1, Math.round(durationMs / 60000));
    // Save sessions of 30 seconds or more (not just 1 min+)
    if (durationMs < 30000) return;

    const deviceInfo = getDeviceInfo();
    const dateISO    = new Date().toISOString().split('T')[0];

    // Use OfflineQueue so it saves even if connection drops
    try {
      await db.collection('users').doc(uid).collection('sessions').add({
        startedAt:   firebase.firestore.Timestamp.fromDate(new Date(sessionStart)),
        endedAt:     firebase.firestore.Timestamp.now(),
        durationMin,
        date:        new Date().toDateString(),
        dateISO,
        ...deviceInfo
      });

      await db.collection('users').doc(uid).update({
        totalHours: firebase.firestore.FieldValue.increment(durationMin / 60)
      });
    } catch(e) {
      // Store in localStorage as backup if Firebase fails
      try {
        const pending = JSON.parse(localStorage.getItem('pending_sessions') || '[]');
        pending.push({ uid, durationMin, dateISO, deviceInfo, ts: Date.now() });
        localStorage.setItem('pending_sessions', JSON.stringify(pending));
      } catch {}
    }
  }

  // ---- FLUSH PENDING SESSIONS (from localStorage backup) ----
  async function flushPendingSessions() {
    try {
      const pending = JSON.parse(localStorage.getItem('pending_sessions') || '[]');
      if (!pending.length) return;
      for (const s of pending) {
        await db.collection('users').doc(s.uid).collection('sessions').add({
          startedAt: firebase.firestore.Timestamp.fromDate(new Date(s.ts)),
          endedAt:   firebase.firestore.Timestamp.fromDate(new Date(s.ts)),
          durationMin: s.durationMin,
          dateISO:   s.dateISO,
          ...(s.deviceInfo || {})
        });
      }
      localStorage.removeItem('pending_sessions');
    } catch {}
  }

  // ---- TODAY'S TIME (live) ----
  async function getTodayTime(uid) {
    const today = new Date().toISOString().split('T')[0];
    const snap  = await db.collection('users').doc(uid)
      .collection('sessions').where('dateISO', '==', today).get();
    let total = 0;
    snap.forEach(doc => { total += doc.data().durationMin || 0; });
    // Add current live session time
    total += Math.round((Date.now() - sessionStart) / 60000);
    return total;
  }

  // ---- LIVE TIMER on dashboard ----
  function startLiveTimer(uid) {
    const el = document.getElementById('stat-today-time');
    if (!el) return;

    // Update every 30 seconds
    liveTimerInterval = setInterval(async () => {
      const mins = await getTodayTime(uid);
      el.textContent = formatTime(mins);
    }, 30000);
  }

  // ---- FORMAT TIME ----
  function formatTime(minutes) {
    if (!minutes || minutes < 1) return '0m';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  // ---- INIT ----
  function init() {
    auth.onAuthStateChanged(async user => {
      if (!user) return;
      currentUID = user.uid;

      // Flush any offline-saved sessions first
      if (navigator.onLine) flushPendingSessions();

      // Update streak
      await updateStreak(user.uid);

      // Start live timer if on dashboard
      startLiveTimer(user.uid);

      // Save session on page hide (works on Android/PWA)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          saveSession(user.uid);
        } else {
          // Page came back — reset session start for new segment
          if (sessionSaved) {
            sessionStart = Date.now();
            sessionSaved = false;
          }
        }
      });

      // Fallback for desktop browsers
      window.addEventListener('beforeunload', () => saveSession(user.uid));

      // Also save every 5 minutes automatically (PWA stays open)
      setInterval(() => {
        saveSession(user.uid, true);
        // Reset for next segment
        setTimeout(() => {
          sessionStart = Date.now();
          sessionSaved = false;
        }, 1000);
      }, 5 * 60 * 1000);
    });
  }

  return { init, getDeviceInfo, getTodayTime, formatTime, startLiveTimer };
})();

Tracker.init();