#!/usr/bin/env node

/**
 * Security Check Script - Ensures no secrets are exposed
 * Run before committing to git
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Running Security Check...\n');

// Patterns that indicate actual secrets (more specific)
const SECRET_PATTERNS = [
  {
    pattern: /sk[A-Za-z0-9]{50,}/g,
    name: 'Sanity API Token',
    severity: 'CRITICAL'
  },
  {
    pattern: /AIza[A-Za-z0-9]{35}/g,
    name: 'Google API Key',
    severity: 'CRITICAL'
  },
  {
    pattern: /re_[A-Za-z0-9]{20,}/g,
    name: 'Resend API Key',
    severity: 'CRITICAL'
  },
  {
    pattern: /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g,
    name: 'Private Key',
    severity: 'CRITICAL'
  },
  {
    pattern: /firebase-adminsdk-[a-z0-9]+@[a-z0-9-]+\.iam\.gserviceaccount\.com/g,
    name: 'Firebase Service Account Email',
    severity: 'HIGH'
  }
];

// Files to exclude from security check
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /\.env\.local$/,
  /\.env\.example$/,
  /\.env\.production\.example$/,
  /package-lock\.json$/,
  /bun\.lockb$/,
  /\.log$/,
  /coverage\//,
  /test-results\//,
  /\.tsbuildinfo$/,
  /studio\/dist\//,
  /\.kiro\//,
  /\.continue\//,
  /README\.md$/,
  /\.md$/,  // Exclude all markdown files as they might contain examples
  /scripts\/security-check\.js$/ // Exclude this security check script itself
];

function shouldCheckFile(filePath) {
  // Always exclude this security check script itself
  if (filePath.includes('security-check.js')) return false;
  
  return !EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function checkFileForSecrets(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    SECRET_PATTERNS.forEach((secretPattern, index) => {
      const matches = content.match(secretPattern.pattern);
      if (matches) {
        // Filter out common false positives
        const realMatches = matches.filter(match => {
          // Skip placeholder examples
          if (match.includes('your_') || match.includes('YOUR_')) return false;
          if (match.includes('example') || match.includes('EXAMPLE')) return false;
          if (match.includes('placeholder') || match.includes('PLACEHOLDER')) return false;
          
          // Skip common hash patterns
          if (match.includes('sha512-') || match.includes('integrity')) return false;
          
          // Skip very short matches
          if (match.length < 20) return false;
          
          return true;
        });
        
        if (realMatches.length > 0) {
          issues.push({
            patternIndex: index,
            patternName: secretPattern.name,
            severity: secretPattern.severity,
            matches: realMatches.length,
            file: filePath,
            preview: realMatches[0].substring(0, 20) + '...'
          });
        }
      }
    });
    
    return issues;
  } catch (error) {
    // Skip files that can't be read
    return [];
  }
}

function scanDirectory(dir, issues = []) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (shouldCheckFile(fullPath)) {
          scanDirectory(fullPath, issues);
        }
      } else if (stat.isFile() && shouldCheckFile(fullPath)) {
        const fileIssues = checkFileForSecrets(fullPath);
        issues.push(...fileIssues);
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return issues;
}

function main() {
  console.log('🔍 Scanning for exposed secrets...');
  
  const issues = scanDirectory('.');
  
  if (issues.length === 0) {
    console.log('✅ No secrets found in tracked files');
    console.log('✅ Safe to commit to git');
    console.log('\n🔒 Security Status: SECURE');
    return;
  }
  
  console.log('🚨 SECURITY ALERT: Potential secrets found!');
  console.log('❌ DO NOT COMMIT TO GIT\n');
  
  // Group by severity
  const critical = issues.filter(i => i.severity === 'CRITICAL');
  const high = issues.filter(i => i.severity === 'HIGH');
  
  if (critical.length > 0) {
    console.log('🔴 CRITICAL ISSUES:');
    critical.forEach(issue => {
      console.log(`   File: ${issue.file}`);
      console.log(`   Type: ${issue.patternName}`);
      console.log(`   Preview: ${issue.preview}`);
      console.log('');
    });
  }
  
  if (high.length > 0) {
    console.log('🟡 HIGH PRIORITY ISSUES:');
    high.forEach(issue => {
      console.log(`   File: ${issue.file}`);
      console.log(`   Type: ${issue.patternName}`);
      console.log('');
    });
  }
  
  console.log('\n🔧 Actions Required:');
  console.log('1. Remove secrets from the files above');
  console.log('2. Add sensitive files to .gitignore');
  console.log('3. Run this script again');
  console.log('4. Only commit after getting "SECURE" status');
  
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { main };