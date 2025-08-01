// This script runs via Sanity CLI which may have different permissions
const {getCliClient} = require('sanity/cli')

async function createPost() {
  const client = getCliClient()
  
  try {
    console.log('🚀 Creating blog post via Sanity CLI...')

    // Get existing category and author
    const category = await client.fetch(`*[_type == "category" && title == "Career Guidance"][0]`)
    const author = await client.fetch(`*[_type == "author" && name == "Aman Suryavanshi"][0]`)
    
    if (!category || !author) {
      console.error('❌ Missing required category or author. Please create them first in Sanity Studio.')
      return
    }

    console.log('✅ Found existing category and author')

    // Get existing tags
    const existingTags = await client.fetch(`*[_type == "tag"][0...3]`)
    const tagIds = existingTags.map(tag => ({
      _type: 'reference',
      _ref: tag._id
    }))

    // Create the blog post
    const post = await client.create({
      _type: 'post',
      title: 'Aviation Interview Preparation: Complete Guide for Pilot Job Success in 2025',
      slug: { current: 'aviation-interview-preparation-complete-guide-for-pilot-job-success-in-2025' },
      excerpt: "Master aviation interviews with our comprehensive 2025 guide. Expert tips, common questions, preparation strategies, and insider secrets to land your dream pilot job in India's competitive market.",
      category: {
        _type: 'reference',
        _ref: category._id,
      },
      tags: tagIds,
      author: {
        _type: 'reference',
        _ref: author._id,
      },
      publishedAt: new Date('2025-07-31').toISOString(),
      featured: true,
      readingTime: 15,
      workflowStatus: 'published',
      
      // SEO Fields
      seoTitle: 'Aviation Interview Preparation: Complete Pilot Job Success Guide 2025',
      seoDescription: 'Master aviation interviews with expert tips, common questions, and preparation strategies. Land your dream pilot job in India\'s competitive aviation market.',
      focusKeyword: 'aviation interview preparation',
      additionalKeywords: ['pilot job interview', 'aviation career guide', 'airline interview tips', 'pilot interview questions'],
      
      // Content body
      body: [
        {
          _type: 'block',
          style: 'normal',
          children: [{ 
            _type: 'span', 
            text: 'Success in aviation interviews requires strategic preparation across technical knowledge, behavioral competencies, and communication skills. This comprehensive guide provides proven frameworks, insider tips, and practical strategies used by successful pilots to secure positions at top airlines in India\'s competitive market, with average interview success rates improving by 300% through proper preparation.'
          }]
        },
        {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: 'Aviation Interview Landscape 2025' }]
        },
        {
          _type: 'block',
          style: 'h3',
          children: [{ _type: 'span', text: 'Current Market Dynamics' }]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [{ 
            _type: 'span', 
            text: "India's aviation sector is experiencing unprecedented growth with airlines actively recruiting across all experience levels. The interview landscape has evolved significantly, with airlines now employing sophisticated assessment methods to identify candidates who not only possess technical competence but also demonstrate leadership potential, cultural fit, and adaptability to modern aviation challenges."
          }]
        },
        {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: 'Strategic Preparation Framework' }]
        },
        {
          _type: 'block',
          style: 'h3',
          children: [{ _type: 'span', text: 'The SOAR Method' }]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [{ 
            _type: 'span', 
            text: 'Successful aviation interview preparation follows the SOAR framework: Study (technical knowledge), Organize (documentation and logistics), Analyze (company research and self-assessment), and Rehearse (practice and refinement). This systematic approach ensures comprehensive preparation across all interview dimensions.'
          }]
        },
        {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: 'Technical Interview Mastery' }]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [{ 
            _type: 'span', 
            text: 'Technical interviews assess your foundational aviation knowledge and practical application abilities. Success requires deep understanding of aircraft systems, regulations, and operational procedures, combined with the ability to explain complex concepts clearly and confidently.'
          }]
        },
        {
          _type: 'block',
          style: 'h3',
          children: [{ _type: 'span', text: 'Core Technical Areas' }]
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Aircraft Systems: Powerplant, flight controls, electrical, hydraulics' }]
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Regulatory Knowledge: DGCA requirements, weather minimums, emergency procedures' }]
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Operational Procedures: Flight planning, crew resource management, safety protocols' }]
        }
      ]
    })

    console.log('✅ Blog post created successfully!')
    console.log(`Document ID: ${post._id}`)
    console.log(`Title: ${post.title}`)
    console.log(`Slug: ${post.slug.current}`)
    console.log('\n🎉 Your blog post is now live in Sanity Studio!')
    console.log('\n🔗 You can now view it in your Sanity Studio at:')
    console.log(`https://aviators-training-centre-blog.sanity.studio/structure/post;${post._id}`)
    
  } catch (err) {
    console.error('❌ Error creating document:', err.message)
    if (err.details) {
      console.error('Error details:', err.details)
    }
  }
}

export default createPost
