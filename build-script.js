/**
 * Build script for StageQuest frontend
 * Run this before deploying with Docker
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('🔨 Building StageQuest frontend...');

try {
  // Run the build command
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run docker-compose up -d to start the containers');
  console.log('2. Access the application at http://localhost');
} catch (error) {
  console.error('❌ Build failed!');
  console.error(error);
  process.exit(1);
}
