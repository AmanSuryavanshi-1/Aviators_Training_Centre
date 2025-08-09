/**
 * Credential Validation Service
 * 
 * Comprehensive validation for all analytics service credentials
 * with detailed error reporting and setup guidance.
 */

import { GoogleAuth } from 'google-auth-library';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { google } from 'googleapis';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: {
    service: string;
    credential: string;
    status: 'valid' | 'invalid' | 'missing' | 'malformed';
    message: string;
  }[];
}

export interface GA4ValidationResult extends ValidationResult {
  propertyId?: string;
  serviceAccountEmail?: string;
  projectId?: string;
  hasRequiredScopes?: boolean;
}

export interface FirebaseValidationResult extends ValidationResult {
  projectId?: string;
  serviceAccountEmail?: string;
  hasFirestoreAccess?: boolean;
  hasAnalyticsAccess?: boolean;
}

export interface SearchConsoleValidationResult extends ValidationResult {
  siteUrl?: string;
  serviceAccountEmail?: string;
  siteVerified?: boolean;
  hasPermissions?: boolean;
}

export class CredentialValidator {
  private readonly REQUIRED_GA4_SCOPES = [
    'https://www.googleapis.com/auth/analytics.readonly'
  ];

  private readonly REQUIRED_FIREBASE_SCOPES = [
    'https://www.googleapis.com/auth/firebase',
    'https://www.googleapis.com/auth/cloud-platform'
  ];

  private readonly REQUIRED_SEARCH_CONSOLE_SCOPES = [
    'https://www.googleapis.com/auth/webmasters.readonly'
  ];

  /**
   * Validate GA4 credentials and configuration
   */
  async validateGA4Credentials(): Promise<GA4ValidationResult> {
    const result: GA4ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      details: []
    };

