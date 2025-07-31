#!/usr/bin/env tsx

/**
 * Script to enhance existing blog posts with:
 * - FAQ sections with schema markup
 * - Intelligent CTA integration
 * - Content cluster linking
 * - Voice search optimization
 * - Featured snippet optimization
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

interface BlogPostMatter {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  author: string;
  featured?: boolean;
  priority?: number;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  quality: string;
  conversionPotential: string;
  publishedAt: string;
  [key: string]: any;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface EnhancementResult {
  success: boolean;
  enhanced: number;
  errors: Array<{ file: string; error: string }>;
}

// FAQ sets for different categories
const FAQ_SETS: Record<string, FAQItem[]> = {
  'DGCA Exam Preparation': [
    {
      question: "What is the minimum age requirement for DGCA CPL?",
      answer: "The minimum age requirement for DGCA Commercial Pilot License is 18 years. However, you can start your training at 17 years of age and appear for the skill test once you turn 18."
    },
    {
      question: "How much does DGCA CPL training cost in India?",
      answer: "DGCA CPL training typically costs between ₹30-45 lakhs, including flight training (₹25-35 lakhs), ground school (₹2-4 lakhs), examination fees, medical costs, and living expenses."
    },
    {
      question: "What are the educational qualifications required for CPL?",
      answer: "You need to have completed 10+2 (12th standard) with Physics and Mathematics as mandatory subjects. English proficiency at ICAO Level 4 or higher is also required."
    },
    {
      question: "How long does it take to complete DGCA CPL training?",
      answer: "DGCA CPL training typically takes 18-24 months to complete, including ground school (3-6 months), flight training (12-18 months), and skill test preparation (1-2 months)."
    }
  ],
  'Aviation Medical': [
    {
      question: "What is a Class 1 Medical Certificate?",
      answer: "A Class 1 Medical Certificate is the highest level of aviation medical certification required for commercial pilots. It ensures you meet the stringent health standards necessary for safe commercial flight operations."
    },
    {
      question: "How often do I need to renew my medical certificate?",
      answer: "Class 1 Medical Certificate validity depends on age: Under 40 years - 12 months, 40-60 years - 6 months, Over 60 years - 6 months."
    },
    {
      question: "What vision requirements must I meet?",
      answer: "You need 6/6 vision (with or without correction), pass color vision tests (Ishihara plates), have normal depth perception, and meet specific requirements for near and intermediate vision."
    },
    {
      question: "Can I get CPL if I wear glasses or contact lenses?",
      answer: "Yes, you can obtain CPL with corrected vision using glasses or contact lenses, provided your corrected vision meets the 6/6 standard and you carry spare glasses during flight operations."
    }
  ],
  'Aviation Career': [
    {
      question: "What is the current job market for pilots in India?",
      answer: "The Indian aviation industry is experiencing significant growth with increasing demand for pilots. Major airlines like IndiGo, Air India, SpiceJet, and Vistara are actively hiring."
    },
    {
      question: "What is the typical career progression for a commercial pilot?",
      answer: "The typical progression is: Student Pilot → CPL → Flight Instructor/Charter Pilot → First Officer (Airlines) → Captain → Senior Captain/Training Captain."
    },
    {
      question: "How much can I earn as a commercial pilot in India?",
      answer: "Pilot salaries vary by position: Flight Instructor (₹30,000-60,000/month), Charter Pilot (₹50,000-1.5 lakhs/month), First Officer (₹1.5-3 lakhs/month), Domestic Captain (₹3-8 lakhs/month), International Captain (₹8-25 lakhs/month)."
    }
  ],
  'Pilot Training': [
    {
      question: "What are the different types of pilot licenses?",
      answer: "Main licenses include: Student Pilot License (SPL), Private Pilot License (PPL), Commercial Pilot License (CPL), Airline Transport Pilot License (ATPL), and various ratings like Instrument Rating (IR) and Type Ratings."
    },
    {
      question: "Is pilot training worth the investment?",
      answer: "Yes, pilot training is generally a good investment considering the high earning potential, job security in a growing industry, international opportunities, and the rewarding nature of the profession."
    },
    {
      question: "What are the physical and mental requirements for pilots?",
      answer: "Pilots must maintain excellent physical and mental health, including good vision, hearing, cardiovascular health, and psychological stability. Regular medical examinations ensure ongoing fitness."
    }
  ]
};

// Voice search optimization patterns
const VOICE_SEARCH_PATTERNS = {
  'how to': 'How to',
  'what is': 'What is',
  'why should': 'Why should',
  'when can': 'When can',
  'where to': 'Where to',
  'which is': 'Which is',
  'who can': 'Who can'
};

// Featured snippet optimization
const FEATURED_SNIPPET_FORMATS = {
  list: {
    pattern: /^(Steps?|Requirements?|Tips?|Benefits?|Advantages?|Disadvantages?)/i,
    format: 'numbered-list'
  },
  table: {
    pattern: /(cost|price|salary|comparison|vs)/i,
    format: 'table'
  },
  paragraph: {
    pattern: /(what is|definition|meaning)/i,
    format: 'paragraph'
  }
};

async function enhanceExistingBlogPosts(): Promise<EnhancementResult> {
  const result: EnhancementResult = {
    success: true,
    enhanced: 0,
    errors: []
  };

  console.log('🚀 Starting blog post enhancement...');

  try {
    const blogPostsDir = path.join(process.cwd(), 'data/optimized-blog-posts');
    const files = await fs.readdir(blogPostsDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    console.log(`📋 Found ${markdownFiles.length} blog posts to enhance`);

    for (const file of markdownFiles) {
      try {
        console.log(`\n📝 Processing: ${file}`);
        
        const filePath = path.join(blogPostsDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { data: frontMatter, content } = matter(fileContent);
        
        // Skip files without proper front matter
        if (!frontMatter || Object.keys(frontMatter).length === 0) {
          console.log(`   ⏭️  No front matter found, skipping...`);
          continue;
        }
        
        const blogPost = frontMatter as BlogPostMatter;
        
        // Skip if already enhanced
        if (blogPost.enhanced === true) {
          console.log(`   ⏭️  Already enhanced, skipping...`);
          continue;
        }

        // Skip if missing essential properties
        if (!blogPost.title || !blogPost.category) {
          console.log(`   ⏭️  Missing essential properties, skipping...`);
          continue;
        }

        // Enhance the blog post
        const enhancedContent = await enhanceBlogPost(blogPost, content);
        const enhancedFrontMatter = enhanceFrontMatter(blogPost);

        // Write enhanced content back to file
        const enhancedFileContent = matter.stringify(enhancedContent, enhancedFrontMatter);
        await fs.writeFile(filePath, enhancedFileContent, 'utf-8');

        result.enhanced++;
        console.log(`   ✅ Enhanced successfully`);

      } catch (error) {
        console.error(`   ❌ Error processing ${file}:`, error);
        result.errors.push({
          file,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        result.success = false;
      }
    }

    return result;

  } catch (error) {
    console.error('💥 Fatal error during enhancement:', error);
    result.success = false;
    result.errors.push({
      file: 'global',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return result;
  }
}

async function enhanceBlogPost(blogPost: BlogPostMatter, content: string): Promise<string> {
  let enhancedContent = content;

  // 1. Add FAQ section
  enhancedContent = addFAQSection(enhancedContent, blogPost);

  // 2. Add voice search optimization
  enhancedContent = optimizeForVoiceSearch(enhancedContent, blogPost);

  // 3. Add featured snippet optimization
  enhancedContent = optimizeForFeaturedSnippets(enhancedContent, blogPost);

  // 4. Add internal linking opportunities
  enhancedContent = addInternalLinking(enhancedContent, blogPost);

  // 5. Add CTA integration points
  enhancedContent = addCTAIntegrationPoints(enhancedContent, blogPost);

  return enhancedContent;
}

function enhanceFrontMatter(blogPost: BlogPostMatter): BlogPostMatter {
  const enhanced = { ...blogPost };

  // Mark as enhanced
  enhanced.enhanced = true;
  enhanced.enhancementDate = new Date().toISOString();

  // Add voice search keywords
  enhanced.voiceSearchKeywords = generateVoiceSearchKeywords(blogPost);

  // Add featured snippet targets
  enhanced.featuredSnippetTargets = generateFeaturedSnippetTargets(blogPost);

  // Add internal linking strategy
  enhanced.internalLinkingStrategy = generateInternalLinkingStrategy(blogPost);

  // Add CTA integration settings
  enhanced.ctaIntegration = {
    enabled: true,
    positions: ['top', 'middle', 'bottom'],
    priority: blogPost.conversionPotential === 'very-high' ? 90 : 75
  };

  // Enhanced SEO settings
  enhanced.seoEnhancement = {
    ...enhanced.seoEnhancement,
    voiceSearchOptimized: true,
    featuredSnippetOptimized: true,
    internalLinkingOptimized: true,
    ctaIntegrated: true,
    schemaMarkup: ['Article', 'FAQPage', 'BreadcrumbList']
  };

  return enhanced;
}

function addFAQSection(content: string, blogPost: BlogPostMatter): string {
  const faqs = FAQ_SETS[blogPost.category] || [];
  
  if (faqs.length === 0) {
    return content;
  }

  // Check if FAQ section already exists
  if (content.includes('## Frequently Asked Questions') || content.includes('## FAQ')) {
    return content;
  }

  const faqSection = `

## Frequently Asked Questions

${faqs.map(faq => `
### ${faq.question}

${faq.answer}
`).join('')}

---

**Still have questions about ${blogPost.title.toLowerCase()}?** Our aviation experts are here to help you with personalized guidance.

[**Get Expert Consultation →**](/contact?type=consultation) | [**Call Now →**](tel:+919876543210)

`;

  // Insert FAQ section before conclusion or at the end
  const conclusionIndex = content.toLowerCase().lastIndexOf('## conclusion');
  if (conclusionIndex !== -1) {
    return content.slice(0, conclusionIndex) + faqSection + content.slice(conclusionIndex);
  }

  return content + faqSection;
}

function optimizeForVoiceSearch(content: string, blogPost: BlogPostMatter): string {
  let optimizedContent = content;

  // Add conversational Q&A patterns
  const voiceSearchQuestions = generateVoiceSearchQuestions(blogPost);
  
  voiceSearchQuestions.forEach(qa => {
    // Check if question already exists in content
    if (!optimizedContent.toLowerCase().includes(qa.question.toLowerCase())) {
      // Find appropriate place to insert (after introduction, before conclusion)
      const insertPoint = findInsertionPoint(optimizedContent, 'voice-search');
      if (insertPoint !== -1) {
        const insertion = `\n\n### ${qa.question}\n\n${qa.answer}\n`;
        optimizedContent = optimizedContent.slice(0, insertPoint) + insertion + optimizedContent.slice(insertPoint);
      }
    }
  });

  return optimizedContent;
}

function optimizeForFeaturedSnippets(content: string, blogPost: BlogPostMatter): string {
  let optimizedContent = content;

  // Add structured data for featured snippets
  const snippetOptimizations = generateFeaturedSnippetOptimizations(blogPost);
  
  snippetOptimizations.forEach(optimization => {
    if (!optimizedContent.includes(optimization.content)) {
      const insertPoint = findInsertionPoint(optimizedContent, 'featured-snippet');
      if (insertPoint !== -1) {
        optimizedContent = optimizedContent.slice(0, insertPoint) + 
          `\n\n${optimization.content}\n` + 
          optimizedContent.slice(insertPoint);
      }
    }
  });

  return optimizedContent;
}

function addInternalLinking(content: string, blogPost: BlogPostMatter): string {
  let linkedContent = content;

  // Define internal linking opportunities
  const linkingOpportunities = [
    {
      keywords: ['DGCA CPL', 'commercial pilot license'],
      url: '/blog/dgca-cpl-complete-guide-2024',
      title: 'DGCA CPL Complete Guide 2024'
    },
    {
      keywords: ['medical examination', 'medical requirements'],
      url: '/blog/dgca-medical-examination-tips-aspiring-pilots',
      title: 'DGCA Medical Examination Tips'
    },
    {
      keywords: ['pilot salary', 'aviation career'],
      url: '/blog/pilot-salary-india-2024-career-earnings-guide',
      title: 'Aviation Salary Guide India 2024'
    },
    {
      keywords: ['interview preparation', 'airline interview'],
      url: '/blog/airline-pilot-interview-questions-expert-answers',
      title: 'Airline Pilot Interview Guide'
    }
  ];

  linkingOpportunities.forEach(opportunity => {
    // Skip self-linking
    if (blogPost.slug === opportunity.url.split('/').pop()) {
      return;
    }

    opportunity.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b(?![^<]*>)`, 'gi');
      let matchCount = 0;
      
      linkedContent = linkedContent.replace(regex, (match) => {
        matchCount++;
        // Only link the first occurrence to avoid over-linking
        if (matchCount === 1) {
          return `[${match}](${opportunity.url} "${opportunity.title}")`;
        }
        return match;
      });
    });
  });

  return linkedContent;
}

function addCTAIntegrationPoints(content: string, blogPost: BlogPostMatter): string {
  let ctaContent = content;

  // Add CTA integration comments for the template to use
  const ctaPoints = [
    {
      position: 'after-introduction',
      marker: '<!-- CTA_TOP_INTEGRATION -->',
      context: 'introduction'
    },
    {
      position: 'middle-content',
      marker: '<!-- CTA_MIDDLE_INTEGRATION -->',
      context: 'middle'
    },
    {
      position: 'before-conclusion',
      marker: '<!-- CTA_BOTTOM_INTEGRATION -->',
      context: 'conclusion'
    }
  ];

  ctaPoints.forEach(cta => {
    if (!ctaContent.includes(cta.marker)) {
      const insertPoint = findInsertionPoint(ctaContent, cta.position);
      if (insertPoint !== -1) {
        ctaContent = ctaContent.slice(0, insertPoint) + 
          `\n\n${cta.marker}\n` + 
          ctaContent.slice(insertPoint);
      }
    }
  });

  return ctaContent;
}

function generateVoiceSearchKeywords(blogPost: BlogPostMatter): string[] {
  const keywords: string[] = [];
  const title = (blogPost.title || '').toLowerCase();
  const focusKeyword = blogPost.focusKeyword || 'aviation training';

  Object.entries(VOICE_SEARCH_PATTERNS).forEach(([pattern, prefix]) => {
    if (title.includes(pattern)) {
      keywords.push(`${prefix} ${focusKeyword}`);
    }
  });

  // Add common voice search variations
  keywords.push(
    `How to get ${focusKeyword}`,
    `What is ${focusKeyword}`,
    `${focusKeyword} requirements`,
    `${focusKeyword} cost`,
    `Best ${focusKeyword} training`
  );

  return keywords;
}

function generateFeaturedSnippetTargets(blogPost: BlogPostMatter): string[] {
  const targets: string[] = [];
  const title = (blogPost.title || '').toLowerCase();
  const focusKeyword = blogPost.focusKeyword || 'aviation training';

  Object.entries(FEATURED_SNIPPET_FORMATS).forEach(([type, config]) => {
    if (config.pattern.test(title)) {
      targets.push(`${focusKeyword} ${config.format}`);
    }
  });

  return targets;
}

function generateInternalLinkingStrategy(blogPost: BlogPostMatter): any {
  const focusKeyword = blogPost.focusKeyword || 'aviation training';
  const tags = blogPost.tags || [];
  const slug = blogPost.slug || '';
  
  return {
    targetPosts: [
      'dgca-cpl-complete-guide-2024',
      'dgca-medical-examination-tips-aspiring-pilots',
      'pilot-salary-india-2024-career-earnings-guide',
      'airline-pilot-interview-questions-expert-answers'
    ].filter(targetSlug => targetSlug !== slug),
    linkingKeywords: [
      focusKeyword,
      ...tags.slice(0, 3)
    ],
    maxLinksPerPost: 3
  };
}

function generateVoiceSearchQuestions(blogPost: BlogPostMatter): Array<{question: string; answer: string}> {
  const questions: Array<{question: string; answer: string}> = [];
  const focusKeyword = blogPost.focusKeyword || 'aviation training';
  const category = blogPost.category || 'Aviation';
  
  // Generate based on focus keyword and category
  if (category === 'DGCA Exam Preparation') {
    questions.push({
      question: `How do I prepare for ${focusKeyword}?`,
      answer: `To prepare for ${focusKeyword}, you need systematic study, proper guidance, and consistent practice. Our comprehensive training program covers all aspects with expert instructors and proven methodologies.`
    });
  }

  if (category === 'Aviation Career') {
    questions.push({
      question: `What career opportunities are available in ${focusKeyword}?`,
      answer: `${focusKeyword} offers diverse career opportunities including airline pilot positions, flight instruction, charter operations, and corporate aviation roles with excellent growth potential.`
    });
  }

  return questions;
}

function generateFeaturedSnippetOptimizations(blogPost: BlogPostMatter): Array<{type: string; content: string}> {
  const optimizations: Array<{type: string; content: string}> = [];

  // Add definition snippet for "what is" queries
  if (blogPost.title.toLowerCase().includes('what is') || blogPost.title.toLowerCase().includes('guide')) {
    const excerptText = blogPost.excerpt || 'a comprehensive guide for aviation professionals';
    optimizations.push({
      type: 'definition',
      content: `**${blogPost.focusKeyword}** is ${excerptText.split('.')[0].toLowerCase()}.`
    });
  }

  // Add list snippet for process/steps content
  if (blogPost.title.toLowerCase().includes('tips') || blogPost.title.toLowerCase().includes('steps')) {
    optimizations.push({
      type: 'list',
      content: `### Key Points for ${blogPost.focusKeyword}:\n\n1. **Preparation**: Thorough preparation is essential\n2. **Training**: Quality training from certified instructors\n3. **Practice**: Regular practice and skill development\n4. **Certification**: Obtaining proper certifications and licenses`
    });
  }

  return optimizations;
}

function findInsertionPoint(content: string, type: string): number {
  const lines = content.split('\n');
  
  switch (type) {
    case 'voice-search':
      // Insert after first major section
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('## ') && i > 10) {
          return lines.slice(0, i).join('\n').length;
        }
      }
      break;
      
    case 'featured-snippet':
      // Insert after introduction, before main content
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('## ') && !lines[i].toLowerCase().includes('introduction')) {
          return lines.slice(0, i).join('\n').length;
        }
      }
      break;
      
    case 'after-introduction':
      // Find end of introduction section
      let introEnd = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('## ') && i > 5) {
          introEnd = lines.slice(0, i).join('\n').length;
          break;
        }
      }
      return introEnd;
      
    case 'middle-content':
      // Find middle of content
      return Math.floor(content.length / 2);
      
    case 'before-conclusion':
      // Find conclusion section or end of content
      const conclusionIndex = content.toLowerCase().lastIndexOf('## conclusion');
      if (conclusionIndex !== -1) {
        return conclusionIndex;
      }
      return content.length - 500; // Near end if no conclusion found
  }
  
  return -1;
}

async function main() {
  try {
    console.log('🎯 Blog Post Enhancement Script Starting...\n');

    const result = await enhanceExistingBlogPosts();

    console.log('\n' + '='.repeat(50));
    console.log('📊 ENHANCEMENT RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Posts Enhanced: ${result.enhanced}`);
    console.log(`❌ Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach(error => {
        console.log(`   ${error.file}: ${error.error}`);
      });
    }

    console.log('\n🎉 Blog Post Enhancement Complete!');
    console.log('\n📋 Enhancements Applied:');
    console.log('   ✅ FAQ sections with schema markup');
    console.log('   ✅ Voice search optimization');
    console.log('   ✅ Featured snippet optimization');
    console.log('   ✅ Strategic internal linking');
    console.log('   ✅ CTA integration points');

    console.log('\n📋 Next Steps:');
    console.log('   1. Review enhanced blog posts');
    console.log('   2. Test CTA integration functionality');
    console.log('   3. Validate schema markup');
    console.log('   4. Monitor voice search performance');

    if (result.success) {
      process.exit(0);
    } else {
      console.log('\n⚠️  Some errors occurred during enhancement. Please review and fix.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Fatal error during blog post enhancement:', error);
    process.exit(1);
  }
}

// Run the script
main();
