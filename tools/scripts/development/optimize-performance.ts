#!/usr/bin/env tsx

/**
 * Performance optimization script for blog system
 * Analyzes and optimizes database queries, API calls, and system performance
 */

import { performanceMonitor } from '../lib/monitoring/performance-monitor';
import { errorTracker } from '../lib/monitoring/error-tracker';
import { queryOptimizer } from '../lib/monitoring/query-optimizer';
import { healthChecker } from '../lib/monitoring/health-checker';

interface OptimizationReport {
  timestamp: string;
  performance: {
    slowOperations: Array<{
      operation: string;
      averageDuration: number;
      totalCalls: number;
      recommendation: string;
    }>;
    optimizationsApplied: number;
    estimatedImprovement: number;
  };
  cache: {
    hitRate: number;
    memoryUsage: number;
    optimizationsApplied: string[];
    recommendations: string[];
  };
  database: {
    queriesOptimized: number;
    estimatedSpeedup: number;
    recommendations: string[];
  };
  errors: {
    criticalIssues: number;
    resolvedIssues: number;
    recommendations: string[];
  };
  summary: {
    overallScore: number;
    criticalIssues: number;
    recommendations: string[];
  };
}

class PerformanceOptimizer {
  private report: OptimizationReport;

  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      performance: {
        slowOperations: [],
        optimizationsApplied: 0,
        estimatedImprovement: 0,
      },
      cache: {
        hitRate: 0,
        memoryUsage: 0,
        optimizationsApplied: [],
        recommendations: [],
      },
      database: {
        queriesOptimized: 0,
        estimatedSpeedup: 0,
        recommendations: [],
      },
      errors: {
        criticalIssues: 0,
        resolvedIssues: 0,
        recommendations: [],
      },
      summary: {
        overallScore: 0,
        criticalIssues: 0,
        recommendations: [],
      },
    };
  }

  async runOptimization(): Promise<OptimizationReport> {
    console.log('🚀 Starting performance optimization...');

    try {
      // Analyze current performance
      await this.analyzePerformance();
      
      // Optimize cache system
      await this.optimizeCache();
      
      // Optimize database queries
      await this.optimizeDatabase();
      
      // Analyze and resolve errors
      await this.analyzeErrors();
      
      // Generate overall recommendations
      this.generateSummary();
      
      console.log('✅ Performance optimization completed');
      return this.report;
      
    } catch (error) {
      console.error('❌ Performance optimization failed:', error);
      throw error;
    }
  }

  private async analyzePerformance(): Promise<void> {
    console.log('📊 Analyzing performance metrics...');
    
    const stats = performanceMonitor.getAllStats();
    const healthSummary = performanceMonitor.getHealthSummary();
    
    // Identify slow operations
    const slowOperations = stats.filter(stat => stat.averageDuration > 2000);
    
    this.report.performance.slowOperations = slowOperations.map(stat => ({
      operation: stat.operation,
      averageDuration: Math.round(stat.averageDuration),
      totalCalls: stat.totalCalls,
      recommendation: this.getPerformanceRecommendation(stat),
    }));

    console.log(`Found ${slowOperations.length} slow operations`);
  }

  private getPerformanceRecommendation(stat: any): string {
    if (stat.operation.includes('sanity') || stat.operation.includes('query')) {
      return 'Consider optimizing Sanity query with better field selection and filtering';
    }
    
    if (stat.operation.includes('cache')) {
      return 'Implement better caching strategy or increase cache TTL';
    }
    
    if (stat.operation.includes('blog')) {
      return 'Optimize blog data processing and reduce unnecessary computations';
    }
    
    return 'Review operation logic and optimize bottlenecks';
  }

  private async optimizeCache(): Promise<void> {
    console.log('🔧 Optimizing cache system...');
    
    const cacheStats = queryOptimizer.getCacheStats();
    const optimizationStats = queryOptimizer.getOptimizationStats();
    
    this.report.cache.hitRate = Math.round(cacheStats.hitRate * 100);
    this.report.cache.memoryUsage = Math.round(cacheStats.memoryUsage / 1024 / 1024);
    
    // Apply cache optimizations
    const optimizationsApplied = [];
    
    // Enable disabled optimizations if they show good improvement
    const disabledOptimizations = optimizationStats.optimizations.filter(
      opt => !opt.enabled && opt.improvement > 20
    );
    
    for (const optimization of disabledOptimizations) {
      queryOptimizer.toggleOptimization(optimization.operation, true);
      optimizationsApplied.push(`Enabled ${optimization.operation} optimization (+${optimization.improvement}%)`);
    }
    
    this.report.cache.optimizationsApplied = optimizationsApplied;
    this.report.performance.optimizationsApplied = optimizationsApplied.length;
    
    // Generate cache recommendations
    if (cacheStats.hitRate < 0.5) {
      this.report.cache.recommendations.push('Increase cache TTL to improve hit rate');
    }
    
    if (cacheStats.memoryUsage > 100 * 1024 * 1024) { // 100MB
      this.report.cache.recommendations.push('Reduce cache size or implement LRU eviction');
    }
    
    if (cacheStats.totalEntries > 1000) {
      this.report.cache.recommendations.push('Implement cache key optimization to reduce entries');
    }

    console.log(`Applied ${optimizationsApplied.length} cache optimizations`);
  }

  private async optimizeDatabase(): Promise<void> {
    console.log('🗄️ Optimizing database queries...');
    
    const optimizationStats = queryOptimizer.getOptimizationStats();
    
    // Count enabled optimizations
    const enabledOptimizations = optimizationStats.optimizations.filter(opt => opt.enabled);
    this.report.database.queriesOptimized = enabledOptimizations.length;
    
    // Calculate estimated speedup
    const totalImprovement = enabledOptimizations.reduce((sum, opt) => sum + opt.improvement, 0);
    this.report.database.estimatedSpeedup = Math.round(totalImprovement / enabledOptimizations.length);
    
    // Generate database recommendations
    const recommendations = [];
    
    if (optimizationStats.enabledOptimizations < optimizationStats.totalOptimizations) {
      recommendations.push('Enable remaining query optimizations for better performance');
    }
    
    if (optimizationStats.averageImprovement < 30) {
      recommendations.push('Review and update query optimization strategies');
    }
    
    // Add specific query recommendations
    recommendations.push('Consider adding database indexes for frequently queried fields');
    recommendations.push('Implement query result pagination for large datasets');
    recommendations.push('Use projection to limit returned fields in queries');
    
    this.report.database.recommendations = recommendations;

    console.log(`Optimized ${this.report.database.queriesOptimized} database queries`);
  }

  private async analyzeErrors(): Promise<void> {
    console.log('🔍 Analyzing error patterns...');
    
    const healthSummary = errorTracker.getHealthSummary();
    const unresolved = errorTracker.getUnresolvedErrors();
    
    this.report.errors.criticalIssues = healthSummary.criticalErrors;
    
    // Generate error recommendations
    const recommendations = [];
    
    if (healthSummary.criticalErrors > 0) {
      recommendations.push(`Resolve ${healthSummary.criticalErrors} critical errors immediately`);
    }
    
    if (healthSummary.lastHour.errors > 10) {
      recommendations.push('High error rate detected - investigate common error patterns');
    }
    
    if (unresolved.length > 50) {
      recommendations.push('Large number of unresolved errors - implement error resolution workflow');
    }
    
    // Add specific error handling recommendations
    recommendations.push('Implement retry logic for transient failures');
    recommendations.push('Add circuit breakers for external service calls');
    recommendations.push('Improve error logging and monitoring');
    
    this.report.errors.recommendations = recommendations;

    console.log(`Found ${this.report.errors.criticalIssues} critical issues`);
  }

  private generateSummary(): void {
    console.log('📋 Generating optimization summary...');
    
    // Calculate overall score (0-100)
    let score = 100;
    
    // Deduct points for issues
    score -= this.report.errors.criticalIssues * 20; // -20 per critical error
    score -= Math.max(0, (2000 - this.report.performance.slowOperations.length * 100)); // Slow operations penalty
    score -= Math.max(0, (50 - this.report.cache.hitRate)); // Cache hit rate penalty
    
    // Add points for optimizations
    score += this.report.performance.optimizationsApplied * 5; // +5 per optimization
    score += Math.min(20, this.report.database.estimatedSpeedup); // Up to +20 for speedup
    
    this.report.summary.overallScore = Math.max(0, Math.min(100, score));
    this.report.summary.criticalIssues = this.report.errors.criticalIssues;
    
    // Generate overall recommendations
    const recommendations = [];
    
    if (this.report.summary.overallScore < 70) {
      recommendations.push('System performance needs immediate attention');
    }
    
    if (this.report.errors.criticalIssues > 0) {
      recommendations.push('Resolve critical errors before optimizing performance');
    }
    
    if (this.report.cache.hitRate < 50) {
      recommendations.push('Focus on cache optimization for significant performance gains');
    }
    
    if (this.report.performance.slowOperations.length > 5) {
      recommendations.push('Optimize slow operations to improve user experience');
    }
    
    // Add general recommendations
    recommendations.push('Implement continuous performance monitoring');
    recommendations.push('Set up automated alerts for performance degradation');
    recommendations.push('Regular performance optimization should be part of maintenance');
    
    this.report.summary.recommendations = recommendations;
  }

  printReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE OPTIMIZATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n🎯 Overall Score: ${this.report.summary.overallScore}/100`);
    
    if (this.report.summary.overallScore >= 90) {
      console.log('✅ Excellent performance!');
    } else if (this.report.summary.overallScore >= 70) {
      console.log('⚠️  Good performance with room for improvement');
    } else {
      console.log('❌ Performance needs attention');
    }
    
    console.log(`\n📈 Performance Metrics:`);
    console.log(`   • Slow operations: ${this.report.performance.slowOperations.length}`);
    console.log(`   • Optimizations applied: ${this.report.performance.optimizationsApplied}`);
    
    console.log(`\n💾 Cache Metrics:`);
    console.log(`   • Hit rate: ${this.report.cache.hitRate}%`);
    console.log(`   • Memory usage: ${this.report.cache.memoryUsage}MB`);
    console.log(`   • Optimizations: ${this.report.cache.optimizationsApplied.length}`);
    
    console.log(`\n🗄️  Database Metrics:`);
    console.log(`   • Queries optimized: ${this.report.database.queriesOptimized}`);
    console.log(`   • Estimated speedup: ${this.report.database.estimatedSpeedup}%`);
    
    console.log(`\n🚨 Error Analysis:`);
    console.log(`   • Critical issues: ${this.report.errors.criticalIssues}`);
    
    if (this.report.performance.slowOperations.length > 0) {
      console.log(`\n🐌 Slow Operations:`);
      this.report.performance.slowOperations.forEach(op => {
        console.log(`   • ${op.operation}: ${op.averageDuration}ms (${op.totalCalls} calls)`);
        console.log(`     → ${op.recommendation}`);
      });
    }
    
    if (this.report.summary.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      this.report.summary.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }

  async saveReport(): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const reportPath = path.join(process.cwd(), 'performance-optimization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2));
    
    console.log(`📄 Report saved to: ${reportPath}`);
  }
}

// Main execution
async function main() {
  const optimizer = new PerformanceOptimizer();
  
  try {
    const report = await optimizer.runOptimization();
    optimizer.printReport();
    await optimizer.saveReport();
    
    // Exit with appropriate code
    process.exit(report.summary.criticalIssues > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { PerformanceOptimizer };
export type { OptimizationReport };
