# BrainSpark Android App Build Guide

This guide explains how to build BrainSpark as an Android APK using Capacitor.

## Prerequisites

- Node.js 16+ and npm
- Java Development Kit (JDK) 17
- Android Studio (recommended) or Android SDK Command Line Tools
- Android SDK Build Tools

## Quick Build

### Option 1: Automated Build Script
```bash
npm run build:android
```

This will:
1. Build the web application
2. Sync with Capacitor
3. Build the Android APK
4. Copy the APK to the root directory as `brainspark-debug.apk`

### Option 2: Manual Steps
```bash
# 1. Build web app
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Open in Android Studio (optional)
npx cap open android

# 4. Build APK manually
cd android
./gradlew assembleDebug  # Linux/Mac
gradlew.bat assembleDebug  # Windows
```

## APK Location

After building, the APK will be located at:
- **Automated script**: `brainspark-debug.apk` (root directory)
- **Manual build**: `android/app/build/outputs/apk/debug/app-debug.apk`

## Installation

1. **Enable Unknown Sources**: On your Android device, go to Settings > Security > Enable "Install from unknown sources"
2. **Transfer APK**: Copy the APK file to your Android device
3. **Install**: Tap the APK file and follow the installation prompts

## GitHub Actions

The repository includes automated APK building via GitHub Actions:

- **Trigger**: Push to main/master branch or manual workflow dispatch
- **Output**: APK available as downloadable artifact
- **Releases**: Automatic releases with APK attachments

## App Configuration

### App Details
- **App Name**: Brain Spark
- **Package ID**: com.brainspark.app
- **Target SDK**: Android 14 (API 34)
- **Min SDK**: Android 7.0 (API 24)

### Features
- 📚 Offline-capable educational platform
- 📱 Native Android UI components
- 🔔 Push notifications (when implemented)
- 📁 File system access for lesson attachments
- 🔐 Secure authentication with Firebase

## Customization

### App Icon
Icons are generated automatically using `generate-android-icons.cjs`:
```bash
node generate-android-icons.cjs
```

### App Name & Package
Edit `capacitor.config.json`:
```json
{
  "appId": "com.brainspark.app",
  "appName": "Brain Spark",
  "webDir": "dist"
}
```

### Permissions
Edit `android/app/src/main/AndroidManifest.xml` to add required permissions:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## Troubleshooting

### Common Issues

1. **Java Version**: Ensure JDK 17 is installed and JAVA_HOME is set
2. **Android SDK**: Make sure Android SDK is properly installed
3. **Gradle Issues**: Try `cd android && ./gradlew clean` then rebuild
4. **Memory Issues**: Increase heap size in `android/gradle.properties`:
   ```
   org.gradle.jvmargs=-Xmx4096m
   ```

### Build Errors

- **"SDK location not found"**: Set ANDROID_HOME environment variable
- **"Execution failed for task"**: Check Android SDK and build tools versions
- **"Out of memory"**: Increase Gradle heap size

## Production Build

For production APK (smaller size, optimized):
```bash
cd android
./gradlew assembleRelease
```

**Note**: Production builds require signing with a keystore.

## App Store Deployment

To deploy to Google Play Store:
1. Create a signed release APK
2. Create a Google Play Console account
3. Upload APK and fill out store listing
4. Submit for review

## Support

For issues with the Android build:
1. Check this documentation
2. Review Capacitor documentation: https://capacitorjs.com/docs
3. Open an issue on the GitHub repository