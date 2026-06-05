# Math Bowl — Netlify + Firebase Setup

This is the static version of Math Bowl. No Node server — game state syncs
through Firebase Realtime Database, and the HTML/CSS/JS files are hosted
on Netlify.

You'll do this once. Total time: ~15 min.

## Part 1 — Firebase project (~5 min)

1. Go to **https://console.firebase.google.com** (log in with Google).
2. Click **Add project**. Name it `math-bowl` (or anything). Continue.
3. **Disable Google Analytics** when prompted (not needed). Click **Create**.
4. Wait for project to be created → click **Continue**.
5. In the left sidebar: **Build** → **Realtime Database**.
6. Click **Create Database**.
   - Pick the location closest to you (default is fine).
   - Choose **Start in test mode** → **Enable**.
   - ⚠️ Test mode rules expire after 30 days. For a 2-week class you're fine.
     If you need longer, after deploy go to the **Rules** tab and replace with:
     ```json
     { "rules": { ".read": true, ".write": true } }
     ```
     (Public read/write — fine for this classroom-only use.)
7. Click the gear icon (top left, next to "Project Overview") → **Project settings**.
8. Scroll to **Your apps**. Click the **`</>`** (web) icon.
9. Nickname it `math-bowl-web`, **don't** check "Firebase Hosting", click **Register app**.
10. Firebase shows you a `firebaseConfig` object. **Copy the entire object** (the
    `const firebaseConfig = { ... }` block).
11. Open `public/firebase-config.js` in this folder and replace the placeholder
    values with the ones Firebase just gave you. Save.

## Part 2 — Netlify deploy (~5 min)

### Easiest path (drag & drop, no GitHub needed)

1. Go to **https://app.netlify.com** → log in.
2. Click **Add new site** → **Deploy manually**.
3. Drag the **`public`** folder (from `math-bowl-netlify/public`) onto the upload
   area. *(Not the parent folder — just `public`.)*
4. Wait ~10s. Netlify gives you a URL like `https://random-name.netlify.app`.
5. Click **Site configuration** → **Change site name** → pick something like
   `math-bowl-yourname` → save.

### Alternate (Git-based, auto-redeploys on changes)

If you'd rather Netlify auto-deploy whenever you change files:
1. Push this `math-bowl-netlify` folder to a GitHub repo.
2. In Netlify: **Add new site** → **Import an existing project** → connect GitHub.
3. Pick the repo. Set **Base directory** to `math-bowl-netlify`,
   **Publish directory** to `math-bowl-netlify/public`. Deploy.

## Part 3 — Test it (~2 min)

1. Open `https://your-site.netlify.app/host.html` on your laptop.
2. Open `https://your-site.netlify.app/team.html` on your phone (cellular, not
   home WiFi — simulates the school network).
3. On phone: pick a name → Join Game. The team should appear on the laptop's
   scoreboard within ~1 second.
4. Laptop: click **Start Game**. Phone: press the buzz button. The laptop
   screen should show "BUZZED IN!" and the timer should start.

If those work, you're done. Send the two URLs to the school.

## Troubleshooting

- **"⚠️ Firebase not configured"** — you didn't paste in your Firebase config
  in step 11. Edit `public/firebase-config.js`, redeploy.
- **Page loads but connection status stays "Connecting…"** — check that
  Realtime Database is enabled in your Firebase project (Part 1, step 6).
- **Teams don't see each other** — confirm both devices are loading the *same*
  Netlify URL, and Firebase Console → Realtime Database shows data appearing.
- **Buzzes feel slow** — Firebase Realtime Database has ~50-150ms latency
  globally. Acceptable for a classroom buzz-in game.
- **"Permission denied" in browser console** — your test-mode rules expired.
  Go to Firebase Console → Realtime Database → Rules → paste the rules from
  Part 1 step 6.

## Costs

Everything here is **free** for classroom use:
- Firebase Spark plan: 100 concurrent connections, 1 GB storage, 10 GB/mo
  transfer. A 30-team classroom is well under all limits.
- Netlify free tier: 100 GB/mo bandwidth, unlimited static deploys.
