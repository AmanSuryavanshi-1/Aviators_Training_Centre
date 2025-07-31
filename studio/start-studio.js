#!/usr/bin/env node

/**
 * Studio Startup Script
 * Starts the Sanity Studio on an available port
 */

import { spawn } from 'child_process';
import net from 'net';

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Function to find an available port
async function findAvailablePort(startPort = 3333) {
  for (let port = startPort; port <= startPort + 10; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No available ports found');
}

// Main function
async function startStudio() {
  try {
    console.log('🔍 Checking for available ports...');
    
    const port = await findAvailablePort(3333);
    console.log(`✅ Found available port: ${port}`);
    console.log(`🚀 Starting Sanity Studio on http://localhost:${port}`);
    
    // Start the studio with the available port
    const studio = spawn('npx', ['sanity', 'dev', '--port', port.toString()], {
      stdio: 'inherit',
      shell: true
    });
    
    studio.on('error', (error) => {
      console.error('❌ Failed to start studio:', error);
    });
    
    studio.on('close', (code) => {
      console.log(`Studio process exited with code ${code}`);
    });
    
    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down studio...');
      studio.kill('SIGINT');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error starting studio:', error.message);
    process.exit(1);
  }
}

startStudio();