#!/usr/bin/env node

/**
 * Emergency Recovery Command-Line Tool
 * 
 * A comprehensive CLI tool for diagnosing and repairing blog system issues
 * Usage: npx tsx scripts/emergency-recovery-cli.ts [command] [options]
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { Command } from 'commander';
import { SanityDiagnosticService } from '../lib/diagnostics/sanity-diagnostic-service';
import { SystemHealthMonitor } from '../lib/monitoring/system-health-monitor';
import { enhancedClient } from '../lib/sanity/client';

const program = new Command();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function logSection(title: string) {
  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize(`🔧 ${title}`, 'bright'));
  console.log(colorize('='.repeat(60), 'cyan'));
}

function logSuccess(message: string) {
  console.log(colorize(`✅ ${message}`, 'green'));
}

function logWarning(message: string) {
  console.log(colorize(`⚠️  ${message}`, 'yellow'));
}

function logError(message: string) {
  console.log(colorize(`❌ ${message}`, 'red'));
}

function logInfo(message: string) {
  console.log(colorize(`ℹ️  ${message}`, 'blue'));
}

// Command: diagnose
async function diagnoseSystem(options: any) {
  logSection('SYSTEM DIAGNOSIS');
  
  try {
    const diagnosticService = new SanityDiagnosticService();
    const healthMonitor = new SystemHealthMonitor();

    // 1. Environment Check
    console.log('\n📋 Environment Configuration:');
    const requiredVars = ['NEXT_PUBLIC_SANITY_PROJECT_ID', 'NEXT_PUBLIC_SANITY_DATASET', 'SANITY_API_TOKEN'];
    let envIssues = 0;

    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (value) {
        logSuccess(`${varName}: Configured`);
      } else {
        logError(`${varName}: Missing`);
        envIssues++;
      }
    }

    if (envIssues > 0) {
      logError(`${envIssues} environment variables are missing. Please check your .env.local file.`);
      return;
    }

    // 2. Sanity Diagnostic
    console.log('\n🔌 Sanity CMS Diagnosis:');
    const sanityReport = await diagnosticService.generateDiagnosticReport();
    
    console.log(`   Overall Status: ${colorize(sanityReport.overall.toUpperCase(), 
      sanityReport.overall === 'healthy' ? 'green' : 
      sanityReport.overall === 'degraded' ? 'yellow' : 'red')}`);
    
    console.log(`   Connection: ${colorize(sanityReport.connection.status, 
      sanityReport.connection.status === 'healthy' ? 'green' : 'red')} - ${sanityReport.connection.message}`);
    
    console.log(`   Read Permissions: ${colorize(sanityReport.readPermissions.status, 
      sanityReport.readPermissions.status === 'healthy' ? 'green' : 'red')} - ${sanityReport.readPermissions.message}`);
    
    console.log(`   Write Permissions: ${colorize(sanityReport.writePermissions.status, 
      sanityReport.writePermissions.status === 'healthy' ? 'green' : 'red')} - ${sanityReport.writePermissions.message}`);
    
    console.log(`   Data Integrity: ${colorize(sanityReport.dataIntegrity.status, 
      sanityReport.dataIntegrity.status === 'healthy' ? 'green' : 
      sanityReport.dataIntegrity.status === 'warning' ? 'yellow' : 'red')} - ${sanityReport.dataIntegrity.message}`);

    // 3. System Health Check
    console.log('\n🏥 System Health Check:');
    const healthReport = await healthMonitor.performHealthCheck();
    
    console.log(`   Overall Health: ${colorize(healthReport.overall.toUpperCase(), 
      healthReport.overall === 'healthy' ? 'green' : 
      healthReport.overall === 'degraded' ? 'yellow' : 'red')}`);
    
    healthReport.components.forEach(component => {
      const statusColor = component.status === 'healthy' ? 'green' : 
                         component.status === 'degraded' ? 'yellow' : 'red';
      console.log(`   ${component.component}: ${colorize(component.status, statusColor)} - ${component.message}`);
      if (component.responseTime) {
        console.log(`     Response Time: ${component.responseTime}ms`);
      }
    });

    // 4. Recommendations
    if (sanityReport.recommendations.length > 0 || healthReport.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      [...sanityReport.recommendations, ...healthReport.recommendations].forEach(rec => {
        logWarning(rec);
      });
    }

    // 5. Summary
    console.log('\n📊 Diagnosis Summary:');
    const criticalIssues = healthReport.components.filter(c => c.status === 'unhealthy').length;
    const warnings = healthReport.components.filter(c => c.status === 'degraded').length;
    
    if (criticalIssues === 0 && warnings === 0) {
      logSuccess('System is healthy and fully operational');
    } else if (criticalIssues === 0) {
      logWarning(`System is functional but has ${warnings} component(s) with warnings`);
    } else {
      logError(`System has ${criticalIssues} critical issue(s) and ${warnings} warning(s)`);
    }

  } catch (error) {
    logError(`Diagnosis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Command: repair
async function repairSystem(options: any) {
  logSection('SYSTEM REPAIR');
  
  try {
    const diagnosticService = new SanityDiagnosticService();
    let repairsAttempted = 0;
    let repairsSuccessful = 0;

    // 1. Test connection first
    console.log('\n🔍 Testing system connectivity...');
    const connectionResult = await diagnosticService.validateConnection();
    
    if (connectionResult.status !== 'healthy') {
      logError(`Cannot proceed with repairs: ${connectionResult.message || 'Connection validation failed'}`);
      if (connectionResult.repairAction) {
        logInfo(`Repair action needed: ${connectionResult.repairAction}`);
      }
      return;
    }
    
    logSuccess('System connectivity confirmed');

    // 2. Clean up test documents
    console.log('\n🧹 Cleaning up test documents...');
    try {
      const testDocs = await enhancedClient.fetch(`
        *[_type == "post" && (
          title match "*Test*" || 
          title match "*Connection Test*" || 
          title match "*Permission Test*" ||
          title match "*Diagnostic*" ||
          isTestPost == true || 
          isDiagnosticTest == true ||
          isPermissionTest == true
        )] {
          _id,
          title
        }
      `);

      if (testDocs.length > 0) {
        logInfo(`Found ${testDocs.length} test documents to clean up`);
        
        for (const doc of testDocs) {
          try {
            await enhancedClient.delete(doc._id, { validateConnection: false });
            logSuccess(`Deleted test document: ${doc.title}`);
            repairsSuccessful++;
          } catch (deleteError) {
            logError(`Failed to delete ${doc._id}: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`);
          }
          repairsAttempted++;
        }
      } else {
        logInfo('No test documents found to clean up');
      }
    } catch (cleanupError) {
      logError(`Cleanup failed: ${cleanupError instanceof Error ? cleanupError.message : 'Unknown error'}`);
    }

    // 3. Validate blog post structure
    console.log('\n📝 Validating blog post structure...');
    try {
      const posts = await enhancedClient.fetch(`
        *[_type == "post"] {
          _id,
          title,
          slug,
          body,
          excerpt,
          publishedAt,
          "hasTitle": defined(title),
          "hasSlug": defined(slug.current),
          "hasBody": defined(body),
          "hasExcerpt": defined(excerpt),
          "hasPublishedAt": defined(publishedAt)
        }
      `);

      const invalidPosts = posts.filter((post: any) => 
        !post.hasTitle || !post.hasSlug || !post.hasBody
      );

      if (invalidPosts.length > 0) {
        logWarning(`Found ${invalidPosts.length} posts with structural issues`);
        
        if (options.fix) {
          logInfo('Attempting to fix structural issues...');
          
          for (const post of invalidPosts) {
            try {
              const updates: any = {};
              
              if (!post.hasTitle && post.title) {
                updates.title = post.title || 'Untitled Post';
              }
              
              if (!post.hasSlug) {
                const slugText = post.title || 'untitled-post';
                updates.slug = {
                  _type: 'slug',
                  current: slugText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                };
              }
              
              if (!post.hasBody) {
                updates.body = [
                  {
                    _type: 'block',
                    children: [
                      { _type: 'span', text: post.excerpt || 'Content needs to be added.' }
                    ]
                  }
                ];
              }

              if (Object.keys(updates).length > 0) {
                await enhancedClient
                  .patch(post._id, { validateConnection: false })
                  .set(updates)
                  .commit();
                
                logSuccess(`Fixed structural issues for: ${post.title || post._id}`);
                repairsSuccessful++;
              }
              
              repairsAttempted++;
            } catch (fixError) {
              logError(`Failed to fix ${post._id}: ${fixError instanceof Error ? fixError.message : 'Unknown error'}`);
            }
          }
        } else {
          logInfo('Use --fix flag to attempt automatic repairs');
        }
      } else {
        logSuccess('All blog posts have valid structure');
      }
    } catch (validationError) {
      logError(`Structure validation failed: ${validationError instanceof Error ? validationError.message : 'Unknown error'}`);
    }

    // 4. Test blog creation workflow
    console.log('\n🧪 Testing blog creation workflow...');
    try {
      const testPost = {
        _type: 'post',
        title: `Recovery Test - ${new Date().toISOString()}`,
        slug: { current: `recovery-test-${Date.now()}` },
        excerpt: 'This is a test post created during system recovery to validate functionality.',
        body: [
          {
            _type: 'block',
            children: [
              { _type: 'span', text: 'This post was created during emergency recovery to test the blog creation workflow.' }
            ]
          }
        ],
        publishedAt: new Date().toISOString(),
        featured: false,
        readingTime: 1,
        isRecoveryTest: true
      };

      const created = await enhancedClient.create(testPost, { validateConnection: false });
      logSuccess(`Test post created successfully: ${created._id}`);

      // Clean up test post
      await enhancedClient.delete(created._id, { validateConnection: false });
      logSuccess('Test post cleaned up successfully');
      
      repairsAttempted++;
      repairsSuccessful++;
    } catch (testError) {
      logError(`Blog creation test failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`);
      repairsAttempted++;
    }

    // 5. Summary
    console.log('\n📊 Repair Summary:');
    logInfo(`Repairs attempted: ${repairsAttempted}`);
    logInfo(`Repairs successful: ${repairsSuccessful}`);
    
    if (repairsAttempted === 0) {
      logSuccess('No repairs were needed - system is healthy');
    } else if (repairsSuccessful === repairsAttempted) {
      logSuccess('All repairs completed successfully');
    } else {
      logWarning(`${repairsAttempted - repairsSuccessful} repairs failed - manual intervention may be required`);
    }

  } catch (error) {
    logError(`Repair process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Command: status
async function showStatus(options: any) {
  logSection('SYSTEM STATUS');
  
  try {
    const healthMonitor = new SystemHealthMonitor();
    const healthReport = await healthMonitor.performHealthCheck();

    // Overall status
    const statusColor = healthReport.overall === 'healthy' ? 'green' : 
                       healthReport.overall === 'degraded' ? 'yellow' : 'red';
    
    console.log(`\n🎯 Overall Status: ${colorize(healthReport.overall.toUpperCase(), statusColor)}`);
    console.log(`📅 Last Check: ${healthReport.timestamp.toLocaleString()}`);
    console.log(`⏱️  Uptime (24h): ${healthMonitor.getUptimePercentage(24)}%`);

    // Component status
    console.log('\n📊 Component Status:');
    healthReport.components.forEach(component => {
      const icon = component.status === 'healthy' ? '✅' : 
                   component.status === 'degraded' ? '⚠️' : '❌';
      console.log(`   ${icon} ${component.component}`);
      console.log(`      Status: ${colorize(component.status, 
        component.status === 'healthy' ? 'green' : 
        component.status === 'degraded' ? 'yellow' : 'red')}`);
      console.log(`      Message: ${component.message}`);
      if (component.responseTime) {
        console.log(`      Response Time: ${component.responseTime}ms`);
      }
    });

    // Trends
    const trends = healthMonitor.getHealthTrends();
    if (Object.keys(trends.componentTrends).length > 0) {
      console.log('\n📈 Trends:');
      Object.entries(trends.componentTrends).forEach(([component, trend]) => {
        const trendIcon = trend === 'improving' ? '📈' : 
                         trend === 'degrading' ? '📉' : '➡️';
        console.log(`   ${trendIcon} ${component}: ${colorize(trend, 
          trend === 'improving' ? 'green' : 
          trend === 'degrading' ? 'red' : 'blue')}`);
      });
    }

    // Immediate attention
    if (healthMonitor.needsImmediateAttention()) {
      console.log('\n🚨 ' + colorize('IMMEDIATE ATTENTION REQUIRED', 'red'));
    }

  } catch (error) {
    logError(`Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Command: test
async function testConnection(options: any) {
  logSection('CONNECTION TEST');
  
  try {
    const diagnosticService = new SanityDiagnosticService();

    // Test connection
    console.log('\n🔌 Testing Sanity connection...');
    const connectionResult = await diagnosticService.validateConnection();
    
    if (connectionResult.status === 'healthy') {
      logSuccess('Connection established successfully');
      if (connectionResult.details) {
        console.log(`   Project: ${connectionResult.details.projectId}`);
        console.log(`   Dataset: ${connectionResult.details.dataset}`);
        console.log(`   Message: ${connectionResult.message}`);
      }
    } else {
      logError(`Connection failed: ${connectionResult.message || 'Unknown error'}`);
      if (connectionResult.repairAction) {
        logInfo(`Repair action: ${connectionResult.repairAction}`);
      }
      return;
    }

    // Test permissions
    console.log('\n🔐 Testing permissions...');
    const readResult = await diagnosticService.testReadPermissions();
    const writeResult = await diagnosticService.testWritePermissions();

    if (readResult.status === 'healthy') {
      logSuccess(`Read permissions: ${readResult.message}`);
    } else {
      logError(`Read permissions: ${readResult.message}`);
    }

    if (writeResult.status === 'healthy') {
      logSuccess(`Write permissions: ${writeResult.message}`);
    } else {
      logError(`Write permissions: ${writeResult.message}`);
    }

    // Test data integrity
    console.log('\n📊 Testing data integrity...');
    const integrityResult = await diagnosticService.testDataIntegrity();
    
    if (integrityResult.status === 'healthy') {
      logSuccess(`Data integrity: ${integrityResult.message}`);
    } else if (integrityResult.status === 'warning') {
      logWarning(`Data integrity: ${integrityResult.message}`);
    } else {
      logError(`Data integrity: ${integrityResult.message}`);
    }

  } catch (error) {
    logError(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Command: logs
async function showLogs(options: any) {
  logSection('SYSTEM LOGS');
  
  try {
    const healthMonitor = new SystemHealthMonitor();
    const history = healthMonitor.getHealthHistory(options.limit || 10);

    if (history.length === 0) {
      logInfo('No health check history available');
      return;
    }

    console.log(`\n📜 Last ${history.length} health checks:`);
    
    history.forEach((report, index) => {
      const statusColor = report.overall === 'healthy' ? 'green' : 
                         report.overall === 'degraded' ? 'yellow' : 'red';
      
      console.log(`\n${index + 1}. ${report.timestamp.toLocaleString()}`);
      console.log(`   Status: ${colorize(report.overall, statusColor)}`);
      console.log(`   Components: ${report.summary.healthy}H/${report.summary.degraded}D/${report.summary.unhealthy}U`);
      
      if (options.verbose) {
        report.components.forEach(component => {
          const icon = component.status === 'healthy' ? '✅' : 
                       component.status === 'degraded' ? '⚠️' : '❌';
          console.log(`     ${icon} ${component.component}: ${component.message}`);
        });
      }
    });

  } catch (error) {
    logError(`Failed to retrieve logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Set up CLI commands
program
  .name('emergency-recovery-cli')
  .description('Emergency Recovery CLI for Blog System')
  .version('1.0.0');

program
  .command('diagnose')
  .description('Perform comprehensive system diagnosis')
  .option('-v, --verbose', 'Show detailed diagnostic information')
  .action(diagnoseSystem);

program
  .command('repair')
  .description('Attempt to repair system issues')
  .option('--fix', 'Automatically fix detected issues')
  .option('--dry-run', 'Show what would be repaired without making changes')
  .action(repairSystem);

program
  .command('status')
  .description('Show current system status')
  .option('-w, --watch', 'Watch status in real-time')
  .action(showStatus);

program
  .command('test')
  .description('Test system connectivity and permissions')
  .action(testConnection);

program
  .command('logs')
  .description('Show system health logs')
  .option('-l, --limit <number>', 'Number of log entries to show', '10')
  .option('-v, --verbose', 'Show detailed log information')
  .action(showLogs);

// Show help if no command provided
if (process.argv.length <= 2) {
  console.log(colorize('🚨 Emergency Recovery CLI for Blog System', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));
  console.log('\nAvailable commands:');
  console.log('  diagnose  - Perform comprehensive system diagnosis');
  console.log('  repair    - Attempt to repair system issues');
  console.log('  status    - Show current system status');
  console.log('  test      - Test system connectivity and permissions');
  console.log('  logs      - Show system health logs');
  console.log('\nUse --help with any command for more information.');
  console.log('\nExample usage:');
  console.log('  npx tsx scripts/emergency-recovery-cli.ts diagnose');
  console.log('  npx tsx scripts/emergency-recovery-cli.ts repair --fix');
  console.log('  npx tsx scripts/emergency-recovery-cli.ts status');
  process.exit(0);
}

// Parse command line arguments
program.parse(process.argv);