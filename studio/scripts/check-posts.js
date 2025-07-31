import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '3u4fa9kl',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})

async function checkPosts() {
  try {
    const posts = await client.fetch('*[_type == "post"][0...5]{_id, title, _createdAt}')
    console.log('Found posts:', posts.length)
    posts.forEach(post => {
      console.log(`- ${post.title} (${post._id})`)
    })
    
    if (posts.length > 0) {
      // Check for any posts with the fields that were causing issues
      const postsWithFields = await client.fetch(`
        *[_type == "post" && defined(focusKeyword) || defined(additionalKeywords) || defined(contentValidation)][0...3]{
          _id, 
          title, 
          focusKeyword,
          additionalKeywords,
          contentValidation,
          performanceMetrics,
          ctaPlacements,
          workflowStatus,
          readingTime,
          htmlContent,
          structuredData
        }
      `)
      console.log('\nPosts with previously unknown fields:', postsWithFields.length)
      postsWithFields.forEach(post => {
        console.log(`- ${post.title}: has fields`, Object.keys(post).filter(k => !k.startsWith('_') && k !== 'title'))
      })
    }
  } catch (error) {
    console.error('Error checking posts:', error.message)
  }
}

checkPosts()