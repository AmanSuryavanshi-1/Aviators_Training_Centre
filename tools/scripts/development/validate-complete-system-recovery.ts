#!/usr/bin/env node

/**
 * Complete System Recovery Validation Script
 * 
 * Comprehensive end-to-end testing to validate that the blog system
 * has been fully recovered and is functioning correctly.
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { SanityDiagnosticService } from '../lib/diagnostics/sanity-diagnostic-service';
import { SystemHealthMonitor } from '../lib/monitoring/system-health-monitor';
import { enhancedClient } from '../lib/sanity/client';

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
  console.log('\n' + colorize('='.repeat(70), 'cyan'));
  console.log(colorize(`🔍 ${title}`, 'bright'));
  console.log(colorize('='.repeat(70), 'cyan'));
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

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  duration?: number;
}

class SystemRecoveryValidator {
  private testResults: TestResult[] = [];
  private diagnosticService: SanityDiagnosticService;
  private healthMonitor: SystemHealthMonitor;

  constructor() {
    this.diagnosticService = new SanityDiagnosticService();
    this.healthMonitor = new SystemHealthMonitor();
  }

  private addResult(result: TestResult) {
    this.testResults.push(result);
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.duration) {
      console.log(`   Duration: ${result.duration}ms`);
    }
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
  }

  async runCompleteValidation(): Promise<void> {
    console.log(colorize('🚀 COMPLETE SYSTEM RECOVERY VALIDATION', 'bright'));
    console.log(colorize('='.repeat(70), 'cyan'));
    console.log('This comprehensive test validates that all blog system components');
    console.log('have been successfully recovered and are functioning correctly.\n');

    // Test 1: System Health Check
    await this.validateSystemHealth();

    // Test 2: Sanity Connection and Permissions
    await this.validateSanityConnection();

    // Test 3: Existing Posts Visibility
    await this.validateExistingPostsVisibility();

    // Test 4: Blog Creation Workflow
    await this.validateBlogCreationWorkflow();

    // Test 5: Admin Dashboard Functionality
    await this.validateAdminDashboard();

    // Test 6: API Endpoints
    await this.validateAPIEndpoints();

    // Test 7: Error Handling
    await this.validateErrorHandling();

    // Test 8: Performance Benchmarks
    await this.validatePerformance();

    // Generate final report
    this.generateFinalReport();
  }

  private async validateSystemHealth(): Promise<void> {
    logSection('SYSTEM HEALTH VALIDATION');

    const startTime = Date.now();
    try {
      const healthReport = await this.healthMonitor.performHealthCheck();
      const duration = Date.now() - startTime;

      if (healthReport.overall === 'healthy') {
        this.addResult({
          name: 'Overall System Health',
          status: 'pass',
          message: 'System is fully healthy',
          details: {
            healthy: healthReport.summary.healthy,
            degraded: healthReport.summary.degraded,
            unhealthy: healthReport.summary.unhealthy
          },
          duration
        });
      } else if (healthReport.overall === 'degraded') {
        this.addResult({
          name: 'Overall System Health',
          status: 'warning',
          message: 'System is functional but has some issues',
          details: {
            healthy: healthReport.summary.healthy,
            degraded: healthReport.summary.degraded,
            unhealthy: healthReport.summary.unhealthy,
            recommendations: healthReport.recommendations
          },
          duration
        });
      } else {
        this.addResult({
          name: 'Overall System Health',
          status: 'fail',
          message: 'System has critical health issues',
          details: {
            healthy: healthReport.summary.healthy,
            degraded: healthReport.summary.degraded,
            unhealthy: healthReport.summary.unhealthy,
            recommendations: healthReport.recommendations
          },
          duration
        });
      }

      // Individual component validation
      healthReport.components.forEach(component => {
        this.addResult({
          name: `Component: ${component.component}`,
          status: component.status === 'healthy' ? 'pass' : 
                  component.status === 'degraded' ? 'warning' : 'fail',
          message: component.message,
          details: { responseTime: component.responseTime }
        });
      });

    } catch (error) {
      this.addResult({
        name: 'System Health Check',
        status: 'fail',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async validateSanityConnection(): Promise<void> {
    logSection('SANITY CONNECTION VALIDATION');

    const startTime = Date.now();
    try {
      const diagnosticReport = await this.diagnosticService.generateDiagnosticReport();
      const duration = Date.now() - startTime;

      // Connection test
      this.addResult({
        name: 'Sanity Connection',
        status: diagnosticReport.connection.status === 'healthy' ? 'pass' : 'fail',
        message: diagnosticReport.connection.message,
        details: diagnosticReport.connection.details
      });

      // Read permissions test
      this.addResult({
        name: 'Read Permissions',
        status: diagnosticReport.readPermissions.status === 'healthy' ? 'pass' : 'fail',
        message: diagnosticReport.readPermissions.message,
        details: diagnosticReport.readPermissions.details
      });

      // Write permissions test
      this.addResult({
        name: 'Write Permissions',
        status: diagnosticReport.writePermissions.status === 'healthy' ? 'pass' : 'fail',
        message: diagnosticReport.writePermissions.message,
        details: diagnosticReport.writePermissions.details
      });

      // Data integrity test
      this.addResult({
        name: 'Data Integrity',
        status: diagnosticReport.dataIntegrity.status === 'healthy' ? 'pass' : 
                diagnosticReport.dataIntegrity.status === 'warning' ? 'warning' : 'fail',
        message: diagnosticReport.dataIntegrity.message,
        details: diagnosticReport.dataIntegrity.details,
        duration
      });

    } catch (error) {
      this.addResult({
        name: 'Sanity Connection Validation',
        status: 'fail',
        message: `Connection validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async validateExistingPostsVisibility(): Promise<void> {
    logSection('EXISTING POSTS VISIBILITY VALIDATION');

    const startTime = Date.now();
    try {
      // Test blog listing query
      const listingQuery = `
        *[_type == "post" && publishedAt <= now()] | order(publishedAt desc) {
          _id,
          title,
          slug,
          publishedAt,
          excerpt,
          author,
          category
        }[0...10]
      `;

      const posts = await enhancedClient.fetch(listingQuery, {}, { 
        cache: 'no-store',
        validateConnection: false 
      });

      const duration = Date.now() - startTime;

      if (posts.length >= 2) {
        this.addResult({
          name: 'Existing Posts Retrieval',
          status: 'pass',
          message: `Successfully retrieved ${posts.length} existing posts`,
          details: {
            postsFound: posts.length,
            sampleTitles: posts.slice(0, 3).map((p: any) => p.title)
          },
          duration
        });
      } else if (posts.length > 0) {
        this.addResult({
          name: 'Existing Posts Retrieval',
          status: 'warning',
          message: `Only ${posts.length} posts found (expected at least 2)`,
          details: { postsFound: posts.length },
          duration
        });
      } else {
        this.addResult({
          name: 'Existing Posts Retrieval',
          status: 'fail',
          message: 'No existing posts found',
          duration
        });
      }

      // Test individual post retrieval
      if (posts.length > 0) {
        const firstPost = posts[0];
        const individualPostQuery = `
          *[_type == "post" && slug.current == $slug][0] {
            _id,
            title,
            slug,
            body,
            publishedAt,
            excerpt,
            author,
            category
          }
        `;

        const individualStartTime = Date.now();
        const individualPost = await enhancedClient.fetch(individualPostQuery, 
          { slug: firstPost.slug.current }, 
          { cache: 'no-store', validateConnection: false }
        );
        const individualDuration = Date.now() - individualStartTime;

        if (individualPost) {
          this.addResult({
            name: 'Individual Post Retrieval',
            status: 'pass',
            message: 'Individual post retrieval working correctly',
            details: {
              slug: firstPost.slug.current,
              title: individualPost.title
            },
            duration: individualDuration
          });
        } else {
          this.addResult({
            name: 'Individual Post Retrieval',
            status: 'fail',
            message: 'Failed to retrieve individual post by slug',
            details: { slug: firstPost.slug.current },
            duration: individualDuration
          });
        }
      }

    } catch (error) {
      this.addResult({
        name: 'Existing Posts Visibility',
        status: 'fail',
        message: `Posts visibility test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async validateBlogCreationWorkflow(): Promise<void> {
    logSection('BLOG CREATION WORKFLOW VALIDATION');

    const startTime = Date.now();
    try {
      // Test creating a new blog post
      const testPost = {
        _type: 'post',
        title: `Recovery Validation Test - ${new Date().toISOString()}`,
        slug: { current: `recovery-validation-${Date.now()}` },
        excerpt: 'This is a test post created during system recovery validation to ensure the blog creation workflow is functioning correctly.',
        body: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'This test post validates that the complete blog creation workflow has been successfully recovered. It tests document creation, validation, and storage in Sanity CMS.'
              }
            ]
          }
        ],
        publishedAt: new Date().toISOString(),
        featured: false,
        readingTime: 1,
        category: 'System Test',
        author: 'System Validator',
        isRecoveryValidationTest: true
      };

      // Create the post
      const createStartTime = Date.now();
      const createdPost = await enhancedClient.create(testPost, { validateConnection: false });
      const createDuration = Date.now() - createStartTime;

      this.addResult({
        name: 'Blog Post Creation',
        status: 'pass',
        message: 'Successfully created test blog post',
        details: {
          id: createdPost._id,
          title: createdPost.title,
          slug: createdPost.slug?.current
        },
        duration: createDuration
      });

      // Test retrieving the created post
      const retrieveStartTime = Date.now();
      const retrievedPost = await enhancedClient.fetch(
        `*[_type == "post" && _id == $id][0]`,
        { id: createdPost._id },
        { cache: 'no-store', validateConnection: false }
      );
      const retrieveDuration = Date.now() - retrieveStartTime;

      if (retrievedPost) {
        this.addResult({
          name: 'Created Post Retrieval',
          status: 'pass',
          message: 'Successfully retrieved created post',
          details: { id: retrievedPost._id, title: retrievedPost.title },
          duration: retrieveDuration
        });
      } else {
        this.addResult({
          name: 'Created Post Retrieval',
          status: 'fail',
          message: 'Failed to retrieve created post',
          duration: retrieveDuration
        });
      }

      // Test updating the post
      const updateStartTime = Date.now();
      const updatedPost = await enhancedClient
        .patch(createdPost._id, { validateConnection: false })
        .set({ 
          title: `${testPost.title} - Updated`,
          excerpt: 'This post has been updated to test the update workflow.'
        })
        .commit();
      const updateDuration = Date.now() - updateStartTime;

      this.addResult({
        name: 'Blog Post Update',
        status: 'pass',
        message: 'Successfully updated test blog post',
        details: { id: updatedPost._id, newTitle: updatedPost.title },
        duration: updateDuration
      });

      // Clean up - delete the test post
      const deleteStartTime = Date.now();
      await enhancedClient.delete(createdPost._id, { validateConnection: false });
      const deleteDuration = Date.now() - deleteStartTime;

      this.addResult({
        name: 'Blog Post Deletion',
        status: 'pass',
        message: 'Successfully deleted test blog post',
        details: { id: createdPost._id },
        duration: deleteDuration
      });

      const totalDuration = Date.now() - startTime;
      this.addResult({
        name: 'Complete Blog Workflow',
        status: 'pass',
        message: 'Full CRUD workflow completed successfully',
        details: { 
          operations: ['create', 'read', 'update', 'delete'],
          totalTime: totalDuration
        },
        duration: totalDuration
      });

    } catch (error) {
      this.addResult({
        name: 'Blog Creation Workflow',
        status: 'fail',
        message: `Blog creation workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async validateAdminDashboard(): Promise<void> {
    logSection('ADMIN DASHBOARD VALIDATION');

    const startTime = Date.now();
    try {
      const fs = await import('fs');
      const path = await import('path');

      const adminComponents = [
        { path: 'app/admin/page.tsx', name: 'Admin Dashboard' },
        { path: 'app/admin/new/page.tsx', name: 'New Blog Page' },
        { path: 'components/admin/ManualBlogEditor.tsx', name: 'Blog Editor' },
        { path: 'components/admin/ImageUploader.tsx', name: 'Image Uploader' },
        { path: 'components/admin/SystemHealthDashboard.tsx', name: 'Health Dashboard' }
      ];

      let existingComponents = 0;
      const componentDetails = [];

      for (const component of adminComponents) {
        const componentPath = path.default.join(process.cwd(), component.path);
        const exists = fs.default.existsSync(componentPath);
        
        if (exists) {
          existingComponents++;
          componentDetails.push({ name: component.name, status: 'exists' });
        } else {
          componentDetails.push({ name: component.name, status: 'missing' });
        }
      }

      const duration = Date.now() - startTime;

      if (existingComponents === adminComponents.length) {
        this.addResult({
          name: 'Admin Dashboard Components',
          status: 'pass',
          message: 'All admin dashboard components are available',
          details: { 
            totalComponents: adminComponents.length,
            existingComponents,
            components: componentDetails
          },
          duration
        });
      } else if (existingComponents > adminComponents.length / 2) {
        this.addResult({
          name: 'Admin Dashboard Components',
          status: 'warning',
          message: `${existingComponents}/${adminComponents.length} admin components available`,
          details: { 
            totalComponents: adminComponents.length,
            existingComponents,
            components: componentDetails
          },
          duration
        });
      } else {
        this.addResult({
          name: 'Admin Dashboard Components',
          status: 'fail',
          message: `Only ${existingComponents}/${adminComponents.length} admin components available`,
          details: { 
            totalComponents: adminComponents.length,
            existingComponents,
            components: componentDetails
          },
          duration
        });
      }

    } catch (error) {
      this.addResult({
        name: 'Admin Dashboard Validation',
        status: 'fail',
        message: `Admin dashboard validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async validateAPIEndpoints(): Promise<void> {
    logSection('API ENDPOINTS VALIDATION');

    const startTime = Date.now();
    try {
      const fs = await import('fs');
      const path = await import('path');

      const apiEndpoints = [
        { path: 'app/api/blogs/enhanced/route.ts', name: 'Enhanced Blog API' },
        { path: 'app/api/health/system/route.ts', name: 'System Health API' },
        { path: 'app/api/blog/posts/route.ts', name: 'Blog Posts API' },
        { path: 'app/api/blog/health/route.ts', name: 'Blog Health API' }
      ];

      let existingEndpoints = 0;
      const endpointDetails = [];

      for (const endpoint of apiEndpoints) {
        const endpointPath = path.default.join(process.cwd(), endpoint.path);
        const exists = fs.default.existsSync(endpointPath);
        
        if (exists) {
          existingEndpoints++;
          
          // Check if the endpoint has proper handlers
          const content = fs.default.readFileSync(endpointPath, 'utf8');
          const hasGet = content.includes('export async function GET');
          const hasPost = content.includes('export async function POST');
          const hasPut = content.includes('export async function PUT');
          
          endpointDetails.push({ 
            name: endpoint.name, 
            status: 'exists',
            handlers: { GET: hasGet, POST: hasPost, PUT: hasPut }
          });
        } else {
          endpointDetails.push({ name: endpoint.name, status: 'missing' });
        }
      }

      const duration = Date.now() - startTime;

      if (existingEndpoints === apiEndpoints.length) {
        this.addResult({
          name: 'API Endpoints',
          status: 'pass',
          message: 'All required API endpoints are available',
          details: { 
            totalEndpoints: apiEndpoints.length,
            existingEndpoints,
            endpoints: endpointDetails
          },
          duration
        });
      } else if (existingEndpoints > apiEndpoints.length / 2) {
        this.addResult({
          name: 'API Endpoints',
          status: 'warning',
          message: `${existingEndpoints}/${apiEndpoints.length} API endpoints available`,
          details: { 
            totalEndpoints: apiEndpoints.length,
            existingEndpoints,
            endpoints: endpointDetails
          },
          duration
        });
      } else {
        this.addResult({
          name: 'API Endpoints',
          status: 'fail',
          message: `Only ${existingEndpoints}/${apiEndpoints.length} API endpoints available`,
          details: { 
            totalEndpoints: apiEndpoints.length,
            existingEndpoints,
            endpoints: endpointDetails
          },
          duration
        });
      }

    } catch (error) {
      this.addResult({
        name: 'API Endpoints Validation',
        status: 'fail',
        message: `API endpoints validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async validateErrorHandling(): Promise<void> {
    logSection('ERROR HANDLING VALIDATION');

    const startTime = Date.now();
    try {
      // Test 1: Invalid document creation (should be handled gracefully)
      try {
        await enhancedClient.create({
          _type: 'post'
          // Missing required fields - should trigger validation
        }, { validateConnection: false });
        
        this.addResult({
          name: 'Invalid Data Handling',
          status: 'warning',
          message: 'System accepted invalid data (validation may be missing)'
        });
      } catch (validationError) {
        this.addResult({
          name: 'Invalid Data Handling',
          status: 'pass',
          message: 'System properly rejected invalid data',
          details: { 
            error: validationError instanceof Error ? validationError.message : 'Unknown error' 
          }
        });
      }

      // Test 2: Non-existent document retrieval
      const nonExistentQuery = `*[_type == "post" && _id == "non-existent-id"][0]`;
      const nonExistentResult = await enhancedClient.fetch(nonExistentQuery, {}, { 
        cache: 'no-store',
        validateConnection: false 
      });

      if (nonExistentResult === null) {
        this.addResult({
          name: 'Non-existent Data Handling',
          status: 'pass',
          message: 'System properly handles non-existent data queries'
        });
      } else {
        this.addResult({
          name: 'Non-existent Data Handling',
          status: 'warning',
          message: 'Unexpected result for non-existent data query'
        });
      }

      const duration = Date.now() - startTime;
      this.addResult({
        name: 'Error Handling System',
        status: 'pass',
        message: 'Error handling validation completed',
        duration
      });

    } catch (error) {
      this.addResult({
        name: 'Error Handling Validation',
        status: 'fail',
        message: `Error handling validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async validatePerformance(): Promise<void> {
    logSection('PERFORMANCE VALIDATION');

    const startTime = Date.now();
    try {
      // Test 1: Query performance
      const queryStartTime = Date.now();
      await enhancedClient.fetch(
        `*[_type == "post"][0...10] { _id, title, slug }`,
        {},
        { cache: 'no-store', validateConnection: false }
      );
      const queryDuration = Date.now() - queryStartTime;

      if (queryDuration < 1000) {
        this.addResult({
          name: 'Query Performance',
          status: 'pass',
          message: `Excellent query performance (${queryDuration}ms)`,
          duration: queryDuration
        });
      } else if (queryDuration < 3000) {
        this.addResult({
          name: 'Query Performance',
          status: 'warning',
          message: `Acceptable query performance (${queryDuration}ms)`,
          duration: queryDuration
        });
      } else {
        this.addResult({
          name: 'Query Performance',
          status: 'fail',
          message: `Poor query performance (${queryDuration}ms)`,
          duration: queryDuration
        });
      }

      // Test 2: Health check performance
      const healthStartTime = Date.now();
      await this.healthMonitor.performHealthCheck();
      const healthDuration = Date.now() - healthStartTime;

      if (healthDuration < 5000) {
        this.addResult({
          name: 'Health Check Performance',
          status: 'pass',
          message: `Good health check performance (${healthDuration}ms)`,
          duration: healthDuration
        });
      } else if (healthDuration < 10000) {
        this.addResult({
          name: 'Health Check Performance',
          status: 'warning',
          message: `Acceptable health check performance (${healthDuration}ms)`,
          duration: healthDuration
        });
      } else {
        this.addResult({
          name: 'Health Check Performance',
          status: 'fail',
          message: `Poor health check performance (${healthDuration}ms)`,
          duration: healthDuration
        });
      }

      const totalDuration = Date.now() - startTime;
      this.addResult({
        name: 'Performance Validation',
        status: 'pass',
        message: 'Performance validation completed',
        duration: totalDuration
      });

    } catch (error) {
      this.addResult({
        name: 'Performance Validation',
        status: 'fail',
        message: `Performance validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }

  private generateFinalReport(): void {
    logSection('FINAL RECOVERY VALIDATION REPORT');

    const passed = this.testResults.filter(r => r.status === 'pass').length;
    const warnings = this.testResults.filter(r => r.status === 'warning').length;
    const failed = this.testResults.filter(r => r.status === 'fail').length;
    const total = this.testResults.length;

    console.log(`\n📊 ${colorize('VALIDATION SUMMARY', 'bright')}`);
    console.log(`Total Tests: ${total}`);
    console.log(`${colorize(`✅ Passed: ${passed}`, 'green')}`);
    console.log(`${colorize(`⚠️  Warnings: ${warnings}`, 'yellow')}`);
    console.log(`${colorize(`❌ Failed: ${failed}`, 'red')}`);
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

    // Overall system status
    let overallStatus: string;
    let statusColor: keyof typeof colors;
    
    if (failed === 0 && warnings === 0) {
      overallStatus = 'FULLY RECOVERED';
      statusColor = 'green';
    } else if (failed === 0 && warnings <= 2) {
      overallStatus = 'MOSTLY RECOVERED';
      statusColor = 'yellow';
    } else if (failed <= 2) {
      overallStatus = 'PARTIALLY RECOVERED';
      statusColor = 'yellow';
    } else {
      overallStatus = 'RECOVERY INCOMPLETE';
      statusColor = 'red';
    }

    console.log(`\n🎯 ${colorize(`SYSTEM STATUS: ${overallStatus}`, statusColor)}`);

    // Critical issues
    const criticalIssues = this.testResults.filter(r => r.status === 'fail');
    if (criticalIssues.length > 0) {
      console.log(`\n🚨 ${colorize('CRITICAL ISSUES REQUIRING ATTENTION:', 'red')}`);
      criticalIssues.forEach(issue => {
        console.log(`   • ${issue.name}: ${issue.message}`);
      });
    }

    // Warnings
    const warningIssues = this.testResults.filter(r => r.status === 'warning');
    if (warningIssues.length > 0) {
      console.log(`\n⚠️  ${colorize('WARNINGS FOR REVIEW:', 'yellow')}`);
      warningIssues.forEach(warning => {
        console.log(`   • ${warning.name}: ${warning.message}`);
      });
    }

    // Recommendations
    console.log(`\n💡 ${colorize('RECOMMENDATIONS:', 'blue')}`);
    
    if (overallStatus === 'FULLY RECOVERED') {
      console.log('   ✅ System is fully recovered and operational');
      console.log('   📊 Continue regular monitoring and maintenance');
      console.log('   🔄 Set up automated health checks');
    } else if (overallStatus === 'MOSTLY RECOVERED') {
      console.log('   🔧 Address warning issues when convenient');
      console.log('   📊 Monitor system performance closely');
      console.log('   ✅ Core functionality is working correctly');
    } else {
      console.log('   🚨 Address critical issues immediately');
      console.log('   🔧 Review and fix failed components');
      console.log('   📞 Consider seeking additional technical support');
    }

    console.log(`\n${colorize('='.repeat(70), 'cyan')}`);
    console.log(colorize('🎉 SYSTEM RECOVERY VALIDATION COMPLETE', 'bright'));
    console.log(colorize('='.repeat(70), 'cyan'));
  }
}

// Run the validation
async function main() {
  const validator = new SystemRecoveryValidator();
  
  try {
    await validator.runCompleteValidation();
  } catch (error) {
    console.error(colorize('❌ Validation failed:', 'red'), error);
    process.exit(1);
  }
}

main();
