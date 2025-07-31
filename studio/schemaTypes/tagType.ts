import {defineField, defineType} from 'sanity'

export const tagType = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(50),
      description: 'Tag name (e.g., "Flight Training", "Aviation Safety")',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
      description: 'URL-friendly version of the tag name',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Brief description of what this tag represents',
    }),
    defineField({
      name: 'color',
      title: 'Tag Color',
      type: 'string',
      options: {
        list: [
          {title: 'Teal (Primary)', value: 'teal'},
          {title: 'Blue (Secondary)', value: 'blue'},
          {title: 'Green (Success)', value: 'green'},
          {title: 'Orange (Warning)', value: 'orange'},
          {title: 'Red (Important)', value: 'red'},
          {title: 'Purple (Special)', value: 'purple'},
          {title: 'Gray (Neutral)', value: 'gray'},
        ],
      },
      initialValue: 'gray',
      description: 'Color theme for this tag',
    }),
    defineField({
      name: 'category',
      title: 'Tag Category',
      type: 'string',
      options: {
        list: [
          {title: 'Technical', value: 'technical'},
          {title: 'Training', value: 'training'},
          {title: 'Safety', value: 'safety'},
          {title: 'Regulations', value: 'regulations'},
          {title: 'Career', value: 'career'},
          {title: 'Equipment', value: 'equipment'},
          {title: 'General', value: 'general'},
        ],
      },
      initialValue: 'general',
      description: 'Category to group related tags',
    }),
    defineField({
      name: 'relatedCourses',
      title: 'Related Courses',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'course'}]}],
      description: 'Courses that are relevant to this tag',
    }),
    defineField({
      name: 'seoKeywords',
      title: 'SEO Keywords',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Additional keywords for SEO optimization',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this tag is available for use',
    }),
    defineField({
      name: 'usageCount',
      title: 'Usage Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of posts using this tag (auto-updated)',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      description: 'description',
      color: 'color',
      category: 'category',
      usageCount: 'usageCount',
      isActive: 'isActive',
    },
    prepare({title, description, color, category, usageCount, isActive}) {
      const colorEmojis = {
        teal: '🟢',
        blue: '🔵',
        green: '🟢',
        orange: '🟠',
        red: '🔴',
        purple: '🟣',
        gray: '⚪',
      }
      
      const categoryEmojis = {
        technical: '⚙️',
        training: '🎓',
        safety: '🛡️',
        regulations: '📋',
        career: '💼',
        equipment: '🔧',
        general: '📝',
      }
      
      const colorEmoji = colorEmojis[color as keyof typeof colorEmojis] || '⚪'
      const categoryEmoji = categoryEmojis[category as keyof typeof categoryEmojis] || '📝'
      const statusEmoji = isActive ? '' : '❌ '
      
      return {
        title: `${statusEmoji}${colorEmoji} ${categoryEmoji} ${title}`,
        subtitle: `${description || 'No description'} • Used ${usageCount || 0} times`,
      }
    },
  },
  orderings: [
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [
        {field: 'title', direction: 'asc'}
      ]
    },
    {
      title: 'Usage Count (Most Used)',
      name: 'usageDesc',
      by: [
        {field: 'usageCount', direction: 'desc'},
        {field: 'title', direction: 'asc'}
      ]
    },
    {
      title: 'Category',
      name: 'category',
      by: [
        {field: 'category', direction: 'asc'},
        {field: 'title', direction: 'asc'}
      ]
    },
    {
      title: 'Recently Created',
      name: 'createdAtDesc',
      by: [
        {field: 'createdAt', direction: 'desc'}
      ]
    }
  ],
})