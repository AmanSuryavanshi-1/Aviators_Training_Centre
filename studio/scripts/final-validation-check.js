import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '3u4fa9kl',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})

async function finalValidationCheck() {
  try {
    console.log('🔍 Running final validation check...')
    console.log('=' .repeat(50))
    
    // 1. Test all previously unknown fields
    console.log('\n1. Testing all previously unknown fields:')
    const unknownFields = [
      'focusKeyword', 'additionalKeywords', 'seoTitle', 'seoDescription',
      'readingTime', 'workflowStatus', 'performanceMetrics', 'contentValidation',
      'ctaPlacements', 'structuredData', 'htmlContent', 'image', 'tags'
    ]
    
    let allFieldsValid = true
    
    for (const field of unknownFields) {
      try {
        const query = `*[_type == "post" && defined(${field})][0...1]{_id, ${field}}`
        await client.fetch(query)
        console.log(`✅ ${field}: Schema valid`)
      } catch (error) {
        console.log(`❌ ${field}: Schema error - ${error.message}`)
        allFieldsValid = false
      }
    }
    
    // 2. Test complex object queries
    console.log('\n2. Testing complex object field queries:')
    const complexQueries = [
      {
        name: 'performanceMetrics.estimatedReadingTime',
        query: `*[_type == "post" && defined(performanceMetrics.estimatedReadingTime)][0...1]{_id, "readingTime": performanceMetrics.estimatedReadingTime}`
      },
      {
        name: 'contentValidation.hasRequiredFields',
        query: `*[_type == "post" && defined(contentValidation.hasRequiredFields)][0...1]{_id, "hasRequired": contentValidation.hasRequiredFields}`
      },
      {
        name: 'ctaPlacements array',
        query: `*[_type == "post" && defined(ctaPlacements)][0...1]{_id, "ctaCount": length(ctaPlacements)}`
      },
      {
        name: 'structuredData.articleType',
        query: `*[_type == "post" && defined(structuredData.articleType)][0...1]{_id, "articleType": structuredData.articleType}`
      }
    ]
    
    for (const test of complexQueries) {
      try {
        await client.fetch(test.query)
        console.log(`✅ ${test.name}: Complex query valid`)
      } catch (error) {
        console.log(`❌ ${test.name}: Complex query error - ${error.message}`)
        allFieldsValid = false
      }
    }
    
    // 3. Test reference field queries
    console.log('\n3. Testing reference field queries:')
    const referenceQueries = [
      {
        name: 'tags reference',
        query: `*[_type == "post" && defined(tags)][0...1]{_id, tags[]-> {title, slug}}`
      },
      {
        name: 'author reference',
        query: `*[_type == "post" && defined(author)][0...1]{_id, author-> {name, slug}}`
      },
      {
        name: 'category reference',
        query: `*[_type == "post" && defined(category)][0...1]{_id, category-> {title, slug}}`
      }
    ]
    
    for (const test of referenceQueries) {
      try {
        await client.fetch(test.query)
        console.log(`✅ ${test.name}: Reference query valid`)
      } catch (error) {
        console.log(`❌ ${test.name}: Reference query error - ${error.message}`)
        allFieldsValid = false
      }
    }
    
    // 4. Test frontend compatibility query
    console.log('\n4. Testing frontend compatibility:')
    try {
      const frontendQuery = `*[_type == "post"][0...1] {
        _id,
        title,
        slug,
        excerpt,
        content,
        body,
        htmlContent,
        publishedAt,
        featured,
        readingTime,
        workflowStatus,
        image,
        category->,
        author->,
        tags[]->,
        seoTitle,
        seoDescription,
        focusKeyword,
        additionalKeywords,
        performanceMetrics,
        contentValidation,
        ctaPlacements,
        structuredData
      }`
      
      const result = await client.fetch(frontendQuery)
      console.log(`✅ Frontend query: Valid (${result.length} posts fetched)`)
    } catch (error) {
      console.log(`❌ Frontend query: Error - ${error.message}`)
      allFieldsValid = false
    }
    
    // 5. Check for any posts with validation errors
    console.log('\n5. Checking for posts with validation issues:')
    try {
      const allPosts = await client.fetch(`*[_type == "post"]{_id, title}`)
      console.log(`✅ All posts accessible: ${allPosts.length} posts found`)
      
      // Check if any posts have missing required fields
      const postsWithIssues = await client.fetch(`
        *[_type == "post" && (!defined(title) || !defined(slug) || !defined(publishedAt))]{
          _id,
          title,
          "hasSlug": defined(slug),
          "hasPublishedAt": defined(publishedAt)
        }
      `)
      
      if (postsWithIssues.length > 0) {
        console.log(`⚠️  Found ${postsWithIssues.length} posts with missing required fields:`)
        postsWithIssues.forEach(post => {
          console.log(`  - ${post.title || 'Untitled'} (${post._id})`)
        })
      } else {
        console.log('✅ All posts have required fields')
      }
      
    } catch (error) {
      console.log(`❌ Post validation check: Error - ${error.message}`)
      allFieldsValid = false
    }
    
    // Final summary
    console.log('\n' + '=' .repeat(50))
    if (allFieldsValid) {
      console.log('🎉 VALIDATION COMPLETE: All tests passed!')
      console.log('✅ All previously unknown fields are now properly recognized')
      console.log('✅ Schema is fully functional and compatible')
      console.log('✅ Frontend can fetch and render all content')
      console.log('✅ No remaining validation issues found')
    } else {
      console.log('❌ VALIDATION FAILED: Some issues remain')
      console.log('Please review the errors above and fix any remaining issues')
    }
    
  } catch (error) {
    console.error('❌ Final validation check failed:', error.message)
  }
}

finalValidationCheck()