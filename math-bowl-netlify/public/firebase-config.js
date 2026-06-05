// ─────────────────────────────────────────────────────────────────────────────
// REPLACE THE VALUES BELOW with your own Firebase project config.
//
// To get them:
//   1. Go to https://console.firebase.google.com
//   2. Create a new project (or open an existing one)
//   3. Build → Realtime Database → Create Database → Start in TEST mode
//   4. Project Settings (gear icon) → General → Your apps → Add Web App (</>)
//   5. Copy the values from the firebaseConfig object Firebase shows you
//
// Only databaseURL is strictly required for this app. Keep all the fields
// Firebase gives you — they're safe to commit (client SDK keys are public).
// ─────────────────────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey:        'REPLACE_WITH_YOUR_API_KEY',
  authDomain:    'YOUR-PROJECT-ID.firebaseapp.com',
  databaseURL:   'https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com',
  projectId:     'YOUR-PROJECT-ID',
  storageBucket: 'YOUR-PROJECT-ID.appspot.com',
  messagingSenderId: 'REPLACE_ME',
  appId:         'REPLACE_ME',
};
