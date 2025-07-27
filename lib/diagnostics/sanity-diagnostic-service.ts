import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

export interface DiagnosticResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
  repairAction?: string;
  timestamp: Date;
}

export interface SanityDiagnosticReport {
  overall: 'healthy' | 'degraded' | 'critical';
  connection: DiagnosticResult;
  readPermissions: DiagnosticResult;
  writePermissions: DiagnosticResult;
  dataIntegrity: DiagnosticResult;
  recommendations: string[];
  timestamp: Date;
}

export class SanityDiagnosticService {
  private client: any;
  private projectId: string;
  private dataset: string;
  private token: string;

  constructor() {
    this.projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
    this.dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    this.token = process.env.SANITY_API_TOKEN || '';
    
    this.client = createClient({
      projectId: this.projectId,
      dataset: this.dataset,
      token: this.token,
      useCdn: false,
      apiVersion: '2023-05-03'
    });
  }

  async validateConnection(): Promise<DiagnosticResult> {
    const result: DiagnosticResult = {
      component: 'Sanity Connection',
      status: 'error',
      message: '',
      timestamp: new Date()
    };

    try {
      // Check if required environment variables are present
      if (!this.projectId || !this.dataset || !this.token) {
        result.message = 'Missing required Sanity environment variables';
        result.details = {
          projectId: !!this.projectId,
          dataset: !!this.dataset,
          token: !!this.token
        };
        result.repairAction = 'Check .env.local file for NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_TOKEN';
        return result;
      }

      // Test basic connection by fetching project info
      const projectInfo = await this.client.request({
        url: `/projects/${this.projectId}`,
        method: 'GET'
      });

      if (projectInfo) {
        result.status = 'healthy';
        result.message = 'Sanity connection established successfully';
        result.details = {
          projectId: this.projectId,
          dataset: this.dataset,
          projectName: projectInfo.displayName || 'Unknown'
        };
      }
    } catch (error: any) {
      result.message = `Connection failed: ${error?.message || error?.toString() || 'Unknown error'}`;
      result.details = { error: error?.toString() || 'Unknown error' };
      
      if (error.statusCode === 401) {
        result.repairAction = 'Check SANITY_API_TOKEN - it may be invalid or expired';
      } else if (error.statusCode === 404) {
        result.repairAction = 'Check NEXT_PUBLIC_SANITY_PROJECT_ID - project may not exist';
      } else {
        result.repairAction = 'Check network connection and Sanity service status';
      }
    }

    return result;
  }

  async testReadPermissions(): Promise<DiagnosticResult> {
    const result: DiagnosticResult = {
      component: 'Read Permissions',
      status: 'error',
      message: '',
      timestamp: new Date()
    };

    try {
      // Test reading blog posts
      const posts = await this.client.fetch(`
        *[_type == "post"] {
          _id,
          title,
          slug,
          publishedAt,
          _createdAt
        }[0...5]
      `);

      result.status = 'healthy';
      result.message = `Read permissions working - found ${posts.length} posts`;
      result.details = {
        postsFound: posts.length,
        samplePosts: posts.map((p: any) => ({ id: p._id, title: p.title }))
      };
    } catch (error: any) {
      result.message = `Read permission test failed: ${error?.message || error?.toString() || 'Unknown error'}`;
      result.details = { error: error?.toString() || 'Unknown error' };
      
      if (error.statusCode === 401) {
        result.repairAction = 'API token lacks read permissions - check token permissions in Sanity dashboard';
      } else {
        result.repairAction = 'Check if "post" document type exists in Sanity schema';
      }
    }

    return result;
  }

