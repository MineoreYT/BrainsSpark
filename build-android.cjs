const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting BrainSpark Android build process...');

try {
  // Step 1: Build the web app
  console.log('📦 Building web application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Sync with Capacitor
  console.log('🔄 Syncing with Capacitor...');
  execSync('npx cap sync android', { stdio: 'inherit' });

  // Step 3: Build Android APK
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

  // Step 4: Find and copy APK
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

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}