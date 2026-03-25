const fs = require('fs');
const path = require('path');

const buildGradle = path.join(__dirname, '../android/app/build.gradle');
let content = fs.readFileSync(buildGradle, 'utf8');

// Bump versionCode
content = content.replace(/versionCode (\d+)/, (_, n) => {
  const next = parseInt(n) + 1;
  console.log(`versionCode: ${n} → ${next}`);
  return `versionCode ${next}`;
});

// Bump versionName patch
content = content.replace(/versionName "(\d+)\.(\d+)\.(\d+)"/, (_, major, minor, patch) => {
  const next = `${major}.${minor}.${parseInt(patch) + 1}`;
  console.log(`versionName: ${major}.${minor}.${patch} → ${next}`);
  return `versionName "${next}"`;
});

fs.writeFileSync(buildGradle, content);
