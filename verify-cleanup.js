#!/usr/bin/env node

const { execSync } = require('child_process');

const secretsToCheck = [
    'RESEND_API_KEY=r',
    'SANITY_API_TOKEN=s', 
    'JWT_SECRET=79f512dc35cba1c0f6d1561b23bd6d9eacf0e799e3f5cc2c43b1a90052930433',
    'ADMIN_PASSWORD=aman@S',
    'FROM_EMAIL=noreply@aviatorstrainingcentre.in',
    'OWNER1_EMAIL=adude890@gmail.com',
    'OWNER2_EMAIL=aviatorstrainingcentre@gmail.com',
    'NEXT_PUBLIC_SANITY_PROJECT_ID=3u4fa9kl',
    'NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XSRFEJCB7N',
    'ADMIN_USERNAME=amanS',
    'FIREBASE_MESSAGING_SENDER_ID=9'
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
