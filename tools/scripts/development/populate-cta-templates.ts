#!/usr/bin/env tsx

/**
 * Script to populate CTA template library in Sanity CMS
 * This script creates all the pre-built high-converting CTA templates
 */

import { client } from '../lib/sanity/client';
import { ctaTemplateLibrary, defaultCTATemplate } from '../lib/cta/template-library';
import { CTATemplateCreateInput } from '../lib/types/cta';

interface PopulationResult {
  success: boolean;
  created: number;
  updated: number;
  errors: Array<{ template: string; error: string }>;
}

async function populateCTATemplates(): Promise<PopulationResult> {
  const result: PopulationResult = {
    success: true,
    created: 0,
    updated: 0,
    errors: [],
  };

  console.log('🎯 Starting CTA Template Population...');
  console.log(`📋 Found ${ctaTemplateLibrary.length} templates to process`);

  // Add default template to the list
  const allTemplates = [...ctaTemplateLibrary, defaultCTATemplate];

  for (const template of allTemplates) {
    try {
      console.log(`\n📝 Processing: ${template.name}`);

      // Generate slug if not provided
      const slug = template.slug?.current || 
        template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Check if template already exists
      const existingTemplate = await client.fetch(
        `*[_type == "ctaTemplate" && slug.current == $slug][0]`,
        { slug }
      );

      const templateData = {
        _type: 'ctaTemplate',
        ...template,
        slug: { current: slug },
        priority: template.priority || 50,
        active: template.active !== undefined ? template.active : true,
        version: template.version || '1.0',
        positioning: template.positioning || {
          allowedPositions: ['top', 'middle', 'bottom'],
          preferredPosition: 'bottom',
        },
        displayRules: template.displayRules || {
          deviceTypes: ['desktop', 'tablet', 'mobile'],
        },
      };

      if (existingTemplate) {
        // Update existing template
        console.log(`   ✏️  Updating existing template...`);
        
        await client
          .patch(existingTemplate._id)
          .set({
            ...templateData,
            _updatedAt: new Date().toISOString(),
          })
          .commit();

        result.updated++;
        console.log(`   ✅ Updated successfully`);
      } else {
        // Create new template
        console.log(`   🆕 Creating new template...`);
        
        const created = await client.create(templateData);
        
        result.created++;
        console.log(`   ✅ Created successfully (ID: ${created._id})`);
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`   ❌ Error processing ${template.name}:`, error);
      result.errors.push({
        template: template.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      result.success = false;
    }
  }

  return result;
}

async function validateTemplates(): Promise<void> {
  console.log('\n🔍 Validating created templates...');

  const templates = await client.fetch(`
    *[_type == "ctaTemplate"] | order(priority desc) {
      _id,
      name,
      category,
      style,
      priority,
      active,
      positioning,
      displayRules
    }
  `);

  console.log(`\n📊 Validation Results:`);
  console.log(`   Total templates: ${templates.length}`);
  console.log(`   Active templates: ${templates.filter((t: any) => t.active).length}`);
  console.log(`   Inactive templates: ${templates.filter((t: any) => !t.active).length}`);

  // Group by category
  const byCategory = templates.reduce((acc: any, template: any) => {
    acc[template.category] = (acc[template.category] || 0) + 1;
    return acc;
  }, {});

  console.log(`\n📂 Templates by Category:`);
  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`   ${category}: ${count}`);
  });

  // Group by style
  const byStyle = templates.reduce((acc: any, template: any) => {
    acc[template.style] = (acc[template.style] || 0) + 1;
    return acc;
  }, {});

  console.log(`\n🎨 Templates by Style:`);
  Object.entries(byStyle).forEach(([style, count]) => {
    console.log(`   ${style}: ${count}`);
  });

  // Check for high-priority templates
  const highPriority = templates.filter((t: any) => t.priority >= 80);
  console.log(`\n⭐ High Priority Templates (≥80): ${highPriority.length}`);
  highPriority.forEach((t: any) => {
    console.log(`   ${t.name} (Priority: ${t.priority})`);
  });
}

async function createSamplePerformanceData(): Promise<void> {
  console.log('\n📈 Creating sample performance data...');

  // Get a few templates to create sample performance data
  const templates = await client.fetch(`
    *[_type == "ctaTemplate"][0...3] {
      _id,
      name
    }
  `);

  // Get a few blog posts
  const blogPosts = await client.fetch(`
    *[_type == "post"][0...2] {
      _id,
      title
    }
  `);

  if (templates.length === 0 || blogPosts.length === 0) {
    console.log('   ⚠️  No templates or blog posts found for sample data');
    return;
  }

  const positions = ['top', 'middle', 'bottom'];
  let sampleCount = 0;

  for (const template of templates) {
    for (const post of blogPosts) {
      for (const position of positions) {
        try {
          const performanceData = {
            _type: 'ctaPerformance',
            ctaTemplate: { _ref: template._id },
            blogPost: { _ref: post._id },
            position,
            dateRange: {
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date().toISOString(),
            },
            impressions: Math.floor(Math.random() * 1000) + 100,
            clicks: Math.floor(Math.random() * 50) + 5,
            conversions: Math.floor(Math.random() * 10) + 1,
            revenue: Math.floor(Math.random() * 50000) + 5000,
            metrics: {
              ctr: Math.random() * 5 + 1, // 1-6%
              conversionRate: Math.random() * 20 + 5, // 5-25%
            },
            lastUpdated: new Date().toISOString(),
          };

          // Calculate derived metrics
          performanceData.metrics.ctr = (performanceData.clicks / performanceData.impressions) * 100;
          performanceData.metrics.conversionRate = (performanceData.conversions / performanceData.clicks) * 100;

          await client.create(performanceData);
          sampleCount++;

        } catch (error) {
          console.error(`   ❌ Error creating sample performance data:`, error);
        }
      }
    }
  }

  console.log(`   ✅ Created ${sampleCount} sample performance records`);
}

async function main() {
  try {
    console.log('🚀 CTA Template Population Script Starting...\n');

    // Populate templates
    const result = await populateCTATemplates();

    // Print results
    console.log('\n' + '='.repeat(50));
    console.log('📊 POPULATION RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Templates Created: ${result.created}`);
    console.log(`✏️  Templates Updated: ${result.updated}`);
    console.log(`❌ Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach(error => {
        console.log(`   ${error.template}: ${error.error}`);
      });
    }

    // Validate templates
    await validateTemplates();

    // Create sample performance data
    await createSamplePerformanceData();

    console.log('\n🎉 CTA Template Population Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Review templates in Sanity Studio');
    console.log('   2. Test CTA routing functionality');
    console.log('   3. Configure A/B testing for high-priority templates');
    console.log('   4. Set up performance monitoring');

    if (result.success) {
      process.exit(0);
    } else {
      console.log('\n⚠️  Some errors occurred during population. Please review and fix.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Fatal error during CTA template population:', error);
    process.exit(1);
  }
}

// Run the script
main();

export { populateCTATemplates, validateTemplates, createSamplePerformanceData };
