const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing BrainSpark for Android build...');

try {
  // Step 1: Build the web app
  console.log('📦 Building web application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Sync with Capacitor
  console.log('🔄 Syncing with Capacitor...');
  execSync('npx cap sync android', { stdio: 'inherit' });

  // Step 3: Check if Android SDK is available
  console.log('🔍 Checking Android SDK...');
  
  const possibleSdkPaths = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    `${process.env.USERPROFILE}\\AppData\\Local\\Android\\Sdk`,
    'C:\\Android\\Sdk',
    'C:\\Program Files\\Android\\Android Studio\\sdk'
  ].filter(Boolean);

  let sdkFound = false;
  let sdkPath = '';

  for (const path of possibleSdkPaths) {
    if (fs.existsSync(path)) {
      sdkFound = true;
      sdkPath = path;
      break;
    }
  }

  if (sdkFound) {
    console.log(`✅ Android SDK found at: ${sdkPath}`);
    
    // Create local.properties file
    const localPropertiesPath = path.join(__dirname, 'android', 'local.properties');
    const localPropertiesContent = `sdk.dir=${sdkPath.replace(/\\/g, '\\\\')}`;
    fs.writeFileSync(localPropertiesPath, localPropertiesContent);
    console.log('📝 Created local.properties file');

    // Try to build APK
    console.log('🤖 Building Android APK...');
    const androidPath = path.join(__dirname, 'android');
    
    if (process.platform === 'win32') {
      execSync('gradlew.bat assembleDebug', { 
        cwd: androidPath, 
        stdio: 'inherit' 
      });
    } else {
      execSync('./gradlew assembleDebug', { 
        cwd: androidPath, 
        stdio: 'inherit' 
      });
    }

    // Find and copy APK
    const apkPath = path.join(androidPath, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    const outputPath = path.join(__dirname, 'brainspark-debug.apk');

    if (fs.existsSync(apkPath)) {
      fs.copyFileSync(apkPath, outputPath);
      console.log('✅ Android APK built successfully!');
      console.log(`📱 APK location: ${outputPath}`);
      console.log('🎉 You can now install this APK on Android devices!');
    } else {
      console.log('❌ APK file not found. Build may have failed.');
    }

  } else {
    console.log('❌ Android SDK not found!');
    console.log('\n📋 Next Steps:');
    console.log('1. Install Android Studio: https://developer.android.com/studio');
    console.log('2. Or use GitHub Actions to build automatically');
    console.log('3. Or open android/ folder in Android Studio manually');
    console.log('\n✅ Web app built and synced successfully!');
    console.log('📁 Android project ready at: ./android/');
    console.log('🔧 You can open this folder in Android Studio to build manually');
  }

} catch (error) {
  console.error('❌ Preparation failed:', error.message);
  console.log('\n💡 Alternative options:');
  console.log('1. Push to GitHub and use GitHub Actions');
  console.log('2. Install Android Studio and try again');
  console.log('3. Open ./android/ folder in Android Studio manually');
}