/**
 * Script to set up Sanity webhooks for content updates
 * Run this script to configure webhooks in your Sanity project
 */

const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false
})

// Webhook configuration
const webhookConfig = {
  name: 'Blog Content Updates',
  url: process.env.SANITY_WEBHOOK_URL || 'https://your-domain.com/api/webhooks/sanity',
  httpMethod: 'POST',
  apiVersion: '2024-01-01',
  includeDrafts: false,
  headers: {
    'Content-Type': 'application/json'
  },
  // Filter for blog-related documents
  filter: '_type in ["post", "category", "author", "tag"]',
  // Webhook events to listen for
  triggers: [
    'create',
    'update', 
    'delete',
    'publish',
    'unpublish'
  ],
  // Include specific fields in webhook payload
  projection: `{
    _id,
    _type,
    _rev,
    title,
    slug,
    featured,
    featuredOnHome,
    publishedAt,
    category->{title, slug},
    author->{name, slug},
    webhook {
      event,
      timestamp
    }
  }`
}

async function setupWebhooks() {
  try {
    console.log('🔗 Setting up Sanity webhooks...')
    
    // Check if webhook already exists
    const existingWebhooks = await client.request({
      url: '/hooks',
      method: 'GET'
    })
    
    const existingWebhook = existingWebhooks.find(hook => 
      hook.name === webhookConfig.name || hook.url === webhookConfig.url
    )
    
    if (existingWebhook) {
      console.log('📝 Updating existing webhook...')
      
      const updatedWebhook = await client.request({
        url: `/hooks/${existingWebhook.id}`,
        method: 'PUT',
        body: webhookConfig
      })
      
      console.log('✅ Webhook updated successfully!')
      console.log('Webhook ID:', updatedWebhook.id)
      console.log('Webhook URL:', updatedWebhook.url)
      
    } else {
      console.log('🆕 Creating new webhook...')
      
      const newWebhook = await client.request({
        url: '/hooks',
        method: 'POST',
        body: webhookConfig
      })
      
      console.log('✅ Webhook created successfully!')
      console.log('Webhook ID:', newWebhook.id)
      console.log('Webhook URL:', newWebhook.url)
    }
    
    console.log('\n📋 Webhook Configuration:')
    console.log('- Name:', webhookConfig.name)
    console.log('- URL:', webhookConfig.url)
    console.log('- Filter:', webhookConfig.filter)
    console.log('- Triggers:', webhookConfig.triggers.join(', '))
    
    console.log('\n🔧 Next Steps:')
    console.log('1. Make sure your webhook endpoint is deployed and accessible')
    console.log('2. Set the SANITY_WEBHOOK_SECRET environment variable')
    console.log('3. Test the webhook by publishing/updating a blog post')
    
  } catch (error) {
    console.error('❌ Error setting up webhooks:', error)
    
    if (error.statusCode === 401) {
      console.error('\n🔑 Authentication Error:')
      console.error('Make sure you have a valid SANITY_API_TOKEN with write permissions')
    } else if (error.statusCode === 400) {
      console.error('\n⚠️ Configuration Error:')
      console.error('Check your webhook configuration and URL')
    }
    
    process.exit(1)
  }
}

// Webhook testing function
async function testWebhook() {
  try {
    console.log('🧪 Testing webhook endpoint...')
    
    const testPayload = {
      _id: 'test-webhook',
      _type: 'post',
      title: 'Test Webhook',
      slug: { current: 'test-webhook' },
      webhook: {
        event: 'update',
        timestamp: new Date().toISOString()
      }
    }
    
    const response = await fetch(webhookConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sanity-webhook-signature': 'test-signature'
      },
      body: JSON.stringify(testPayload)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Webhook endpoint is responding:', result)
    } else {
      console.log('⚠️ Webhook endpoint returned:', response.status, response.statusText)
    }
    
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message)
  }
}

// List existing webhooks
async function listWebhooks() {
  try {
    console.log('📋 Listing existing webhooks...')
    
    const webhooks = await client.request({
      url: '/hooks',
      method: 'GET'
    })
    
    if (webhooks.length === 0) {
      console.log('No webhooks found.')
      return
    }
    
    webhooks.forEach((webhook, index) => {
      console.log(`\n${index + 1}. ${webhook.name}`)
      console.log(`   ID: ${webhook.id}`)
      console.log(`   URL: ${webhook.url}`)
      console.log(`   Status: ${webhook.isDisabled ? 'Disabled' : 'Active'}`)
      console.log(`   Created: ${new Date(webhook.createdAt).toLocaleDateString()}`)
    })
    
  } catch (error) {
    console.error('❌ Error listing webhooks:', error)
  }
}

// Delete webhook by ID
async function deleteWebhook(webhookId) {
  try {
    console.log(`🗑️ Deleting webhook: ${webhookId}`)
    
    await client.request({
      url: `/hooks/${webhookId}`,
      method: 'DELETE'
    })
    
    console.log('✅ Webhook deleted successfully!')
    
  } catch (error) {
    console.error('❌ Error deleting webhook:', error)
  }
}

// Main execution
async function main() {
  const command = process.argv[2]
  
  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable')
    process.exit(1)
  }
  
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ Missing SANITY_API_TOKEN environment variable')
    console.error('Get your token from: https://sanity.io/manage')
    process.exit(1)
  }
  
  switch (command) {
    case 'setup':
      await setupWebhooks()
      break
      
    case 'list':
      await listWebhooks()
      break
      
    case 'test':
      await testWebhook()
      break
      
    case 'delete':
      const webhookId = process.argv[3]
      if (!webhookId) {
        console.error('❌ Please provide a webhook ID to delete')
        console.error('Usage: node setup-webhooks.js delete <webhook-id>')
        process.exit(1)
      }
      await deleteWebhook(webhookId)
      break
      
    default:
      console.log('🔗 Sanity Webhook Management')
      console.log('\nUsage:')
      console.log('  node setup-webhooks.js setup   - Create or update webhook')
      console.log('  node setup-webhooks.js list    - List existing webhooks')
      console.log('  node setup-webhooks.js test    - Test webhook endpoint')
      console.log('  node setup-webhooks.js delete <id> - Delete webhook by ID')
      console.log('\nEnvironment Variables Required:')
      console.log('  NEXT_PUBLIC_SANITY_PROJECT_ID')
      console.log('  SANITY_API_TOKEN')
      console.log('  SANITY_WEBHOOK_URL (for setup)')
      break
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  setupWebhooks,
  listWebhooks,
  testWebhook,
  deleteWebhook
}