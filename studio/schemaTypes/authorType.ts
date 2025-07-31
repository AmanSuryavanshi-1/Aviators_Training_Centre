import {defineField, defineType} from 'sanity'

export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  groups: [
    {
      name: 'profile',
      title: 'Profile',
      default: true,
    },
    {
      name: 'permissions',
      title: 'Permissions',
    },
    {
      name: 'social',
      title: 'Social Media',
    },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      group: 'profile',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      group: 'profile',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'email',
      group: 'profile',
      validation: (rule) => rule.required(),
      description: 'Used for notifications and workflow management',
    }),
    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      group: 'profile',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          validation: (rule) => rule.required(),
        }
      ],
      validation: (rule) => rule.required(),
      description: 'Professional headshot (400x400px recommended)',
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      group: 'profile',
      rows: 4,
      validation: (rule) => rule.min(100).max(500),
      description: 'Professional biography highlighting aviation experience (optional)',
    }),
    defineField({
      name: 'role',
      title: 'Professional Role',
      type: 'string',
      group: 'profile',
      options: {
        list: [
          {title: 'Chief Flight Instructor', value: 'chief-flight-instructor'},
          {title: 'Senior Flight Instructor', value: 'senior-flight-instructor'},
          {title: 'Flight Instructor', value: 'flight-instructor'},
          {title: 'Airline Pilot', value: 'airline-pilot'},
          {title: 'Commercial Pilot', value: 'commercial-pilot'},
          {title: 'Aviation Consultant', value: 'aviation-consultant'},
          {title: 'Ground School Instructor', value: 'ground-school-instructor'},
          {title: 'Aviation Expert', value: 'aviation-expert'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'credentials',
      title: 'Aviation Credentials',
      type: 'array',
      group: 'profile',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'credential',
              title: 'Credential',
              type: 'string',
              options: {
                list: [
                  {title: 'ATPL (Airline Transport Pilot License)', value: 'ATPL'},
                  {title: 'CPL (Commercial Pilot License)', value: 'CPL'},
                  {title: 'PPL (Private Pilot License)', value: 'PPL'},
                  {title: 'CFI (Certified Flight Instructor)', value: 'CFI'},
                  {title: 'CFII (Certified Flight Instructor - Instrument)', value: 'CFII'},
                  {title: 'MEI (Multi-Engine Instructor)', value: 'MEI'},
                  {title: 'Type Rating', value: 'Type Rating'},
                  {title: 'Ground Instructor', value: 'Ground Instructor'},
                ],
              },
            },
            {
              name: 'details',
              title: 'Details',
              type: 'string',
              description: 'e.g., "Boeing 737", "10,000+ hours"',
            },
          ],
          preview: {
            select: {
              credential: 'credential',
              details: 'details',
            },
            prepare({credential, details}) {
              return {
                title: credential,
                subtitle: details,
              }
            },
          },
        },
      ],
      description: 'Aviation licenses and certifications (if you see a type mismatch error, please clear this field and re-add credentials)',
    }),
    defineField({
      name: 'experience',
      title: 'Experience Summary',
      type: 'object',
      group: 'profile',
      fields: [
        {
          name: 'totalFlightHours',
          title: 'Total Flight Hours',
          type: 'number',
          description: 'Total logged flight hours',
        },
        {
          name: 'yearsExperience',
          title: 'Years of Experience',
          type: 'number',
          description: 'Years in aviation industry',
        },
        {
          name: 'specializations',
          title: 'Specializations',
          type: 'array',
          of: [{type: 'string'}],
          description: 'Areas of expertise (e.g., "Instrument Training", "Commercial Operations")',
        },
      ],
    }),
    // Permission and Workflow Fields
    defineField({
      name: 'authorLevel',
      title: 'Author Level',
      type: 'string',
      group: 'permissions',
      options: {
        list: [
          {title: 'Admin Author', value: 'admin'},
          {title: 'Senior Author', value: 'senior'},
          {title: 'Regular Author', value: 'regular'},
          {title: 'Guest Author', value: 'guest'},
        ],
      },
      initialValue: 'regular',
      description: 'Determines publishing permissions and workflow requirements',
    }),
    defineField({
      name: 'permissions',
      title: 'Content Permissions',
      type: 'object',
      group: 'permissions',
      fields: [
        {
          name: 'canPublishDirectly',
          title: 'Can Publish Directly',
          type: 'boolean',
          initialValue: false,
          description: 'Can publish without editorial review',
        },
        {
          name: 'canEditOthersContent',
          title: 'Can Edit Others Content',
          type: 'boolean',
          initialValue: false,
          description: 'Can edit content created by other authors',
        },
        {
          name: 'canManageCategories',
          title: 'Can Manage Categories',
          type: 'boolean',
          initialValue: false,
          description: 'Can create and edit blog categories',
        },
        {
          name: 'canManageCourses',
          title: 'Can Manage Courses',
          type: 'boolean',
          initialValue: false,
          description: 'Can create and edit course information',
        },
        {
          name: 'requiresApproval',
          title: 'Requires Editorial Approval',
          type: 'boolean',
          initialValue: true,
          description: 'Content must be approved before publishing',
        },
      ],
    }),
    defineField({
      name: 'contentAreas',
      title: 'Content Areas',
      type: 'array',
      group: 'permissions',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Technical General', value: 'technical-general'},
          {title: 'Technical Specific', value: 'technical-specific'},
          {title: 'CPL Ground School', value: 'cpl-ground-school'},
          {title: 'ATPL Ground School', value: 'atpl-ground-school'},
          {title: 'Type Rating', value: 'type-rating'},
          {title: 'Career Guidance', value: 'career-guidance'},
          {title: 'Industry News', value: 'industry-news'},
          {title: 'Safety & Regulations', value: 'safety-regulations'},
        ],
      },
      description: 'Areas this author is authorized to write about',
    }),
    // Social Media Fields
    defineField({
      name: 'socialMedia',
      title: 'Social Media Profiles',
      type: 'object',
      group: 'social',
      fields: [
        {
          name: 'linkedin',
          title: 'LinkedIn Profile',
          type: 'url',
          description: 'Professional LinkedIn profile URL',
        },
        {
          name: 'twitter',
          title: 'Twitter/X Handle',
          type: 'string',
          description: 'Twitter/X username (without @)',
        },
        {
          name: 'website',
          title: 'Personal Website',
          type: 'url',
          description: 'Personal or professional website',
        },
      ],
    }),
    // Status and Activity Tracking
    defineField({
      name: 'status',
      title: 'Author Status',
      type: 'string',
      group: 'permissions',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Inactive', value: 'inactive'},
          {title: 'Suspended', value: 'suspended'},
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'joinedDate',
      title: 'Joined Date',
      type: 'date',
      group: 'permissions',
      initialValue: () => new Date().toISOString().split('T')[0],
    }),
    defineField({
      name: 'lastActive',
      title: 'Last Active',
      type: 'datetime',
      group: 'permissions',
      description: 'Automatically updated when author creates/edits content',
    }),
    // Notification Preferences
    defineField({
      name: 'notificationPreferences',
      title: 'Notification Preferences',
      type: 'object',
      group: 'permissions',
      fields: [
        {
          name: 'emailNotifications',
          title: 'Email Notifications',
          type: 'boolean',
          initialValue: true,
          description: 'Receive email notifications for workflow updates',
        },
        {
          name: 'reviewReminders',
          title: 'Review Reminders',
          type: 'boolean',
          initialValue: true,
          description: 'Receive reminders for content pending review',
        },
        {
          name: 'publishingUpdates',
          title: 'Publishing Updates',
          type: 'boolean',
          initialValue: true,
          description: 'Receive notifications when content is published',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      role: 'role',
      authorLevel: 'authorLevel',
      status: 'status',
    },
    prepare({title, media, role, authorLevel, status}) {
      const levelLabels = {
        admin: 'Admin',
        senior: 'Senior',
        regular: 'Regular',
        guest: 'Guest',
      }
      
      const statusLabels = {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Suspended',
      }
      
      const levelLabel = levelLabels[authorLevel as keyof typeof levelLabels] || 'Regular'
      const statusLabel = statusLabels[status as keyof typeof statusLabels] || 'Active'
      
      return {
        title: `${title} (${levelLabel} - ${statusLabel})`,
        media,
        subtitle: role || 'Aviation Professional',
      }
    },
  },
  orderings: [
    {
      title: 'Name (A-Z)',
      name: 'nameAsc',
      by: [
        {field: 'name', direction: 'asc'}
      ]
    },
    {
      title: 'Author Level',
      name: 'authorLevel',
      by: [
        {field: 'authorLevel', direction: 'asc'},
        {field: 'name', direction: 'asc'}
      ]
    },
    {
      title: 'Last Active',
      name: 'lastActive',
      by: [
        {field: 'lastActive', direction: 'desc'}
      ]
    },
    {
      title: 'Joined Date',
      name: 'joinedDate',
      by: [
        {field: 'joinedDate', direction: 'desc'}
      ]
    }
  ],
})
