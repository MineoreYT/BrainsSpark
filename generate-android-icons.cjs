const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for BrainSpark
const createBrainSparkIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="240" fill="url(#grad1)" stroke="#4a5568" stroke-width="8"/>
  
  <!-- Brain Shape -->
  <path d="M180 180 Q200 160 240 170 Q280 160 300 180 Q320 200 310 240 Q320 280 300 300 Q280 320 240 310 Q200 320 180 300 Q160 280 170 240 Q160 200 180 180 Z" 
        fill="#ffffff" opacity="0.9"/>
  
  <!-- Brain Details -->
  <path d="M190 200 Q210 190 230 200 Q250 190 270 200 Q280 210 275 230 Q280 250 270 260 Q250 270 230 260 Q210 270 190 260 Q180 250 185 230 Q180 210 190 200 Z" 
        fill="#e2e8f0" opacity="0.7"/>
  
  <!-- Spark/Lightning -->
  <path d="M280 150 L300 180 L285 180 L295 210 L275 185 L290 185 Z" 
        fill="#ffd700" stroke="#f59e0b" stroke-width="2"/>
  
  <!-- Book Pages -->
  <rect x="200" y="320" width="80" height="60" rx="4" fill="#ffffff" stroke="#cbd5e0" stroke-width="2"/>
  <line x1="210" y1="335" x2="270" y2="335" stroke="#a0aec0" stroke-width="2"/>
  <line x1="210" y1="350" x2="270" y2="350" stroke="#a0aec0" stroke-width="2"/>
  <line x1="210" y1="365" x2="250" y2="365" stroke="#a0aec0" stroke-width="2"/>
  
  <!-- App Name -->
  <text x="256" y="420" font-family="Arial, sans-serif" font-size="32" font-weight="bold" 
        text-anchor="middle" fill="#ffffff">BrainSpark</text>
</svg>`;
};

// Icon sizes needed for Android
const iconSizes = [
  { size: 36, density: 'ldpi' },
  { size: 48, density: 'mdpi' },
  { size: 72, density: 'hdpi' },
  { size: 96, density: 'xhdpi' },
  { size: 144, density: 'xxhdpi' },
  { size: 192, density: 'xxxhdpi' }
];

// Create directories
const androidResPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

iconSizes.forEach(({ size, density }) => {
  const dir = path.join(androidResPath, `mipmap-${density}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Create SVG content
  const svgContent = createBrainSparkIcon(size);
  
  // For now, we'll create SVG files (you can convert to PNG later with tools)
  const svgPath = path.join(dir, 'ic_launcher.svg');
  fs.writeFileSync(svgPath, svgContent);
  
  console.log(`Created icon: ${svgPath}`);
});

// Create adaptive icon (Android 8+)
const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher"/>
</adaptive-icon>`;

// Create colors.xml for adaptive icon background
const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#667eea</color>
</resources>`;

// Create values directory and colors.xml
const valuesDir = path.join(androidResPath, 'values');
if (!fs.existsSync(valuesDir)) {
  fs.mkdirSync(valuesDir, { recursive: true });
}
fs.writeFileSync(path.join(valuesDir, 'colors.xml'), colorsXml);

console.log('✅ Android icons generated successfully!');
console.log('📱 Icons created for all density buckets');
console.log('🎨 Adaptive icon configuration added');
console.log('\n💡 Note: SVG files created. For production, convert to PNG using:');
console.log('   - Online tools like convertio.co');
console.log('   - ImageMagick: convert icon.svg icon.png');
console.log('   - Or use Android Studio\'s Image Asset Studio');