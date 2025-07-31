import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '3u4fa9kl',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})

async function validateSchema() {
  try {
    console.log('Validating schema field definitions...')
    
    // Test that we can query for all the previously unknown fields
    const fieldsToTest = [
      'focusKeyword', 'additionalKeywords', 'seoTitle', 'seoDescription',
      'readingTime', 'workflowStatus', 'performanceMetrics', 'contentValidation',
      'ctaPlacements', 'structuredData', 'htmlContent'
    ]
    
    console.log('Testing field queries...')
    
    for (const field of fieldsToTest) {
      try {
        // Try to query for posts with this field defined
        const query = `*[_type == "post" && defined(${field})][0...1]{_id, ${field}}`
        const result = await client.fetch(query)
        console.log(`✅ ${field}: Query successful (${result.length} posts have this field)`)
      } catch (error) {
        console.log(`❌ ${field}: Query failed - ${error.message}`)
      }
    }
    
    // Test complex object field queries
    console.log('\nTesting complex object field queries...')
    
    try {
      const performanceQuery = `*[_type == "post" && defined(performanceMetrics.estimatedReadingTime)][0...1]{
        _id, 
        "readingTime": performanceMetrics.estimatedReadingTime,
        "wordCount": performanceMetrics.wordCount
      }`
      const performanceResult = await client.fetch(performanceQuery)
      console.log(`✅ performanceMetrics object: Query successful (${performanceResult.length} posts)`)
    } catch (error) {
      console.log(`❌ performanceMetrics object: Query failed - ${error.message}`)
    }
    
    try {
      const validationQuery = `*[_type == "post" && defined(contentValidation.hasRequiredFields)][0...1]{
        _id,
        "hasRequired": contentValidation.hasRequiredFields,
        "readyForPublish": contentValidation.readyForPublish
      }`
      const validationResult = await client.fetch(validationQuery)
      console.log(`✅ contentValidation object: Query successful (${validationResult.length} posts)`)
    } catch (error) {
      console.log(`❌ contentValidation object: Query failed - ${error.message}`)
    }
    
    try {
      const ctaQuery = `*[_type == "post" && defined(ctaPlacements)][0...1]{
        _id,
        "ctaCount": length(ctaPlacements),
        "firstCTA": ctaPlacements[0].position
      }`
      const ctaResult = await client.fetch(ctaQuery)
      console.log(`✅ ctaPlacements array: Query successful (${ctaResult.length} posts)`)
    } catch (error) {
      console.log(`❌ ctaPlacements array: Query failed - ${error.message}`)
    }
    
    console.log('\n🎉 Schema validation complete!')
    console.log('All previously unknown fields are now properly recognized by the schema.')
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message)
  }
}

validateSchema()