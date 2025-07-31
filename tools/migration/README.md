# Blog Migration Tools

Comprehensive tools for migrating existing blog data to Sanity CMS with validation, progress tracking, and error handling.

## Features

- **Multi-format Support**: Markdown, JSON, WordPress exports
- **Data Analysis**: Analyze existing blog structure and identify issues
- **Field Mapping**: Flexible field mapping from source to Sanity schema
- **Validation**: Comprehensive data validation with quality scoring
- **Batch Processing**: Process large datasets in configurable batches
- **Progress Tracking**: Real-time progress updates and detailed reporting
- **Dry Run Mode**: Test migrations without making changes
- **Backup Creation**: Automatic backup of existing data
- **Error Handling**: Detailed error reporting and recovery suggestions

## Installation

```bash
# Install dependencies
npm install

# Build the tools
npm run build

# Make CLI globally available (optional)
npm link
```

## Quick Start

1. **Initialize a migration configuration:**
   ```bash
   npm run init
   # or
   blog-migrator init
   ```

2. **Analyze your existing blog data:**
   ```bash
   npm run analyze ./content/blog
   # or
   blog-migrator analyze ./content/blog --output analysis-report.json
   ```

3. **Configure the migration:**
   Edit the generated `migration-config.json` file with your settings.

4. **Run a dry-run migration:**
   ```bash
   npm run migrate ./migration-config.json -- --dry-run
   # or
   blog-migrator migrate ./migration-config.json --dry-run
   ```

5. **Execute the actual migration:**
   ```bash
   blog-migrator migrate ./migration-config.json
   ```

## Configuration

### Sample Configuration File

```json
{
  "sourcePaths": [
    "./content/blog",
    "./data/posts"
  ],
  "sourceFormat": "auto",
  "sanityProjectId": "your-project-id",
  "sanityDataset": "production",
  "sanityToken": "your-api-token",
  "sanityApiVersion": "2024-01-01",
  "batchSize": 10,
  "dryRun": true,
  "skipValidation": false,
  "createMissingReferences": true,
  "overwriteExisting": false,
  "outputDir": "./migration-output",
  "generateReport": true,
  "backupBeforeMigration": true
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sourcePaths` | string[] | - | Paths to blog data directories or files |
| `sourceFormat` | string | "auto" | Data format: "markdown", "json", "wordpress", "auto" |
| `sanityProjectId` | string | - | Your Sanity project ID |
| `sanityDataset` | string | "production" | Sanity dataset name |
| `sanityToken` | string | - | Sanity API token with write permissions |
| `sanityApiVersion` | string | "2024-01-01" | Sanity API version |
| `batchSize` | number | 10 | Number of posts to process in each batch |
| `dryRun` | boolean | true | Run without making changes |
| `skipValidation` | boolean | false | Skip data validation |
| `createMissingReferences` | boolean | true | Create missing categories, authors, tags |
| `overwriteExisting` | boolean | false | Overwrite existing posts |
| `outputDir` | string | "./migration-output" | Output directory for reports and backups |
| `generateReport` | boolean | true | Generate detailed migration report |
| `backupBeforeMigration` | boolean | true | Create backup of existing data |

## CLI Commands

### `analyze`
Analyze existing blog data structure and identify potential issues.

```bash
blog-migrator analyze <paths...> [options]

Options:
  -o, --output <path>     Output path for analysis report
  -f, --format <format>   Expected data format (default: "auto")

Examples:
  blog-migrator analyze ./content/blog
  blog-migrator analyze ./posts ./articles --output analysis.json
```

### `validate`
Validate blog data for migration readiness.

```bash
blog-migrator validate <paths...> [options]

Options:
  -o, --output <path>     Output path for validation report
  -f, --format <format>   Data format (default: "markdown")

Examples:
  blog-migrator validate ./content/blog --format markdown
  blog-migrator validate ./data/posts.json --format json
```

### `migrate`
Migrate blog data to Sanity CMS.

```bash
blog-migrator migrate <config> [options]

Options:
  --dry-run              Run migration without making changes
  --force                Overwrite existing posts
  --batch-size <size>    Number of posts per batch (default: "10")

Examples:
  blog-migrator migrate ./config.json --dry-run
  blog-migrator migrate ./config.json --batch-size 5
  blog-migrator migrate ./config.json --force
```

### `init`
Create a sample migration configuration file.

```bash
blog-migrator init [path]

Examples:
  blog-migrator init
  blog-migrator init ./my-config.json
```

### `status`
Check migration status and Sanity connection.

```bash
blog-migrator status [options]

Options:
  -c, --config <path>    Path to configuration file

Examples:
  blog-migrator status
  blog-migrator status --config ./config.json
```

