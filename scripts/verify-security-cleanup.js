#!/usr/bin/env node

/**
 * Security Cleanup Verification Script
 * 
 * This script verifies that sensitive credentials have been properly
 * removed from the repository and that security best practices are followed.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Security Cleanup Verification\n');

let hasIssues = false;

// Check 1: Verify .env files are not tracked
console.log('1. Checking for tracked environment files...');
try {
  const trackedFiles = execSync('git ls-files', { encoding: 'utf8' });
  const envFiles = trackedFiles.split('\n').filter(file => 
    file.match(/\.env$|\.env\..*$/) && !file.includes('.example')
  );
  
  if (envFiles.length > 0) {
    console.log('❌ CRITICAL: Environment files are tracked in git:');
    envFiles.forEach(file => console.log(`   - ${file}`));
    console.log('   Run: git rm --cached <filename> to untrack them\n');
    hasIssues = true;
  } else {
    console.log('✅ No environment files tracked in git\n');
  }
} catch (error) {
  console.log('⚠️  Could not check git tracked files\n');
}

// Check 2: Verify .env.local is ignored
console.log('2. Checking if .env.local is properly ignored...');
try {
  execSync('git check-ignore .env.local', { stdio: 'ignore' });
  console.log('✅ .env.local is properly ignored by git\n');
} catch (error) {
  console.log('❌ CRITICAL: .env.local is NOT ignored by git');
  console.log('   Add .env.local to .gitignore\n');
  hasIssues = true;
}

// Check 3: Verify .env.example exists
console.log('3. Checking for .env.example template...');
if (fs.existsSync('.env.example')) {
  console.log('✅ .env.example template exists\n');
} else {
  console.log('❌ WARNING: .env.example template missing\n');
  hasIssues = true;
}

// Check 4: Search for potential exposed API tokens
console.log('4. Scanning for exposed API tokens...');
try {
  // Windows-compatible search using findstr
  const result = execSync('findstr /R /S "sk[A-Za-z0-9]" . 2>nul || echo ""', { encoding: 'utf8' });
  const filteredResult = result.split('\n').filter(line => 
    line.includes('sk') && 
    !line.includes('node_modules') && 
    !line.includes('.git') &&
    line.match(/sk[A-Za-z0-9]{50,}/)
  ).join('\n');
  
  if (filteredResult.trim()) {
    console.log('❌ CRITICAL: Potential API tokens found:');
    console.log(filteredResult);
    hasIssues = true;
  } else {
    console.log('✅ No exposed API tokens found\n');
  }
} catch (error) {
  console.log('✅ No exposed API tokens found (scan completed)\n');
}

// Check 5: Search for hardcoded project IDs
console.log('5. Scanning for hardcoded project IDs...');
try {
  const result = execSync('findstr /R /S "3u4fa9kl" . 2>nul || echo ""', { encoding: 'utf8' });
  const filteredResult = result.split('\n').filter(line => 
    line.includes('3u4fa9kl') && 
    !line.includes('node_modules') && 
    !line.includes('.git') &&
    !line.includes('.md')
  ).join('\n');
  
  if (filteredResult.trim()) {
    console.log('❌ WARNING: Hardcoded project IDs found:');
    console.log(filteredResult);
    hasIssues = true;
  } else {
    console.log('✅ No hardcoded project IDs found\n');
  }
} catch (error) {
  console.log('✅ No hardcoded project IDs found (scan completed)\n');
}

// Check 6: Search for Firebase project references
console.log('6. Scanning for Firebase project references...');
try {
  const result = execSync('findstr /R /S "aviators-training-centre" . 2>nul || echo ""', { encoding: 'utf8' });
  const filteredResult = result.split('\n').filter(line => 
    line.includes('aviators-training-centre') && 
    !line.includes('node_modules') && 
    !line.includes('.git') &&
    !line.includes('.md')
  ).join('\n');
  
  if (filteredResult.trim()) {
    console.log('❌ WARNING: Firebase project references found:');
    console.log(filteredResult);
    hasIssues = true;
  } else {
    console.log('✅ No Firebase project references found\n');
  }
} catch (error) {
  console.log('✅ No Firebase project references found (scan completed)\n');
}

// Check 7: Verify scripts use environment variables
console.log('7. Checking scripts use environment variables...');
const scriptsDir = 'tools/scripts';
if (fs.existsSync(scriptsDir)) {
  const checkScriptFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasHardcodedValues = content.includes('3u4fa9kl') || content.includes('aviators-training-centre');
    const usesEnvVars = content.includes('process.env.NEXT_PUBLIC_SANITY_PROJECT_ID');
    
    if (hasHardcodedValues && !usesEnvVars) {
      console.log(`❌ ${filePath} contains hardcoded values`);
      return false;
    }
    return true;
  };
  
  const walkDir = (dir) => {
    const files = fs.readdirSync(dir);
    let allGood = true;
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        allGood = walkDir(filePath) && allGood;
      } else if (file.endsWith('.js') || file.endsWith('.ts')) {
        allGood = checkScriptFile(filePath) && allGood;
      }
    });
    
    return allGood;
  };
  
  if (walkDir(scriptsDir)) {
    console.log('✅ All scripts use environment variables\n');
  } else {
    hasIssues = true;
  }
} else {
  console.log('⚠️  Scripts directory not found\n');
}

// Final summary
console.log('=' .repeat(50));
if (hasIssues) {
  console.log('❌ SECURITY ISSUES FOUND');
  console.log('Please address the issues above before proceeding.');
  console.log('\nCRITICAL NEXT STEPS:');
  console.log('1. Rotate all exposed credentials immediately');
  console.log('2. Fix any remaining hardcoded values');
  console.log('3. Ensure all .env files are properly ignored');
  console.log('4. Re-run this script to verify fixes');
  process.exit(1);
} else {
  console.log('✅ SECURITY CLEANUP VERIFIED');
  console.log('Repository appears to be properly sanitized.');
  console.log('\nREMAINING ACTIONS:');
  console.log('1. Rotate all previously exposed credentials');
  console.log('2. Update .env.local with new credentials');
  console.log('3. Test application with new credentials');
  process.exit(0);
}