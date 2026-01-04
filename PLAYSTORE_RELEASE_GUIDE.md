# Google Play Store Release Guide for Expo App

## Overview
This is an Expo project. You have two options for building and releasing:
1. **EAS Build** (Recommended - easier, cloud-based)
2. **Local Build** (Traditional method)

---

## 🚀 Option 1: EAS Build (Recommended)

EAS (Expo Application Services) handles building, signing, and submitting your app.

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

If you don't have an account, create one at [expo.dev](https://expo.dev)

### Step 3: Configure EAS Build

```bash
eas build:configure
```

This creates `eas.json` in your project root.

### Step 4: Update app.json Configuration

Update your `app.json` with proper identifiers:

```json
{
  "expo": {
    "name": "Restaurant Tracking",
    "slug": "restaurant-tracking",
    "version": "1.0.0",
    "android": {
      "package": "com.yourdomain.restauranttracking",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      }
    }
  }
}
```

**Important**: Change `com.yourdomain` to your actual domain (reversed).

### Step 5: Build for Production

Build an AAB (Android App Bundle) for Play Store:

```bash
eas build --platform android --profile production
```

EAS will:
- Generate signing credentials automatically (or you can provide your own)
- Build your app in the cloud
- Provide a download link for the AAB file

### Step 6: Download Your AAB

Once the build completes, download the `.aab` file from the link provided.

### Step 7: Submit to Play Store (Optional - Automated)

EAS can even submit for you:

```bash
eas submit --platform android
```

You'll need:
- Google Play Console access
- Service account JSON key from Play Console

---

## 🔧 Option 2: Local Build (Traditional Method)

If you prefer to build locally without EAS:

### Step 1: Generate Release Keystore

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias release-key -keyalg RSA -keysize 2048 -validity 10000
```

**SAVE YOUR PASSWORDS!** You cannot recover them.

### Step 2: Configure Signing

Add to `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_KEY_ALIAS=release-key
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

### Step 3: Update build.gradle

In `android/app/build.gradle`, update the release signing config:

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}

buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }
    release {
        signingConfig signingConfigs.release  // Changed from debug!
        minifyEnabled enableMinifyInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

### Step 4: Update Application ID

In `android/app/build.gradle`, change:
```gradle
applicationId 'com.yourdomain.restauranttracking'  // Line 92
```

### Step 5: Build Release AAB

```bash
cd android
./gradlew bundleRelease
```

Your AAB will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 📱 Google Play Console Setup (Both Options)

### 1. Create Play Console Account

- Go to [Google Play Console](https://play.google.com/console/)
- Pay $25 one-time registration fee
- Create developer account

### 2. Create New App

1. Click "Create app"
2. Fill in:
   - App name: "Restaurant Tracking" (or your desired name)
   - Default language
   - App or Game: App
   - Free or paid: (your choice)
3. Accept policies and click "Create app"

### 3. Complete Store Listing

**Main Store Listing** (`App Details` → `Store listing`):
- Short description (80 chars max)
- Full description (4000 chars max)
- App icon (512x512 PNG)
- Feature graphic (1024x500 JPG/PNG)
- Screenshots (at least 2, recommended: phone, tablet, 7-inch tablet)

**Categorization**:
- App category (e.g., Business, Productivity)
- Tags
- Content rating questionnaire

### 4. Set Up App

**Privacy Policy**: 
- Required! Host on a website and provide URL
- Include data collection practices

**App Access**:
- Specify if special access is needed
- Provide demo credentials if required

**Ads**:
- Declare if your app contains ads

**Content Rating**:
- Complete IARC questionnaire
- Get age ratings for different regions

**Target Audience**:
- Select target age groups

**News Apps** (if applicable):
- Declare if it's a news app

### 5. Upload Your App

1. Go to `Release` → `Production` → `Create new release`
2. Upload your AAB file
3. Add release notes (what's new)
4. Review and save
5. Click "Review release"
6. Click "Start rollout to Production"

### 6. Review Process

- Google reviews your app (typically 1-7 days)
- You'll receive email notifications
- Check Play Console dashboard for status
- Once approved, your app goes live!

---

## 📋 Pre-Release Checklist

### Before Building:
- [ ] Updated `applicationId` / `package` to your domain
- [ ] Set correct `version` / `versionCode`
- [ ] Updated app name and description
- [ ] Prepared app icon (512x512)
- [ ] Prepared feature graphic (1024x500)
- [ ] Taken screenshots (minimum 2)
- [ ] Created privacy policy

### Before Submitting:
- [ ] Tested the release build thoroughly
- [ ] Completed all Play Console sections
- [ ] Set up content rating
- [ ] Added store listing assets
- [ ] Reviewed app permissions
- [ ] Prepared release notes

### Security:
- [ ] Keystore backed up (if local build)
- [ ] Passwords saved securely
- [ ] Keystore NOT in version control
- [ ] gradle.properties NOT committed

---

## 🎯 Version Management

**For each update**:

1. In `app.json` or `android/app/build.gradle`:
   - Increment `versionCode` (e.g., 1 → 2 → 3)
   - Update `versionName` (e.g., "1.0.0" → "1.0.1" → "1.1.0")

2. Semantic versioning:
   - MAJOR.MINOR.PATCH (e.g., 1.0.0)
   - Patch: Bug fixes (1.0.0 → 1.0.1)
   - Minor: New features (1.0.1 → 1.1.0)
   - Major: Breaking changes (1.1.0 → 2.0.0)

---

## ⚡ Quick Command Reference

### EAS Build
```bash
# Initial setup
npm install -g eas-cli
eas login
eas build:configure

# Build for production
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android

# Check build status
eas build:list
```

### Local Build
```bash
# Build release AAB
cd android && ./gradlew bundleRelease

# Build release APK (for testing)
cd android && ./gradlew assembleRelease

# Clean build
cd android && ./gradlew clean
```

### Expo
```bash
# Run in development
npx expo start

# Run on Android
npx expo run:android

# Prebuild (regenerate android folder)
npx expo prebuild --platform android
```

---

## 🐛 Common Issues

### Issue: "App not signed"
**Solution**: 
- EAS: Credentials are managed automatically
- Local: Verify passwords in gradle.properties match your keystore

### Issue: "Version code must be higher"
**Solution**: Increment `versionCode` in app.json or build.gradle

### Issue: "Missing required assets"
**Solution**: Play Store requires:
- App icon (512x512)
- Feature graphic (1024x500)
- At least 2 screenshots

### Issue: "Privacy policy required"
**Solution**: Create and host a privacy policy, add URL in Play Console

### Issue: "Build failed on EAS"
**Solution**: 
- Check build logs in EAS dashboard
- Ensure all dependencies are compatible
- Try: `npx expo install --check`

---

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Expo App Configuration](https://docs.expo.dev/versions/latest/config/app/)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)

---

## 💡 Recommendations

1. **Use EAS Build** - It's simpler and handles credentials securely
2. **Test thoroughly** - Install the release build on multiple devices
3. **Start with internal testing** - Use Play Console's internal testing track first
4. **Gradual rollout** - Release to a percentage of users initially
5. **Monitor reviews** - Respond to user feedback quickly
6. **Keep keystores safe** - If using local builds, backup your keystore!

---

Good luck with your release! 🚀
