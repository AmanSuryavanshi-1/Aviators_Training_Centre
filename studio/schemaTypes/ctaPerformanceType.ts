import {defineField, defineType} from 'sanity'

export const ctaPerformanceType = defineType({
  name: 'ctaPerformance',
  title: 'CTA Performance Analytics',
  type: 'document',
  fields: [
    defineField({
      name: 'ctaTemplate',
      title: 'CTA Template',
      type: 'reference',
      to: [{type: 'ctaTemplate'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'blogPost',
      title: 'Blog Post',
      type: 'reference',
      to: [{type: 'post'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'position',
      title: 'CTA Position',
      type: 'string',
      options: {
        list: [
          {title: 'Top of Post', value: 'top'},
          {title: 'Middle of Post', value: 'middle'},
          {title: 'Bottom of Post', value: 'bottom'},
          {title: 'Sidebar', value: 'sidebar'},
          {title: 'Floating', value: 'floating'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'variant',
      title: 'A/B Test Variant',
      type: 'string',
      description: 'Which variant was shown (control, test-a, test-b, etc.)',
    }),
    defineField({
      name: 'testId',
      title: 'A/B Test ID',
      type: 'string',
      description: 'Unique identifier for the A/B test',
    }),
    defineField({
      name: 'dateRange',
      title: 'Date Range',
      type: 'object',
      fields: [
        {
          name: 'startDate',
          title: 'Start Date',
          type: 'datetime',
          validation: (rule) => rule.required(),
        },
        {
          name: 'endDate',
          title: 'End Date',
          type: 'datetime',
          validation: (rule) => rule.required(),
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'impressions',
      title: 'Impressions',
      type: 'number',
      validation: (rule) => rule.min(0),
      initialValue: 0,
      description: 'Number of times the CTA was displayed',
    }),
    defineField({
      name: 'clicks',
      title: 'Clicks',
      type: 'number',
      validation: (rule) => rule.min(0),
      initialValue: 0,
      description: 'Number of times the CTA was clicked',
    }),
    defineField({
      name: 'conversions',
      title: 'Conversions',
      type: 'number',
      validation: (rule) => rule.min(0),
      initialValue: 0,
      description: 'Number of successful conversions (form submissions, enrollments, etc.)',
    }),
    defineField({
      name: 'revenue',
      title: 'Revenue Generated (₹)',
      type: 'number',
      validation: (rule) => rule.min(0),
      initialValue: 0,
      description: 'Revenue attributed to this CTA in Indian Rupees',
    }),
    defineField({
      name: 'metrics',
      title: 'Performance Metrics',
      type: 'object',
      fields: [
        {
          name: 'ctr',
          title: 'Click-Through Rate (%)',
          type: 'number',
          validation: (rule) => rule.min(0).max(100),
          description: 'Calculated as (clicks / impressions) * 100',
        },
        {
          name: 'conversionRate',
          title: 'Conversion Rate (%)',
          type: 'number',
          validation: (rule) => rule.min(0).max(100),
          description: 'Calculated as (conversions / clicks) * 100',
        },
        {
          name: 'revenuePerClick',
          title: 'Revenue Per Click (₹)',
          type: 'number',
          validation: (rule) => rule.min(0),
          description: 'Calculated as revenue / clicks',
        },
        {
          name: 'costPerConversion',
          title: 'Cost Per Conversion (₹)',
          type: 'number',
          validation: (rule) => rule.min(0),
          description: 'Marketing cost divided by conversions',
        },
        {
          name: 'roi',
          title: 'Return on Investment (%)',
          type: 'number',
          description: 'ROI percentage for this CTA',
        },
      ],
    }),
    defineField({
      name: 'deviceBreakdown',
      title: 'Device Performance Breakdown',
      type: 'object',
      fields: [
        {
          name: 'desktop',
          title: 'Desktop Performance',
          type: 'object',
          fields: [
            {name: 'impressions', title: 'Impressions', type: 'number', initialValue: 0},
            {name: 'clicks', title: 'Clicks', type: 'number', initialValue: 0},
            {name: 'conversions', title: 'Conversions', type: 'number', initialValue: 0},
            {name: 'ctr', title: 'CTR (%)', type: 'number'},
          ],
        },
        {
          name: 'tablet',
          title: 'Tablet Performance',
          type: 'object',
          fields: [
            {name: 'impressions', title: 'Impressions', type: 'number', initialValue: 0},
            {name: 'clicks', title: 'Clicks', type: 'number', initialValue: 0},
            {name: 'conversions', title: 'Conversions', type: 'number', initialValue: 0},
            {name: 'ctr', title: 'CTR (%)', type: 'number'},
          ],
        },
        {
          name: 'mobile',
          title: 'Mobile Performance',
          type: 'object',
          fields: [
            {name: 'impressions', title: 'Impressions', type: 'number', initialValue: 0},
            {name: 'clicks', title: 'Clicks', type: 'number', initialValue: 0},
            {name: 'conversions', title: 'Conversions', type: 'number', initialValue: 0},
            {name: 'ctr', title: 'CTR (%)', type: 'number'},
          ],
        },
      ],
    }),
    defineField({
      name: 'timeBasedMetrics',
      title: 'Time-Based Performance',
      type: 'object',
      fields: [
        {
          name: 'hourlyPerformance',
          title: 'Hourly Performance',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'hour', title: 'Hour (0-23)', type: 'number'},
                {name: 'impressions', title: 'Impressions', type: 'number'},
                {name: 'clicks', title: 'Clicks', type: 'number'},
                {name: 'conversions', title: 'Conversions', type: 'number'},
              ],
            },
          ],
        },
        {
          name: 'dailyPerformance',
          title: 'Daily Performance',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'date', title: 'Date', type: 'date'},
                {name: 'impressions', title: 'Impressions', type: 'number'},
                {name: 'clicks', title: 'Clicks', type: 'number'},
                {name: 'conversions', title: 'Conversions', type: 'number'},
                {name: 'revenue', title: 'Revenue (₹)', type: 'number'},
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'userBehaviorMetrics',
      title: 'User Behavior Metrics',
      type: 'object',
      fields: [
        {
          name: 'averageTimeToClick',
          title: 'Average Time to Click (seconds)',
          type: 'number',
          description: 'Average time from CTA display to click',
        },
        {
          name: 'scrollDepthAtClick',
          title: 'Average Scroll Depth at Click (%)',
          type: 'number',
          description: 'Average scroll percentage when CTA was clicked',
        },
        {
          name: 'bounceRateAfterClick',
          title: 'Bounce Rate After Click (%)',
          type: 'number',
          description: 'Percentage of users who left after clicking CTA',
        },
        {
          name: 'returnVisitorRate',
          title: 'Return Visitor Click Rate (%)',
          type: 'number',
          description: 'Percentage of CTA clicks from return visitors',
        },
      ],
    }),
    defineField({
      name: 'leadQualityMetrics',
      title: 'Lead Quality Metrics',
      type: 'object',
      fields: [
        {
          name: 'leadScore',
          title: 'Average Lead Score',
          type: 'number',
          validation: (rule) => rule.min(0).max(100),
          description: 'Average quality score of leads generated',
        },
        {
          name: 'qualifiedLeads',
          title: 'Qualified Leads',
          type: 'number',
          validation: (rule) => rule.min(0),
          description: 'Number of leads that met qualification criteria',
        },
        {
          name: 'salesConversions',
          title: 'Sales Conversions',
          type: 'number',
          validation: (rule) => rule.min(0),
          description: 'Number of leads that converted to sales',
        },
        {
          name: 'averageDealValue',
          title: 'Average Deal Value (₹)',
          type: 'number',
          validation: (rule) => rule.min(0),
          description: 'Average value of deals closed from this CTA',
        },
        {
          name: 'salesCycleLength',
          title: 'Average Sales Cycle (days)',
          type: 'number',
          validation: (rule) => rule.min(0),
          description: 'Average days from lead to closed deal',
        },
      ],
    }),
    defineField({
      name: 'competitorComparison',
      title: 'Competitor Comparison',
      type: 'object',
      fields: [
        {
          name: 'industryBenchmarkCTR',
          title: 'Industry Benchmark CTR (%)',
          type: 'number',
          description: 'Industry average CTR for comparison',
        },
        {
          name: 'performanceVsBenchmark',
          title: 'Performance vs Benchmark (%)',
          type: 'number',
          description: 'How this CTA performs compared to industry benchmark',
        },
        {
          name: 'competitorCTAs',
          title: 'Competitor CTA Analysis',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'competitor', title: 'Competitor Name', type: 'string'},
                {name: 'ctaType', title: 'CTA Type', type: 'string'},
                {name: 'estimatedCTR', title: 'Estimated CTR (%)', type: 'number'},
                {name: 'notes', title: 'Analysis Notes', type: 'text'},
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'optimizationSuggestions',
      title: 'Optimization Suggestions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'suggestion',
              title: 'Suggestion',
              type: 'string',
              validation: (rule) => rule.required(),
            },
            {
              name: 'priority',
              title: 'Priority',
              type: 'string',
              options: {
                list: [
                  {title: 'High', value: 'high'},
                  {title: 'Medium', value: 'medium'},
                  {title: 'Low', value: 'low'},
                ],
              },
            },
            {
              name: 'expectedImpact',
              title: 'Expected Impact (%)',
              type: 'number',
              description: 'Expected improvement in conversion rate',
            },
            {
              name: 'implementationEffort',
              title: 'Implementation Effort',
              type: 'string',
              options: {
                list: [
                  {title: 'Low', value: 'low'},
                  {title: 'Medium', value: 'medium'},
                  {title: 'High', value: 'high'},
                ],
              },
            },
            {
              name: 'status',
              title: 'Status',
              type: 'string',
              options: {
                list: [
                  {title: 'Pending', value: 'pending'},
                  {title: 'In Progress', value: 'in-progress'},
                  {title: 'Completed', value: 'completed'},
                  {title: 'Rejected', value: 'rejected'},
                ],
              },
              initialValue: 'pending',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'notes',
      title: 'Performance Notes',
      type: 'text',
      rows: 4,
      description: 'Additional notes about CTA performance and insights',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      ctaTemplate: 'ctaTemplate.name',
      blogPost: 'blogPost.title',
      position: 'position',
      ctr: 'metrics.ctr',
      conversions: 'conversions',
    },
    prepare({ctaTemplate, blogPost, position, ctr, conversions}) {
      return {
        title: `${ctaTemplate} on ${blogPost}`,
        subtitle: `${position} • CTR: ${ctr?.toFixed(2) || 0}% • Conversions: ${conversions || 0}`,
      }
    },
  },
  orderings: [
    {
      title: 'Performance (CTR)',
      name: 'ctrDesc',
      by: [{field: 'metrics.ctr', direction: 'desc'}],
    },
    {
      title: 'Conversions (High to Low)',
      name: 'conversionsDesc',
      by: [{field: 'conversions', direction: 'desc'}],
    },
    {
      title: 'Revenue (High to Low)',
      name: 'revenueDesc',
      by: [{field: 'revenue', direction: 'desc'}],
    },
    {
      title: 'Last Updated',
      name: 'lastUpdated',
      by: [{field: 'lastUpdated', direction: 'desc'}],
    },
  ],
})