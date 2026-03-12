// ============================================================
//  offline-queue.js — NEW FILE
//  Queues Firestore writes when offline, syncs when back online
//  Include on all protected pages AFTER firebase-config.js
// ============================================================

const OfflineQueue = (() => {
  const QUEUE_KEY = 'aidev_offline_queue';

  // ---- Read queue from localStorage ----
  function getQueue() {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    } catch { return []; }
  }

  // ---- Save queue ----
  function saveQueue(q) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  }

  // ---- Add operation to queue ----
  function enqueue(op) {
    const q = getQueue();
    q.push({ ...op, queuedAt: Date.now() });
    saveQueue(q);
    console.log('[OfflineQueue] Queued:', op.type, op.path);
  }

  // ---- Flush all queued ops to Firestore ----
  async function flush() {
    const q = getQueue();
    if (!q.length) return;

    const succeeded = [];
    for (const op of q) {
      try {
        const ref = getRef(op.path);
        if (op.type === 'set')    await ref.set(op.data, { merge: op.merge || false });
        if (op.type === 'update') await ref.update(op.data);
        if (op.type === 'add')    await ref.add(op.data);
        succeeded.push(op);
        console.log('[OfflineQueue] Flushed:', op.type, op.path);
      } catch (err) {
        console.warn('[OfflineQueue] Failed to flush:', op.path, err.message);
      }
    }

    // Remove succeeded ops from queue
    const remaining = q.filter(op => !succeeded.includes(op));
    saveQueue(remaining);

    if (remaining.length === 0) {
      updateOfflineBanner(false);
    }
  }

  // ---- Parse Firestore path string to DocumentReference ----
  function getRef(path) {
    const parts = path.split('/');
    let ref = db;
    parts.forEach((p, i) => {
      ref = i % 2 === 0 ? ref.collection(p) : ref.doc(p);
    });
    return ref;
  }

  // ---- Wrapped Firestore set that queues if offline ----
  async function safeSet(path, data, options = {}) {
    if (navigator.onLine) {
      try {
        await getRef(path).set(data, options);
        return true;
      } catch (e) {
        console.warn('[OfflineQueue] set failed, queuing:', e.message);
      }
    }
    enqueue({ type: 'set', path, data, merge: options.merge || false });
    return false;
  }

  // ---- Wrapped Firestore update ----
  async function safeUpdate(path, data) {
    if (navigator.onLine) {
      try {
        await getRef(path).update(data);
        return true;
      } catch (e) {
        console.warn('[OfflineQueue] update failed, queuing:', e.message);
      }
    }
    enqueue({ type: 'update', path, data });
    return false;
  }

  // ---- Wrapped Firestore add (subcollection) ----
  async function safeAdd(collectionPath, data) {
    if (navigator.onLine) {
      try {
        await db.collection(collectionPath).add(data);
        return true;
      } catch (e) {
        console.warn('[OfflineQueue] add failed, queuing:', e.message);
      }
    }
    enqueue({ type: 'add', path: collectionPath, data });
    return false;
  }

  // ---- Online/Offline banner UI ----
  function updateOfflineBanner(isOffline) {
    let banner = document.getElementById('offline-banner');
    if (!banner) return;
    if (isOffline) {
      banner.style.display = 'flex';
      const q = getQueue();
      document.getElementById('offline-queue-count').textContent =
        q.length > 0 ? `${q.length} change${q.length > 1 ? 's' : ''} will sync when back online` : 'Changes will sync when back online';
    } else {
      banner.style.display = 'none';
    }
  }

  // ---- Init: listen to online/offline events ----
  function init() {
    window.addEventListener('online', async () => {
      console.log('[OfflineQueue] Back online — flushing queue');
      updateOfflineBanner(false);
      await flush();
      // Register background sync if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        reg.sync.register('offline-queue').catch(() => {});
      }
    });

    window.addEventListener('offline', () => {
      console.log('[OfflineQueue] Gone offline');
      updateOfflineBanner(true);
    });

    // Listen for SW flush messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', e => {
        if (e.data?.type === 'FLUSH_OFFLINE_QUEUE') flush();
      });
    }

    // Set initial state
    if (!navigator.onLine) updateOfflineBanner(true);

    // Flush any pending queue on page load if online
    if (navigator.onLine && getQueue().length > 0) {
      setTimeout(flush, 2000); // slight delay so Firebase initializes
    }
  }

  return { init, flush, safeSet, safeUpdate, safeAdd, getQueue };
})();

// Auto-init
OfflineQueue.init();
