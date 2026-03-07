# 🤖 Study Tracker — Full App

A full web app with Firebase auth, Firestore backend, daily check-ins,
streak tracking, analytics, GitHub activity, and session time logging.

---

## 📁 File Structure

```
Study-Tracker-app/
├── index.html              ← Login / Signup page
├── manifest.json           ← PWA config
├── sw.js                   ← Service worker (offline)
├── pages/
│   ├── dashboard.html      ← Main dashboard
│   ├── checkin.html        ← Daily check-in form
│   ├── analytics.html      ← Charts & history
│   └── roadmap.html        ← Skills tracker
├── css/
│   ├── global.css          ← Shared styles, navbar, variables
│   ├── auth.css            ← Login/signup styles
│   ├── dashboard.css       ← Dashboard styles
│   ├── checkin.css         ← Check-in form styles
│   ├── analytics.css       ← Charts & analytics styles
│   └── roadmap.css         ← Roadmap styles
└── js/
    ├── firebase-config.js  ← ⚠️ YOUR FIREBASE KEYS GO HERE
    ├── auth.js             ← Login, signup, Google auth
    ├── auth-guard.js       ← Route protection + logout
    ├── tracker.js          ← Session time, OS info, streaks
    ├── dashboard.js        ← Dashboard page logic
    ├── checkin.js          ← Check-in form logic
    ├── analytics.js        ← Charts and stats
    ├── roadmap-data.js     ← All phases/skills data
    └── roadmap.js          ← Roadmap + Firebase sync
```

---

## 🔥 STEP 1 — Create Your Firebase Project

1. Go to **console.firebase.google.com**
2. Click **"Add project"** → Name it "Study-Tracker" → Click Create
3. Go to **Project Settings** (gear icon) → scroll to "Your apps"
4. Click **</>** (Web app) → Register with name "AI Dev Web"
5. Copy the config object shown — it looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "Study-Tracker.firebaseapp.com",
  projectId: "Study-Tracker",
  storageBucket: "Study-Tracker.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Open `js/firebase-config.js` and **replace** the placeholder values with yours.

---

## 🔐 STEP 2 — Enable Authentication

1. In Firebase Console → **Authentication** → Get Started
2. Click **Sign-in method** tab
3. Enable **Email/Password** → Save
4. Enable **Google** → Set support email → Save

---

## 🗄️ STEP 3 — Set Up Firestore Database

1. In Firebase Console → **Firestore Database** → Create database
2. Choose **Start in test mode** (for now) → Select your region → Done

### Firestore Security Rules (paste these in the Rules tab):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /checkins/{checkinId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /sessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 🚀 STEP 4 — Deploy to Netlify

1. Go to **netlify.com** → Create free account
2. Drag the entire **Study-Tracker-app** folder onto the Netlify deploy area
3. Your app goes live at something like: `https://amazing-name.netlify.app`

---

## 📱 STEP 5 — Install on Android

1. Open your Netlify URL in **Chrome on Android**
2. Tap the **3-dot menu** → "Add to Home Screen"
3. Tap **Install** → App icon appears on your home screen ✅

---

## ✅ What Each Page Does

| Page | What it tracks |
|------|---------------|
| Dashboard | Streak, today's time, heatmap, GitHub commits, recent sessions |
| Check-In | Mood, energy, focus, tools used, hours, efficiency, capacity, wins |
| Analytics | Bar charts for hours/efficiency/mood, tools breakdown, weekday patterns, device info |
| Roadmap | All 5 phases with checkable skills — synced to Firebase in real time |

---

## 🐙 GitHub Activity

When signing up, enter your GitHub username.
The app fetches your public push events and shows recent commits on the Dashboard.

---

## 💡 Tips

- Check in **every day** — your streak is your most valuable metric
- The **Analytics page** shows which days of the week you work best
- **Session time** is tracked automatically — every page visit counts
- Skills you check off on the Roadmap are saved to Firebase instantly
