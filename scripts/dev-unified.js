#!/usr/bin/env node
/**
 * Unified Development Server
 * Runs only the Next.js app with embedded studio (matches production)
 */

const { spawn } = require('child_process');

console.log('🚀 Starting Unified Development Server...');
console.log('📋 This matches your production environment exactly');
console.log('');
console.log('🔧 Starting Next.js with embedded Sanity Studio...');

const nextProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

nextProcess.on('close', (code) => {
  console.log(`\n📋 Development server stopped with code ${code}`);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development server...');
  nextProcess.kill('SIGINT');
  process.exit(0);
});

console.log('');
console.log('✅ Development server starting...');
console.log('🌐 Website: http://localhost:3000 (or next available port)');
console.log('🎨 Studio: http://localhost:3000/studio');
console.log('⚙️  Admin: http://localhost:3000/studio/admin');
console.log('');
console.log('📋 Flow: /admin → /studio → authenticate → ATC Admin button → /studio/admin');
console.log('');
console.log('💡 This setup matches your production environment exactly!');
console.log('🚫 Do NOT run the standalone studio (cd studio && npm run dev)');
console.log('✅ Only use the embedded studio at /studio');