## Data Formats

### Markdown with Front Matter
```markdown
---
title: "My Blog Post"
date: "2024-01-15"
category: "Aviation"
tags: ["pilot", "training"]
author: "John Doe"
featured: true
---

# My Blog Post

This is the content of my blog post...
```

### JSON Format
```json
{
  "title": "My Blog Post",
  "slug": "my-blog-post",
  "published_at": "2024-01-15T10:00:00Z",
  "excerpt": "Brief description...",
  "body": "This is the content...",
  "category": "Aviation",
  "tags": ["pilot", "training"],
  "author": "John Doe"
}
```

### WordPress Export
Supports WordPress XML exports and database dumps.

## Field Mapping

The migration tools automatically map common field names to Sanity schema:

| Source Field | Sanity Field | Type | Notes |
|--------------|--------------|------|-------|
| `title` | `title` | string | Post title |
| `slug` | `slug` | slug | URL slug |
| `date`, `published_at` | `publishedAt` | datetime | Publication date |
| `description`, `excerpt` | `excerpt` | text | Post summary |
| `content`, `body` | `body` | blocks | Main content (converted to blocks) |
| `category` | `category` | reference | Category reference |
| `tags` | `tags` | array | Tag references |
| `author` | `author` | reference | Author reference |
| `image`, `featured_image` | `image` | image | Featured image |
| `featured` | `featured` | boolean | Featured status |

### Custom Field Mapping

You can customize field mapping by modifying the `fieldMapping.ts` file or creating custom transformation functions.

## Validation Rules

The migration tools include comprehensive validation:

### Required Fields
- `title`: Post title (10-100 characters)
- `slug`: URL-friendly slug
- `body`: Main content (not empty)
- `publishedAt`: Valid publication date

### Quality Checks
- **SEO**: Title length, meta description, keywords
- **Content**: Word count, readability
- **Accessibility**: Alt text for images
- **Structure**: Proper heading hierarchy

### Validation Scoring
Each post receives a quality score (0-100) based on:
- Required field completion
- SEO optimization
- Content quality
- Accessibility compliance

## Error Handling

The migration tools provide detailed error reporting:

### Error Types
- **Critical**: Missing required fields, invalid data types
- **High**: Validation failures, reference errors
- **Medium**: Format issues, constraint violations
- **Low**: Quality recommendations

### Recovery Strategies
- **Automatic**: Field transformation, default value assignment
- **Manual**: Detailed error reports with suggested fixes
- **Skip**: Continue migration while logging issues

## Progress Tracking

Real-time progress updates during migration:

1. **Analyzing**: Source data analysis
2. **Validating**: Data validation and quality checks
3. **Creating References**: Categories, authors, tags creation
4. **Migrating**: Actual data migration
5. **Complete**: Final report generation

## Backup and Recovery

### Automatic Backups
- Existing Sanity data backup before migration
- Source data preservation
- Configuration snapshots

### Recovery Options
- Rollback to previous state
- Selective post restoration
- Reference data recovery

## Troubleshooting

### Common Issues

**Connection Errors**
```bash
# Check Sanity connection
blog-migrator status --config ./config.json

# Verify API token permissions
# Ensure token has write access to dataset
```

**Validation Failures**
```bash
# Run validation separately
blog-migrator validate ./content/blog --output validation-report.md

# Check the report for specific issues
# Fix source data or adjust validation rules
```

**Memory Issues with Large Datasets**
```bash
# Reduce batch size
blog-migrator migrate ./config.json --batch-size 5

# Process in smaller chunks
# Split source data into multiple directories
```

**Rate Limiting**
```bash
# Increase delay between batches
# Reduce batch size
# Check Sanity plan limits
```

### Debug Mode

Enable detailed logging by setting environment variables:

```bash
DEBUG=migration:* blog-migrator migrate ./config.json
NODE_ENV=development blog-migrator migrate ./config.json
```

## Best Practices

### Before Migration
1. **Analyze** your data structure thoroughly
2. **Validate** all posts and fix critical issues
3. **Test** with a small subset using dry-run
4. **Backup** existing data
5. **Plan** for downtime if needed

### During Migration
1. **Monitor** progress and error logs
2. **Pause** if error rate is high
3. **Check** Sanity Studio for data integrity
4. **Verify** reference relationships

### After Migration
1. **Review** migration report
2. **Test** website functionality
3. **Verify** SEO metadata
4. **Update** internal links
5. **Monitor** for issues

## Support

For issues and questions:

1. Check the generated migration reports
2. Review the troubleshooting section
3. Examine error logs in the output directory
4. Test with a smaller dataset
5. Verify Sanity configuration and permissions

## Contributing

To contribute to the migration tools:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.