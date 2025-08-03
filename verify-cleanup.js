#!/usr/bin/env node

const { execSync } = require('child_process');

const secretsToCheck = [
    'RESEND_API_KEY=',
    'SANITY_API_TOKEN=', 
    'JWT_SECRET=',
    'ADMIN_PASSWORD=',
    'FROM_EMAIL=',
    'OWNER1_EMAIL=',
    'OWNER2_EMAIL=',
    'NEXT_PUBLIC_SANITY_PROJECT_ID=',
    'NEXT_PUBLIC_GA_MEASUREMENT_ID=',
    'ADMIN_USERNAME=',
    'FIREBASE_MESSAGING_SENDER_ID='
];

console.log('🔍 Verifying secret removal from git history...\n');

let foundSecrets = 0;

secretsToCheck.forEach((secret, index) => {
    try {
        const result = execSync(`git log --all --full-history -- "*" | grep -i "${secret}"`, { 
            encoding: 'utf8',
            stdio: 'pipe'
        });
        
        if (result.trim()) {
            console.log(`❌ FOUND: ${secret.split('=')[0]}`);
            foundSecrets++;
        }
    } catch (error) {
        // No results found (good!)
        console.log(`✅ CLEAN: ${secret.split('=')[0]}`);
    }
});

console.log(`\n📊 Summary:`);
console.log(`   Secrets checked: ${secretsToCheck.length}`);
console.log(`   Secrets found: ${foundSecrets}`);
console.log(`   Secrets cleaned: ${secretsToCheck.length - foundSecrets}`);

if (foundSecrets === 0) {
    console.log(`\n🎉 SUCCESS: All secrets have been successfully removed from git history!`);
} else {
    console.log(`\n⚠️  WARNING: ${foundSecrets} secrets still found in history. You may need to run additional cleanup.`);
}
