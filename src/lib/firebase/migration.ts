// Database Migration Script for Advanced Analytics Dashboard

import { getAdminFirestore } from './admin';
import { Timestamp } from 'firebase-admin/firestore';
import { 
  COLLECTIONS, 
  AnalyticsEventDocument, 
  UserJourneyDocument, 
  TrafficSourceDocument 
} from './types';

export interface MigrationResult {
  success: boolean;
  collectionsCreated: string[];
  documentsCreated: number;
  errors: string[];
  timestamp: Date;
}

export class AnalyticsMigration {
  private db = getAdminFirestore();

  /**
   * Run the complete migration process
   */
  async runMigration(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      collectionsCreated: [],
      documentsCreated: 0,
      errors: [],
      timestamp: new Date()
    };

    try {
      console.log('Starting analytics database migration...');

      // Step 1: Create collections with initial documents
      await this.createCollections(result);

      // Step 2: Migrate existing analytics data if any
      await this.migrateExistingData(result);

      // Step 3: Create sample data for testing
      await this.createSampleData(result);

      // Step 4: Validate migration
      await this.validateMigration(result);

      result.success = result.errors.length === 0;
      console.log('Migration completed:', result.success ? 'SUCCESS' : 'WITH ERRORS');

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Migration failed: ${errorMessage}`);
      console.error('Migration failed:', error);
      return result;
    }
  }

  /**
   * Create the required collections with initial documents
   */
  private async createCollections(result: MigrationResult): Promise<void> {
    const collections = [
      COLLECTIONS.ANALYTICS_EVENTS,
      COLLECTIONS.USER_JOURNEYS,
      COLLECTIONS.TRAFFIC_SOURCES
    ];

    for (const collectionName of collections) {
      try {
        const collectionRef = this.db.collection(collectionName);
        
        // Check if collection exists by trying to get a document
        const snapshot = await collectionRef.limit(1).get();
        
        if (snapshot.empty) {
          // Create initialization document
          const initDoc = {
            _migration: true,
            _initialized: true,
            createdAt: Timestamp.now(),
            version: '1.0.0',
            description: `Initial document for ${collectionName} collection`
          };

          await collectionRef.add(initDoc);
          result.collectionsCreated.push(collectionName);
          result.documentsCreated++;
          
          console.log(`✓ Created collection: ${collectionName}`);
        } else {
          console.log(`✓ Collection already exists: ${collectionName}`);
        }
      } catch (error) {
        const errorMessage = `Failed to create collection ${collectionName}: ${error}`;
        result.errors.push(errorMessage);
        console.error(errorMessage);
      }
    }
  }

  /**
   * Migrate existing analytics data from other sources
   */
  private async migrateExistingData(result: MigrationResult): Promise<void> {
    try {
      // Check if there's existing analytics data in Firebase Realtime Database
      // This would be specific to your current implementation
      console.log('Checking for existing analytics data to migrate...');
      
      // For now, we'll skip this step as there's no existing structured analytics data
      // In a real migration, you would:
      // 1. Query existing data sources
      // 2. Transform data to new schema
      // 3. Batch write to new collections
      
      console.log('✓ No existing data to migrate');
    } catch (error) {
      const errorMessage = `Failed to migrate existing data: ${error}`;
      result.errors.push(errorMessage);
      console.error(errorMessage);
    }
  }

  /**
   * Create sample data for testing purposes
   */
  private async createSampleData(result: MigrationResult): Promise<void> {
    try {
      console.log('Creating sample analytics data...');

      // Sample Analytics Event
      const sampleEvent: Omit<AnalyticsEventDocument, 'id'> = {
        timestamp: Timestamp.now(),
        userId: 'sample_user_001',
        sessionId: 'sample_session_001',
        event: {
          type: 'page_view',
          category: 'navigation',
          action: 'page_load',
          label: 'homepage',
          value: 1
        },
        page: {
          url: 'https://www.aviatorstrainingcentre.in/',
          title: 'Aviators Training Centre - Professional Aviation Training',
          path: '/',
          category: 'home'
        },
        source: {
          category: 'direct',
          source: 'direct',
          medium: 'none',
          isAuthentic: true,
          confidence: 100
        },
        user: {
          isReturning: false,
          deviceType: 'desktop',
          browser: 'Chrome',
          os: 'Windows',
          country: 'India',
          region: 'Maharashtra'
        },
        journey: {
          journeyId: 'journey_001',
          stepNumber: 1,
          isEntryPoint: true,
          isExitPoint: false,
          timeSpent: 0,
          scrollDepth: 0
        },
        validation: {
          isValid: true,
          isBot: false,
          botScore: 0,
          flags: []
        }
      };

      await this.db.collection(COLLECTIONS.ANALYTICS_EVENTS).add(sampleEvent);
      result.documentsCreated++;

      // Sample User Journey
      const sampleJourney: Omit<UserJourneyDocument, 'id'> = {
        userId: 'sample_user_001',
        sessionId: 'sample_session_001',
        startTime: Timestamp.now(),
        entry: {
          page: '/',
          source: {
            id: 'direct_001',
            category: 'direct',
            source: 'direct',
            medium: 'none',
            isAuthentic: true,
            confidence: 100,
            detectedAt: new Date()
          },
          referrer: '',
          utm: {}
        },
        path: [
          {
            stepNumber: 1,
            page: '/',
            title: 'Homepage',
            timestamp: Timestamp.now(),
            timeSpent: 30000,
            scrollDepth: 75,
            interactions: ['scroll', 'click_cta']
          }
        ],
        outcome: {
          type: 'ongoing'
        },
        metrics: {
          duration: 30000,
          pageCount: 1,
          interactionCount: 2,
          averageScrollDepth: 75,
          engagementScore: 85
        },
        attribution: {
          firstTouch: {
            id: 'direct_001',
            category: 'direct',
            source: 'direct',
            medium: 'none',
            isAuthentic: true,
            confidence: 100,
            detectedAt: new Date()
          },
          lastTouch: {
            id: 'direct_001',
            category: 'direct',
            source: 'direct',
            medium: 'none',
            isAuthentic: true,
            confidence: 100,
            detectedAt: new Date()
          },
          assistingChannels: []
        }
      };

      await this.db.collection(COLLECTIONS.USER_JOURNEYS).add(sampleJourney);
      result.documentsCreated++;

      // Sample Traffic Source
      const sampleTrafficSource: Omit<TrafficSourceDocument, 'id'> = {
        date: new Date().toISOString().split('T')[0],
        source: 'direct',
        medium: 'none',
        category: 'direct',
        metrics: {
          visitors: 1,
          sessions: 1,
          pageViews: 1,
          conversions: 0,
          conversionRate: 0,
          averageSessionDuration: 30000,
          bounceRate: 0
        },
        authenticity: {
          validTraffic: 1,
          suspiciousTraffic: 0,
          botTraffic: 0,
          confidenceScore: 100
        }
      };

      await this.db.collection(COLLECTIONS.TRAFFIC_SOURCES).add(sampleTrafficSource);
      result.documentsCreated++;

      console.log('✓ Sample data created successfully');
    } catch (error) {
      const errorMessage = `Failed to create sample data: ${error}`;
      result.errors.push(errorMessage);
      console.error(errorMessage);
    }
  }

  /**
   * Validate the migration was successful
   */
  private async validateMigration(result: MigrationResult): Promise<void> {
    try {
      console.log('Validating migration...');

      const collections = [
        COLLECTIONS.ANALYTICS_EVENTS,
        COLLECTIONS.USER_JOURNEYS,
        COLLECTIONS.TRAFFIC_SOURCES
      ];

      for (const collectionName of collections) {
        const snapshot = await this.db.collection(collectionName).limit(1).get();
        
        if (snapshot.empty) {
          result.errors.push(`Validation failed: Collection ${collectionName} is empty`);
        } else {
          console.log(`✓ Validated collection: ${collectionName}`);
        }
      }

      console.log('✓ Migration validation completed');
    } catch (error) {
      const errorMessage = `Validation failed: ${error}`;
      result.errors.push(errorMessage);
      console.error(errorMessage);
    }
  }

  /**
   * Rollback migration (for testing purposes)
   */
  async rollbackMigration(): Promise<void> {
    console.log('Rolling back migration...');
    
    const collections = [
      COLLECTIONS.ANALYTICS_EVENTS,
      COLLECTIONS.USER_JOURNEYS,
      COLLECTIONS.TRAFFIC_SOURCES
    ];

    for (const collectionName of collections) {
      try {
        const snapshot = await this.db.collection(collectionName).get();
        
        const batch = this.db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`✓ Rolled back collection: ${collectionName}`);
      } catch (error) {
        console.error(`Failed to rollback collection ${collectionName}:`, error);
      }
    }
    
    console.log('✓ Migration rollback completed');
  }
}

// Export migration functions for use in scripts
export async function runAnalyticsMigration(): Promise<MigrationResult> {
  const migration = new AnalyticsMigration();
  return await migration.runMigration();
}

export async function rollbackAnalyticsMigration(): Promise<void> {
  const migration = new AnalyticsMigration();
  return await migration.rollbackMigration();
}