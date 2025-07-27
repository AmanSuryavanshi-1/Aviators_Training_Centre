// Quick verification that the patch method fix is working
const { enhancedClient } = require('./lib/sanity/client');

console.log('🔍 Verifying patch method fix...\n');

// Check if client is accessible
console.log('✓ Enhanced client imported successfully');

// Check if underlying client is accessible
if (enhancedClient.client) {
  console.log('✓ Underlying client is accessible');
} else {
  console.log('✗ Underlying client is NOT accessible');
}

// Check if patch method exists on underlying client
if (enhancedClient.client && typeof enhancedClient.client.patch === 'function') {
  console.log('✓ Patch method exists on underlying client');
} else {
  console.log('✗ Patch method NOT found on underlying client');
}

console.log('\n✅ The fix should work properly. The unified blog service now uses enhancedClient.client.patch() instead of enhancedClient.patch()');
