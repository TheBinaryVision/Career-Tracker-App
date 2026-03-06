// ============================================================
//  tracker.js  —  Session time, OS/device detection, streaks
//  Included on all protected pages — runs automatically
// ============================================================

const Tracker = (() => {
  let sessionStart = Date.now();
  let sessionSaved = false;

  // ---- DEVICE & OS INFO ----
  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let os = 'Unknown OS';
    if      (/Windows NT 10/.test(ua))  os = 'Windows 10/11';
    else if (/Windows NT 6/.test(ua))   os = 'Windows 7/8';
    else if (/Mac OS X/.test(ua))       os = 'macOS';
    else if (/Android/.test(ua))        os = 'Android';
    else if (/iPhone|iPad/.test(ua))    os = 'iOS';
    else if (/Linux/.test(ua))          os = 'Linux';

    let browser = 'Unknown';
    if      (/Chrome/.test(ua) && !/Edge/.test(ua)) browser = 'Chrome';
    else if (/Firefox/.test(ua))  browser = 'Firefox';
    else if (/Safari/.test(ua))   browser = 'Safari';
    else if (/Edge/.test(ua))     browser = 'Edge';

    const isMobile = /Mobi|Android/i.test(ua);

    return {
      os,
      browser,
      device: isMobile ? 'Mobile' : 'Desktop',
      screenWidth:  window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language || 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'
    };
  }

  // ---- STREAK LOGIC ----
  async function updateStreak(uid) {
    const today = new Date().toDateString();
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return;

    const data = userDoc.data();
    const lastActive = data.lastActiveDate || '';

    if (lastActive === today) return; // Already counted today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = lastActive === yesterday.toDateString();

    const newStreak = wasYesterday ? (data.streak || 0) + 1 : 1;
    const longestStreak = Math.max(newStreak, data.longestStreak || 0);
    const totalDaysActive = (data.totalDaysActive || 0) + 1;

    await userRef.update({
      streak: newStreak,
      longestStreak,
      totalDaysActive,
      lastActiveDate: today
    });

    return newStreak;
  }

  // ---- SAVE SESSION ----
  async function saveSession(uid) {
    if (sessionSaved) return;
    sessionSaved = true;

    const durationMs  = Date.now() - sessionStart;
    const durationMin = Math.round(durationMs / 60000);
    if (durationMin < 1) return; // Skip sessions under 1 minute

    const deviceInfo = getDeviceInfo();

    await db.collection('users').doc(uid)
      .collection('sessions')
      .add({
        startedAt:   firebase.firestore.Timestamp.fromDate(new Date(sessionStart)),
        endedAt:     firebase.firestore.Timestamp.now(),
        durationMin,
        date:        new Date().toDateString(),
        dateISO:     new Date().toISOString().split('T')[0],
        ...deviceInfo
      });

    // Update total hours in user profile
    const extraHours = durationMin / 60;
    await db.collection('users').doc(uid).update({
      totalHours: firebase.firestore.FieldValue.increment(extraHours)
    });
  }

  // ---- INIT ----
  function init() {
    auth.onAuthStateChanged(async user => {
      if (!user) return;

      // Update streak on page load
      await updateStreak(user.uid);

      // Save session when user leaves
      window.addEventListener('beforeunload', () => saveSession(user.uid));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') saveSession(user.uid);
      });
    });
  }

  // ---- TODAY'S TIME ----
  async function getTodayTime(uid) {
    const today = new Date().toISOString().split('T')[0];
    const snap  = await db.collection('users').doc(uid)
      .collection('sessions')
      .where('dateISO', '==', today)
      .get();

    let total = 0;
    snap.forEach(doc => { total += doc.data().durationMin || 0; });
    // Add current live session
    total += Math.round((Date.now() - sessionStart) / 60000);
    return total;
  }

  // ---- FORMAT MINUTES ----
  function formatTime(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  return { init, getDeviceInfo, getTodayTime, formatTime };
})();

// Auto-init when auth is ready
Tracker.init();
