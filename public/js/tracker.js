// ============================================================
//  tracker.js — FIXED
//  Works on Android/PWA, saves sessions reliably
// ============================================================

const Tracker = (() => {
  let sessionStart = Date.now();
  let sessionSaved = false;

  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let os = 'Unknown';
    if      (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
    else if (/Windows NT 6/.test(ua))  os = 'Windows 7/8';
    else if (/Mac OS X/.test(ua))      os = 'macOS';
    else if (/Android/.test(ua))       os = 'Android';
    else if (/iPhone|iPad/.test(ua))   os = 'iOS';
    else if (/Linux/.test(ua))         os = 'Linux';

    let browser = 'Unknown';
    if      (/Edg/.test(ua))    browser = 'Edge';
    else if (/Chrome/.test(ua)) browser = 'Chrome';
    else if (/Firefox/.test(ua))browser = 'Firefox';
    else if (/Safari/.test(ua)) browser = 'Safari';

    return {
      os, browser,
      device:      /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop',
      screenWidth:  window.screen.width,
      language:     navigator.language || 'Unknown',
      timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'
    };
  }

  async function saveSession(uid) {
    if (sessionSaved) return;
    sessionSaved = true;

    const durationMs  = Date.now() - sessionStart;
    const durationMin = Math.max(1, Math.round(durationMs / 60000));
    if (durationMs < 30000) return; // Skip under 30 seconds

    const dateISO = new Date().toISOString().split('T')[0];

    try {
      await db.collection('users').doc(uid).collection('sessions').add({
        startedAt:   firebase.firestore.Timestamp.fromDate(new Date(sessionStart)),
        endedAt:     firebase.firestore.Timestamp.now(),
        durationMin,
        date:        new Date().toDateString(),
        dateISO,
        ...getDeviceInfo()
      });
      await db.collection('users').doc(uid).update({
        totalHours: firebase.firestore.FieldValue.increment(durationMin / 60)
      });
    } catch(e) {
      // Backup to localStorage if Firebase fails
      try {
        const q = JSON.parse(localStorage.getItem('pending_sessions') || '[]');
        q.push({ uid, durationMin, dateISO, ts: sessionStart });
        localStorage.setItem('pending_sessions', JSON.stringify(q));
      } catch {}
    }
  }

  async function flushPending() {
    try {
      const q = JSON.parse(localStorage.getItem('pending_sessions') || '[]');
      if (!q.length) return;
      for (const s of q) {
        await db.collection('users').doc(s.uid).collection('sessions').add({
          startedAt:   firebase.firestore.Timestamp.fromDate(new Date(s.ts)),
          endedAt:     firebase.firestore.Timestamp.fromDate(new Date(s.ts + s.durationMin * 60000)),
          durationMin: s.durationMin,
          dateISO:     s.dateISO,
          date:        new Date(s.ts).toDateString(),
        });
        await db.collection('users').doc(s.uid).update({
          totalHours: firebase.firestore.FieldValue.increment(s.durationMin / 60)
        });
      }
      localStorage.removeItem('pending_sessions');
      console.log('[Tracker] Flushed', q.length, 'pending sessions');
    } catch(e) { console.warn('[flush]', e.message); }
  }

  async function getTodayTime(uid) {
    const today = new Date().toISOString().split('T')[0];
    const snap  = await db.collection('users').doc(uid)
      .collection('sessions').where('dateISO','==',today).get();
    let total = 0;
    snap.forEach(doc => { total += doc.data().durationMin || 0; });
    // Add live current session time
    total += Math.round((Date.now() - sessionStart) / 60000);
    return total;
  }

  function formatTime(minutes) {
    if (!minutes || minutes < 1) return '0m';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  function init() {
    auth.onAuthStateChanged(async user => {
      if (!user) return;

      // Flush any offline-saved sessions
      if (navigator.onLine) flushPending();

      // Save on page hide — works on Android
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          saveSession(user.uid);
        } else if (document.visibilityState === 'visible' && sessionSaved) {
          // Page came back to foreground — start fresh segment
          sessionStart = Date.now();
          sessionSaved = false;
        }
      });

      // Desktop fallback
      window.addEventListener('beforeunload', () => saveSession(user.uid));

      // Auto-save every 5 min (keeps PWA data even if tab stays open)
      setInterval(() => {
        saveSession(user.uid);
        setTimeout(() => {
          sessionStart = Date.now();
          sessionSaved = false;
        }, 1500);
      }, 5 * 60 * 1000);
    });
  }

  return { init, getTodayTime, formatTime, getDeviceInfo };
})();

Tracker.init();