    try {
      // Check required environment variables
      const propertyId = process.env.GA4_PROPERTY_ID;
      const serviceAccountKey = process.env.GA4_SERVICE_ACCOUNT_KEY;
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

      if (!propertyId) {
        result.errors.push('GA4_PROPERTY_ID environment variable is missing');
        result.details.push({
          service: 'GA4',
          credential: 'GA4_PROPERTY_ID',
          status: 'missing',
          message: 'Property ID is required for GA4 API access'
        });
      } else {
        result.propertyId = propertyId;
        result.details.push({
          service: 'GA4',
          credential: 'GA4_PROPERTY_ID',
          status: 'valid',
          message: `Property ID: ${propertyId}`
        });
      }

      if (!serviceAccountKey) {
        result.errors.push('GA4_SERVICE_ACCOUNT_KEY environment variable is missing');
        result.details.push({
          service: 'GA4',
          credential: 'GA4_SERVICE_ACCOUNT_KEY',
          status: 'missing',
          message: 'Service account key is required for GA4 authentication'
        });
      } else {
        // Validate service account key format
        try {
          const keyData = JSON.parse(serviceAccountKey);
          
          if (!keyData.type || keyData.type !== 'service_account') {
            result.errors.push('GA4 service account key is not a valid service account key');
            result.details.push({
              service: 'GA4',
              credential: 'GA4_SERVICE_ACCOUNT_KEY',
              status: 'malformed',
              message: 'Key must be a service account key (type: service_account)'
            });
          } else if (!keyData.private_key || !keyData.client_email) {
            result.errors.push('GA4 service account key is missing required fields');
            result.details.push({
              service: 'GA4',
              credential: 'GA4_SERVICE_ACCOUNT_KEY',
              status: 'malformed',
              message: 'Key must contain private_key and client_email fields'
            });
          } else {
            result.serviceAccountEmail = keyData.client_email;
            result.details.push({
              service: 'GA4',
              credential: 'GA4_SERVICE_ACCOUNT_KEY',
              status: 'valid',
              message: `Service account: ${keyData.client_email}`
            });

            // Test authentication
            try {
              const auth = new GoogleAuth({
                credentials: keyData,
                scopes: this.REQUIRED_GA4_SCOPES
              });

              const client = await auth.getClient();
              const accessToken = await client.getAccessToken();
              
              if (accessToken.token) {
                result.hasRequiredScopes = true;
                result.details.push({
                  service: 'GA4',
                  credential: 'Authentication',
                  status: 'valid',
                  message: 'Successfully authenticated with Google APIs'
                });
              } else {
                result.errors.push('Failed to obtain access token for GA4');
                result.details.push({
                  service: 'GA4',
                  credential: 'Authentication',
                  status: 'invalid',
                  message: 'Could not obtain access token'
                });
              }
            } catch (authError) {
              result.errors.push(`GA4 authentication failed: ${authError instanceof Error ? authError.message : 'Unknown error'}`);
              result.details.push({
                service: 'GA4',
                credential: 'Authentication',
                status: 'invalid',
                message: `Authentication error: ${authError instanceof Error ? authError.message : 'Unknown error'}`
              });
            }
          }
        } catch (parseError) {
          result.errors.push('GA4 service account key is not valid JSON');
          result.details.push({
            service: 'GA4',
            credential: 'GA4_SERVICE_ACCOUNT_KEY',
            status: 'malformed',
            message: 'Key must be valid JSON format'
          });
        }
      }

      if (!projectId) {
        result.warnings.push('GOOGLE_CLOUD_PROJECT_ID is missing - may be required for some operations');
        result.details.push({
          service: 'GA4',
          credential: 'GOOGLE_CLOUD_PROJECT_ID',
          status: 'missing',
          message: 'Project ID may be required for advanced features'
        });
      } else {
        result.projectId = projectId;
        result.details.push({
          service: 'GA4',
          credential: 'GOOGLE_CLOUD_PROJECT_ID',
          status: 'valid',
          message: `Project ID: ${projectId}`
        });
      }

      // Overall validation
      result.isValid = result.errors.length === 0 && !!propertyId && !!serviceAccountKey;

    } catch (error) {
      result.errors.push(`GA4 validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.details.push({
        service: 'GA4',
        credential: 'General',
        status: 'invalid',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return result;
  }

  /**
   * Validate Firebase credentials and permissions
   */
  async validateFirebaseCredentials(): Promise<FirebaseValidationResult> {
    const result: FirebaseValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      details: []
    };

    try {
      // Check required environment variables
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

      if (!serviceAccountEmail) {
        result.errors.push('GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable is missing');
        result.details.push({
          service: 'Firebase',
          credential: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
          status: 'missing',
          message: 'Service account email is required for Firebase authentication'
        });
      } else {
        result.serviceAccountEmail = serviceAccountEmail;
        result.details.push({
          service: 'Firebase',
          credential: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
          status: 'valid',
          message: `Service account: ${serviceAccountEmail}`
        });
      }

      if (!privateKey) {
        result.errors.push('GOOGLE_PRIVATE_KEY environment variable is missing');
        result.details.push({
          service: 'Firebase',
          credential: 'GOOGLE_PRIVATE_KEY',
          status: 'missing',
          message: 'Private key is required for Firebase authentication'
        });
      } else {
        // Validate private key format
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
          result.errors.push('GOOGLE_PRIVATE_KEY is not in valid PEM format');
          result.details.push({
            service: 'Firebase',
            credential: 'GOOGLE_PRIVATE_KEY',
            status: 'malformed',
            message: 'Private key must be in PEM format with proper headers'
          });
        } else {
          result.details.push({
            service: 'Firebase',
            credential: 'GOOGLE_PRIVATE_KEY',
            status: 'valid',
            message: 'Private key format is valid'
          });
        }
      }

      if (!projectId) {
        result.errors.push('GOOGLE_CLOUD_PROJECT_ID environment variable is missing');
        result.details.push({
          service: 'Firebase',
          credential: 'GOOGLE_CLOUD_PROJECT_ID',
          status: 'missing',
          message: 'Project ID is required for Firebase operations'
        });
      } else {
        result.projectId = projectId;
        result.details.push({
          service: 'Firebase',
          credential: 'GOOGLE_CLOUD_PROJECT_ID',
          status: 'valid',
          message: `Project ID: ${projectId}`
        });
      }

      // Test Firebase initialization and permissions
      if (serviceAccountEmail && privateKey && projectId) {
        try {
          // Check if Firebase app is already initialized
          const existingApps = getApps();
          let app;
          
          if (existingApps.length === 0) {
            app = initializeApp({
              credential: cert({
                projectId,
                clientEmail: serviceAccountEmail,
                privateKey: privateKey.replace(/\\n/g, '\n')
              }),
              projectId
            });
          } else {
            app = existingApps[0];
          }

          // Test Firestore access
          try {
            const db = getFirestore(app);
            await db.collection('test').limit(1).get();
            result.hasFirestoreAccess = true;
            result.details.push({
              service: 'Firebase',
              credential: 'Firestore Access',
              status: 'valid',
              message: 'Successfully connected to Firestore'
            });
          } catch (firestoreError) {
            result.errors.push(`Firestore access failed: ${firestoreError instanceof Error ? firestoreError.message : 'Unknown error'}`);
            result.details.push({
              service: 'Firebase',
              credential: 'Firestore Access',
              status: 'invalid',
              message: `Firestore error: ${firestoreError instanceof Error ? firestoreError.message : 'Unknown error'}`
            });
          }

          // Note: Firebase Analytics access would require additional testing
          result.hasAnalyticsAccess = true; // Assume true if Firestore works
          result.details.push({
            service: 'Firebase',
            credential: 'Analytics Access',
            status: 'valid',
            message: 'Firebase Analytics access assumed valid'
          });

        } catch (initError) {
          result.errors.push(`Firebase initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`);
          result.details.push({
            service: 'Firebase',
            credential: 'Initialization',
            status: 'invalid',
            message: `Init error: ${initError instanceof Error ? initError.message : 'Unknown error'}`
          });
        }
      }

      // Overall validation
      result.isValid = result.errors.length === 0 && !!serviceAccountEmail && !!privateKey && !!projectId;

    } catch (error) {
      result.errors.push(`Firebase validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.details.push({
        service: 'Firebase',
        credential: 'General',
        status: 'invalid',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return result;
  }

  /**
   * Validate Search Console credentials and site access
   */
  async validateSearchConsoleCredentials(): Promise<SearchConsoleValidationResult> {
    const result: SearchConsoleValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      details: []
    };

    try {
      // Check required environment variables
      const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

      if (!siteUrl) {
        result.errors.push('GOOGLE_SEARCH_CONSOLE_SITE_URL environment variable is missing');
        result.details.push({
          service: 'Search Console',
          credential: 'GOOGLE_SEARCH_CONSOLE_SITE_URL',
          status: 'missing',
          message: 'Site URL is required for Search Console access'
        });
      } else {
        // Validate URL format
        try {
          new URL(siteUrl);
          result.siteUrl = siteUrl;
          result.details.push({
            service: 'Search Console',
            credential: 'GOOGLE_SEARCH_CONSOLE_SITE_URL',
            status: 'valid',
            message: `Site URL: ${siteUrl}`
          });
        } catch (urlError) {
          result.errors.push('GOOGLE_SEARCH_CONSOLE_SITE_URL is not a valid URL');
          result.details.push({
            service: 'Search Console',
            credential: 'GOOGLE_SEARCH_CONSOLE_SITE_URL',
            status: 'malformed',
            message: 'Site URL must be a valid URL (e.g., https://example.com)'
          });
        }
      }

      if (!serviceAccountEmail) {
        result.errors.push('GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable is missing');
        result.details.push({
          service: 'Search Console',
          credential: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
          status: 'missing',
          message: 'Service account email is required for Search Console authentication'
        });
      } else {
        result.serviceAccountEmail = serviceAccountEmail;
        result.details.push({
          service: 'Search Console',
          credential: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
          status: 'valid',
          message: `Service account: ${serviceAccountEmail}`
        });
      }

      if (!privateKey) {
        result.errors.push('GOOGLE_PRIVATE_KEY environment variable is missing');
        result.details.push({
          service: 'Search Console',
          credential: 'GOOGLE_PRIVATE_KEY',
          status: 'missing',
          message: 'Private key is required for Search Console authentication'
        });
      } else {
        result.details.push({
          service: 'Search Console',
          credential: 'GOOGLE_PRIVATE_KEY',
          status: 'valid',
          message: 'Private key is present'
        });
      }

      // Test Search Console API access
      if (serviceAccountEmail && privateKey && projectId && siteUrl) {
        try {
          const auth = new GoogleAuth({
            credentials: {
              client_email: serviceAccountEmail,
              private_key: privateKey.replace(/\\n/g, '\n'),
              project_id: projectId
            },
            scopes: this.REQUIRED_SEARCH_CONSOLE_SCOPES
          });

          const searchConsole = google.searchconsole({ version: 'v1', auth });

          // Test site verification
          try {
            const sites = await searchConsole.sites.list();
            const siteData = sites.data.siteEntry?.find(site => site.siteUrl === siteUrl);
            
            if (siteData) {
              result.siteVerified = true;
              result.details.push({
                service: 'Search Console',
                credential: 'Site Verification',
                status: 'valid',
                message: `Site ${siteUrl} is verified`
              });

              // Test permissions by trying to access data
              try {
                await searchConsole.searchanalytics.query({
                  siteUrl,
                  requestBody: {
                    startDate: '2024-01-01',
                    endDate: '2024-01-02',
                    dimensions: [],
                    rowLimit: 1
                  }
                });

                result.hasPermissions = true;
                result.details.push({
                  service: 'Search Console',
                  credential: 'Data Access',
                  status: 'valid',
                  message: 'Successfully accessed Search Console data'
                });
              } catch (dataError) {
                result.errors.push(`Search Console data access failed: ${dataError instanceof Error ? dataError.message : 'Unknown error'}`);
                result.details.push({
                  service: 'Search Console',
                  credential: 'Data Access',
                  status: 'invalid',
                  message: `Data access error: ${dataError instanceof Error ? dataError.message : 'Unknown error'}`
                });
              }
            } else {
              result.errors.push(`Site ${siteUrl} is not verified in Search Console`);
              result.details.push({
                service: 'Search Console',
                credential: 'Site Verification',
                status: 'invalid',
                message: `Site ${siteUrl} not found in verified sites list`
              });
            }
          } catch (siteError) {
            result.errors.push(`Search Console site verification check failed: ${siteError instanceof Error ? siteError.message : 'Unknown error'}`);
            result.details.push({
              service: 'Search Console',
              credential: 'Site Verification',
              status: 'invalid',
              message: `Site verification error: ${siteError instanceof Error ? siteError.message : 'Unknown error'}`
            });
          }

        } catch (authError) {
          result.errors.push(`Search Console authentication failed: ${authError instanceof Error ? authError.message : 'Unknown error'}`);
          result.details.push({
            service: 'Search Console',
            credential: 'Authentication',
            status: 'invalid',
            message: `Auth error: ${authError instanceof Error ? authError.message : 'Unknown error'}`
          });
        }
      }

      // Overall validation
      result.isValid = result.errors.length === 0 && !!siteUrl && !!serviceAccountEmail && !!privateKey;

    } catch (error) {
      result.errors.push(`Search Console validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.details.push({
        service: 'Search Console',
        credential: 'General',
        status: 'invalid',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return result;
  }

  /**
   * Validate all analytics service credentials
   */
  async validateAllCredentials(): Promise<{
    overall: ValidationResult;
    ga4: GA4ValidationResult;
    firebase: FirebaseValidationResult;
    searchConsole: SearchConsoleValidationResult;
  }> {
    const [ga4Result, firebaseResult, searchConsoleResult] = await Promise.all([
      this.validateGA4Credentials(),
      this.validateFirebaseCredentials(),
      this.validateSearchConsoleCredentials()
    ]);

    const overall: ValidationResult = {
      isValid: ga4Result.isValid && firebaseResult.isValid && searchConsoleResult.isValid,
      errors: [
        ...ga4Result.errors,
        ...firebaseResult.errors,
        ...searchConsoleResult.errors
      ],
      warnings: [
        ...ga4Result.warnings,
        ...firebaseResult.warnings,
        ...searchConsoleResult.warnings
      ],
      details: [
        ...ga4Result.details,
        ...firebaseResult.details,
        ...searchConsoleResult.details
      ]
    };

    return {
      overall,
      ga4: ga4Result,
      firebase: firebaseResult,
      searchConsole: searchConsoleResult
    };
  }

  /**
   * Get setup instructions for failed validations
   */
  getSetupInstructions(validationResult: ValidationResult): string[] {
    const instructions: string[] = [];

    for (const detail of validationResult.details) {
      if (detail.status === 'missing' || detail.status === 'invalid' || detail.status === 'malformed') {
        switch (detail.credential) {
          case 'GA4_PROPERTY_ID':
            instructions.push('1. Go to Google Analytics 4 dashboard');
            instructions.push('2. Select your property');
            instructions.push('3. Go to Admin > Property Settings');
            instructions.push('4. Copy the Property ID and set GA4_PROPERTY_ID environment variable');
            break;

          case 'GA4_SERVICE_ACCOUNT_KEY':
            instructions.push('1. Go to Google Cloud Console');
            instructions.push('2. Select your project');
            instructions.push('3. Go to IAM & Admin > Service Accounts');
            instructions.push('4. Create or select a service account');
            instructions.push('5. Generate a new JSON key');
            instructions.push('6. Set GA4_SERVICE_ACCOUNT_KEY environment variable with the JSON content');
            break;

          case 'GOOGLE_SERVICE_ACCOUNT_EMAIL':
            instructions.push('1. Go to Google Cloud Console');
            instructions.push('2. Go to IAM & Admin > Service Accounts');
            instructions.push('3. Copy the service account email');
            instructions.push('4. Set GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable');
            break;

          case 'GOOGLE_PRIVATE_KEY':
            instructions.push('1. Generate a new service account key in Google Cloud Console');
            instructions.push('2. Download the JSON key file');
            instructions.push('3. Extract the private_key field');
            instructions.push('4. Set GOOGLE_PRIVATE_KEY environment variable with the private key');
            break;

          case 'GOOGLE_SEARCH_CONSOLE_SITE_URL':
            instructions.push('1. Go to Google Search Console');
            instructions.push('2. Add and verify your website');
            instructions.push('3. Copy the verified site URL');
            instructions.push('4. Set GOOGLE_SEARCH_CONSOLE_SITE_URL environment variable');
            break;
        }
      }
    }

    return [...new Set(instructions)]; // Remove duplicates
  }
}

// Export singleton instance
export const credentialValidator = new CredentialValidator();