# RPS Mobile (Expo / React Native)

This is the Android port of the Rock Paper Scissors web app. It talks to the same
Socket.IO server hosted at `https://rps-hastagfuggi.onrender.com`.

## What's different from the web build

- **Styling**: NativeWind (Tailwind for React Native). Most classes carry over.
- **Storage**: `AsyncStorage` instead of `localStorage`.
- **Audio**: stubbed. The web version generates tones with the Web Audio API,
  which has no native equivalent. The `sounds.*` API is preserved as no-ops so
  game code is unchanged. To add sounds later, ship `.mp3` files under `assets/`
  and play them with `expo-av`.
- **Share invite**: room key is shared via the native share sheet (`Share.share`).
  Deep linking is not configured — friends type the key in.

## Install dependencies

```powershell
cd mobile
npm install
```

## Run in dev (Expo Go)

```powershell
npx expo start
```

Scan the QR with the Expo Go app on Android. The app will connect to the
production Render server.

## Build an APK

You need an [Expo account](https://expo.dev/signup) — free.

### 1. Install EAS CLI (once)

```powershell
npm install -g eas-cli
eas login
```

### 2. Initialise the project on EAS (once)

From inside `mobile/`:

```powershell
eas init
```

This writes a real `projectId` into `app.json` (replacing the `REPLACE_WITH_YOUR_EAS_PROJECT_ID` placeholder).

### 3. Build the APK

```powershell
eas build --profile preview --platform android
```

Wait ~10–20 min. When the build finishes EAS prints a download URL — download the
`.apk` from there.

### 4. Wire it into the website download button

Place the downloaded file at:

```
public/rps.apk
```

(the `public/` folder at the repo root, not under `mobile/`). The Node server
serves `/downloads/rps.apk` from that folder, which is what the **Download
Android APK** button on the web menu links to.

Then redeploy the web app (Render auto-deploys on push) — though note that
`public/rps.apk` is gitignored by default in most flows; you'll need to either
commit it (large file warning — APKs are 20–80 MB), use Git LFS, or upload it
out-of-band to the Render disk.

### Alternative: host the APK on GitHub Releases

If you don't want a large file in the repo, change the button's `href` in
`src/game/Menu.jsx` from `/downloads/rps.apk` to the GitHub release asset URL.

## Local APK build (advanced)

If you have Android Studio + JDK 17 installed:

```powershell
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

The signed APK lands at `android/app/build/outputs/apk/release/app-release.apk`.

## File map

- `App.jsx` — root, hydrates storage and font, switches screens
- `src/game/Menu.jsx` — name/variant/match-length picker + mode buttons
- `src/game/CpuGame.jsx` — solo vs CPU
- `src/game/FriendsLobby.jsx` — create/join room
- `src/game/FriendGame.jsx` — multiplayer match
- `src/socket.js` — Socket.IO client pointed at the Render server
- `src/storage.js` — AsyncStorage-backed name/stats
- `src/audio.js` — muted-flag + sound stubs