  async testWritePermissions(): Promise<DiagnosticResult> {
    const result: DiagnosticResult = {
      component: 'Write Permissions',
      status: 'error',
      message: '',
      timestamp: new Date()
    };

    try {
      // Create a test document
      const testDoc = {
        _type: 'post',
        title: `Diagnostic Test - ${new Date().toISOString()}`,
        slug: { current: `diagnostic-test-${Date.now()}` },
        content: [
          {
            _type: 'block',
            children: [{ _type: 'span', text: 'This is a diagnostic test post.' }]
          }
        ],
        publishedAt: new Date().toISOString(),
        isDiagnosticTest: true
      };

      const created = await this.client.create(testDoc);
      
      if (created._id) {
        // Clean up test document
        await this.client.delete(created._id);
        
        result.status = 'healthy';
        result.message = 'Write permissions working - test document created and deleted successfully';
        result.details = { testDocId: created._id };
      }
    } catch (error: any) {
      result.message = `Write permission test failed: ${error?.message || error?.toString() || 'Unknown error'}`;
      result.details = { error: error?.toString() || 'Unknown error' };
      
      if (error.statusCode === 401) {
        result.repairAction = 'API token lacks write permissions - check token permissions in Sanity dashboard';
      } else if (error.statusCode === 400) {
        result.repairAction = 'Document structure may not match Sanity schema - check post schema definition';
      } else {
        result.repairAction = 'Check API token write permissions and dataset access';
      }
    }

    return result;
  }

  async testDataIntegrity(): Promise<DiagnosticResult> {
    const result: DiagnosticResult = {
      component: 'Data Integrity',
      status: 'error',
      message: '',
      timestamp: new Date()
    };

    try {
      // Check for posts with required fields
      const posts = await this.client.fetch(`
        *[_type == "post"] {
          _id,
          title,
          slug,
          content,
          publishedAt,
          author,
          "hasTitle": defined(title),
          "hasSlug": defined(slug.current),
          "hasContent": defined(content),
          "hasPublishedAt": defined(publishedAt)
        }
      `);

      const issues = [];
      const validPosts = posts.filter((post: any) => {
        const isValid = post.hasTitle && post.hasSlug && post.hasContent;
        if (!isValid) {
          issues.push({
            id: post._id,
            title: post.title || 'Untitled',
            missingFields: [
              !post.hasTitle && 'title',
              !post.hasSlug && 'slug',
              !post.hasContent && 'content'
            ].filter(Boolean)
          });
        }
        return isValid;
      });

      if (issues.length === 0) {
        result.status = 'healthy';
        result.message = `All ${posts.length} posts have valid data structure`;
      } else {
        result.status = 'warning';
        result.message = `${issues.length} posts have data integrity issues`;
        result.repairAction = 'Review and fix posts with missing required fields';
      }

      result.details = {
        totalPosts: posts.length,
        validPosts: validPosts.length,
        issues: issues
      };
    } catch (error: any) {
      result.message = `Data integrity check failed: ${error?.message || error?.toString() || 'Unknown error'}`;
      result.details = { error: error?.toString() || 'Unknown error' };
      result.repairAction = 'Check Sanity connection and query permissions';
    }

    return result;
  }

  async generateDiagnosticReport(): Promise<SanityDiagnosticReport> {
    const connection = await this.validateConnection();
    const readPermissions = await this.testReadPermissions();
    const writePermissions = await this.testWritePermissions();
    const dataIntegrity = await this.testDataIntegrity();

    const results = [connection, readPermissions, writePermissions, dataIntegrity];
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;

    let overall: 'healthy' | 'degraded' | 'critical';
    if (errorCount > 0) {
      overall = 'critical';
    } else if (warningCount > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    const recommendations = [];
    if (connection.status === 'error') {
      recommendations.push('Fix Sanity connection issues before proceeding');
    }
    if (readPermissions.status === 'error') {
      recommendations.push('Resolve read permission issues to display blog posts');
    }
    if (writePermissions.status === 'error') {
      recommendations.push('Fix write permissions to enable blog post creation');
    }
    if (dataIntegrity.status === 'warning') {
      recommendations.push('Review and fix posts with data integrity issues');
    }
    if (overall === 'healthy') {
      recommendations.push('System is healthy - monitor regularly for issues');
    }

    return {
      overall,
      connection,
      readPermissions,
      writePermissions,
      dataIntegrity,
      recommendations,
      timestamp: new Date()
    };
  }
}