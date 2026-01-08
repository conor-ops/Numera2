# Local Development Setup Guide

## ✅ Repository is Fixed!
I've resolved the merge conflicts and updated `.gitignore` to properly exclude Android build artifacts.

## Setting Up Locally (Outside Codespaces)

### 1. Clone the Repository
```bash
git clone https://github.com/conor-ops/Solventless2.git
cd Solventless2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file:
```bash
echo "GEMINI_API_KEY=your-actual-key-here" > .env.local
```

### 4. Run Development Server (Web)
```bash
npm run dev
```
Opens at `http://localhost:3000`

---

## Android Development Setup

### Prerequisites
- **Node.js** v18+ (v24.11.1 recommended)
- **Android Studio** (latest version)
- **Java JDK** 17 or higher
- **Android SDK** (install via Android Studio)

### Steps

#### 1. Build Web Assets First
```bash
npm run build
```

#### 2. Sync to Android
```bash
npx cap sync android
```

#### 3. Open in Android Studio
```bash
npx cap open android
```

### Before Building for Production

**Update RevenueCat Keys** in `services/paymentService.ts`:
```typescript
const API_KEYS = {
  ios: 'appl_YOUR_IOS_KEY_HERE',
  android: 'goog_YOUR_ACTUAL_KEY_HERE', // Replace this!
};
```

**Secure Gemini API Key**:
- ⚠️ For production, move API key to Firebase Cloud Function
- Or restrict in Google Cloud Console to your app's Bundle ID

---

## Common Issues

### "Could not find web assets directory"
**Fix**: Always run `npm run build` before `npx cap sync`

### Android Gradle Build Fails
**Fix**: 
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Port 3000 Already in Use
**Fix**:
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- --port 3001
```

### Changes Not Appearing in Android
**Fix**: Must rebuild after code changes
```bash
npm run build
npx cap sync android
```

---

## What Was Fixed

1. ✅ Resolved merge conflicts in `.github/copilot-instructions.md` and `package-lock.json`
2. ✅ Updated `.gitignore` to exclude:
   - Android Gradle build artifacts (`.gradle/`, `build/`)
   - iOS build artifacts (`Pods/`, `build/`)
   - Capacitor cache
3. ✅ Cleaned up staged Android build files
4. ✅ Pushed clean repository to GitHub

## You Can Now:

- ✅ Clone the repository on any machine
- ✅ Run web development locally
- ✅ Build Android APK/AAB
- ✅ No merge conflicts blocking you

## Quick Commands Reference

```bash
# Web development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Android
npx cap sync android # Sync web build to Android
npx cap open android # Open Android Studio
npx cap run android  # Build and run on device/emulator

# Clean build
rm -rf node_modules dist android/app/build
npm install
npm run build
npx cap sync android
```

---

**Need help?** Check `.github/copilot-instructions.md` for complete development guide!

