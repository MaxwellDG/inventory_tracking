# Quick Start: Release to Play Store

## ✅ What's Already Done
- ✅ Package name configured: `com.jajamundo.inventorytracking`
- ✅ Version set: `1.0.0` (versionCode: 1)
- ✅ App icons configured
- ✅ Expo project structure

## 🚀 Recommended Approach: EAS Build

EAS Build is the easiest way to build and release Expo apps. Here's what to do:

### 1. Install EAS CLI (one-time)
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

Don't have an account? Sign up at [expo.dev](https://expo.dev) (it's free!)

### 3. Configure EAS
```bash
eas build:configure
```

This creates an `eas.json` file with build profiles.

### 4. Build for Production
```bash
eas build --platform android --profile production
```

This will:
- Ask you to create/use a keystore (EAS can generate it for you)
- Build your app in the cloud
- Give you a download link for the AAB file

**⏱️ Build takes about 10-20 minutes**

### 5. Download the AAB
- Click the link provided or visit [expo.dev/accounts/[your-username]/projects/inventory-tracking/builds](https://expo.dev)
- Download the `.aab` file

### 6. Upload to Play Console
1. Go to [Google Play Console](https://play.google.com/console/) ($25 one-time fee)
2. Create a new app
3. Complete the store listing (description, screenshots, etc.)
4. Go to Release → Production → Create new release
5. Upload your AAB file
6. Submit for review

## 📱 What You Need for Play Console

### Required Assets:
1. **App Icon**: 512x512 PNG (you can export from your current icon)
2. **Feature Graphic**: 1024x500 JPG or PNG
3. **Screenshots**: At least 2 (recommended 4-8)
   - Take screenshots from your app running on a device/emulator
   - Minimum: 320px on shortest side
   - Recommended: Phone + Tablet screenshots

### Required Information:
1. **App Name**: "Inventory Tracking" or your preferred name
2. **Short Description**: 80 characters max
3. **Full Description**: Up to 4000 characters
4. **Privacy Policy**: URL to your privacy policy (must host somewhere)
5. **Content Rating**: Complete the questionnaire
6. **App Category**: Choose appropriate category (e.g., Business, Productivity)

## 🎬 Full Process (Step by Step)

1. **Install & Login** (5 minutes)
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure & Build** (15-20 minutes)
   ```bash
   eas build:configure
   eas build --platform android --profile production
   ```

3. **Create Play Console Account** (15 minutes)
   - Visit play.google.com/console
   - Pay $25 registration fee
   - Set up developer profile

4. **Prepare Assets** (30-60 minutes)
   - Create/export app icon (512x512)
   - Design feature graphic (1024x500)
   - Take screenshots (4-8 images)
   - Write descriptions
   - Create privacy policy

5. **Complete Store Listing** (30 minutes)
   - Fill in all required fields
   - Upload all assets
   - Complete content rating
   - Set pricing and distribution

6. **Upload & Submit** (10 minutes)
   - Download AAB from EAS
   - Upload to Play Console
   - Write release notes
   - Submit for review

7. **Wait for Review** (1-7 days)
   - Google reviews your app
   - You'll get email notifications
   - App goes live once approved!

## 💰 Costs

- **EAS Build Free Tier**: 30 builds/month (plenty for most developers)
- **Google Play Registration**: $25 (one-time fee)
- **Total to get started**: $25

## ⚠️ Important Notes

1. **Test First**: Before building for production, test your app thoroughly
   ```bash
   npx expo run:android
   ```

2. **Privacy Policy**: You MUST have a privacy policy URL. Can use:
   - Your own website
   - GitHub Pages
   - Privacy policy generators online

3. **Content Rating**: Complete the IARC questionnaire honestly

4. **Keystore**: EAS manages this for you, but keep your Expo account secure!

5. **Updates**: For each new version:
   - Update `version` in `app.json` (e.g., "1.0.0" → "1.0.1")
   - Update `versionCode` in `app.json` (e.g., 1 → 2)
   - Rebuild and resubmit

## 🔄 For Future Updates

```bash
# 1. Update version in app.json
# version: "1.0.0" → "1.0.1"
# versionCode: 1 → 2

# 2. Build new version
eas build --platform android --profile production

# 3. Upload to Play Console
# Download new AAB and upload as update
```

## 📚 Need More Details?

See the full guide: `PLAYSTORE_RELEASE_GUIDE.md`

## 🆘 Getting Help

- EAS Build Issues: [docs.expo.dev/build-reference/troubleshooting](https://docs.expo.dev/build-reference/troubleshooting/)
- Play Console Help: [support.google.com/googleplay/android-developer](https://support.google.com/googleplay/android-developer)
- Expo Forums: [forums.expo.dev](https://forums.expo.dev)

---

**Ready to start? Run this now:**
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile production
```

Good luck! 🚀

