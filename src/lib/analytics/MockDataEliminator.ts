/**
 * MockDataEliminator Service
 * 
 * Automated service for scanning, cataloging, and removing mock data patterns
 * from the analytics codebase to ensure 100% genuine data authenticity.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

export interface MockDataReport {
  mathRandomInstances: MockDataInstance[];
  fallbackDataPatterns: MockDataInstance[];
  mockDataFiles: string[];
  totalIssues: number;
  scanTimestamp: Date;
}

export interface MockDataInstance {
  file: string;
  line: number;
  column: number;
  content: string;
  type: 'math_random' | 'fallback_data' | 'mock_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReplacementRule {
  pattern: RegExp;
  replacement: string;
  description: string;
}

export class MockDataEliminator {
  private readonly scanPatterns = {
    mathRandom: /Math\.random\(\)/g,
    mathRandomWithMultiplier: /Math\.random\(\)\s*\*\s*[\d.]+/g,
    mathRandomWithOperations: /Math\.random\(\)\s*[\*\+\-\/]\s*[\d.]+/g,
    fallbackData: /fallback.*data|mock.*data|dummy.*data/gi,
    randomNumberGeneration: /Math\.floor\(Math\.random\(\)/g,
    testMockData: /mock[A-Z]\w*Data/g,
  };

  private readonly replacementRules: ReplacementRule[] = [
    {
      pattern: /Math\.random\(\)\s*\*\s*([\d.]+)\s*-\s*([\d.]+)/g,
      replacement: 'null // Replaced mock trend calculation - use genuine API data',
      description: 'Replace random trend calculations with null'
    },
    {
      pattern: /Math\.random\(\)\s*\*\s*([\d.]+)/g,
      replacement: 'null // Replaced random value - use genuine API data',
      description: 'Replace random multiplier patterns with null'
    },
    {
      pattern: /Math\.floor\(Math\.random\(\)\s*\*\s*[\d.]+\)/g,
      replacement: 'null // Replaced random integer - use genuine API data',
      description: 'Replace random integer generation with null'
    }
  ];

  private readonly excludePatterns = [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    '**/coverage/**',
    '**/*.min.js'
  ];

  /**
   * Scan the entire codebase for mock data patterns
   */
  async scanCodebase(rootPath: string = 'src'): Promise<MockDataReport> {
    const report: MockDataReport = {
      mathRandomInstances: [],
      fallbackDataPatterns: [],
      mockDataFiles: [],
      totalIssues: 0,
      scanTimestamp: new Date()
    };

    try {
      // Get all TypeScript and JavaScript files
      const files = await glob(`${rootPath}/**/*.{ts,tsx,js,jsx}`, {
        ignore: this.excludePatterns
      });

      for (const file of files) {
        await this.scanFile(file, report);
      }

      report.totalIssues = 
        report.mathRandomInstances.length + 
        report.fallbackDataPatterns.length;

      return report;
    } catch (error) {
      console.error('Error scanning codebase:', error);
      throw new Error(`Failed to scan codebase: ${error}`);
    }
  }

  /**
   * Scan a single file for mock data patterns
   */
  private async scanFile(filePath: string, report: MockDataReport): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, lineIndex) => {
        // Check for Math.random() patterns
        this.findMatches(line, lineIndex + 1, filePath, this.scanPatterns.mathRandom, 'math_random', report.mathRandomInstances);
        this.findMatches(line, lineIndex + 1, filePath, this.scanPatterns.mathRandomWithMultiplier, 'math_random', report.mathRandomInstances);
        this.findMatches(line, lineIndex + 1, filePath, this.scanPatterns.mathRandomWithOperations, 'math_random', report.mathRandomInstances);
        this.findMatches(line, lineIndex + 1, filePath, this.scanPatterns.randomNumberGeneration, 'math_random', report.mathRandomInstances);

        // Check for fallback data patterns
        this.findMatches(line, lineIndex + 1, filePath, this.scanPatterns.fallbackData, 'fallback_data', report.fallbackDataPatterns);
        this.findMatches(line, lineIndex + 1, filePath, this.scanPatterns.testMockData, 'mock_pattern', report.fallbackDataPatterns);
      });

      // If file has issues, add to mock data files list
      const hasIssues = report.mathRandomInstances.some(instance => instance.file === filePath) ||
                       report.fallbackDataPatterns.some(instance => instance.file === filePath);
      
      if (hasIssues && !report.mockDataFiles.includes(filePath)) {
        report.mockDataFiles.push(filePath);
      }
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error);
    }
  }

  /**
   * Find pattern matches in a line of code
   */
  private findMatches(
    line: string, 
    lineNumber: number, 
    filePath: string, 
    pattern: RegExp, 
    type: MockDataInstance['type'],
    instances: MockDataInstance[]
  ): void {
    let match;
    const globalPattern = new RegExp(pattern.source, 'g');
    
    while ((match = globalPattern.exec(line)) !== null) {
      instances.push({
        file: filePath,
        line: lineNumber,
        column: match.index + 1,
        content: match[0],
        type,
        severity: this.getSeverity(type, match[0])
      });
    }
  }

  /**
   * Determine severity of mock data instance
   */
  private getSeverity(type: MockDataInstance['type'], content: string): MockDataInstance['severity'] {
    if (type === 'math_random') {
      if (content.includes('Math.random()')) {
        return 'critical';
      }
    }
    
    if (type === 'fallback_data') {
      if (content.toLowerCase().includes('fallback')) {
        return 'high';
      }
      return 'medium';
    }

    return 'low';
  }

  /**
   * Remove all Math.random() instances from the codebase
   */
  async removeMathRandom(rootPath: string = 'src'): Promise<void> {
    const report = await this.scanCodebase(rootPath);
    
    // Group instances by file
    const fileGroups = new Map<string, MockDataInstance[]>();
    
    [...report.mathRandomInstances, ...report.fallbackDataPatterns].forEach(instance => {
      if (!fileGroups.has(instance.file)) {
        fileGroups.set(instance.file, []);
      }
      fileGroups.get(instance.file)!.push(instance);
    });

    // Process each file
    for (const [filePath, instances] of fileGroups) {
      await this.processFile(filePath, instances);
    }
  }

  /**
   * Process a single file to remove mock data
   */
  private async processFile(filePath: string, instances: MockDataInstance[]): Promise<void> {
    try {
      let content = await fs.readFile(filePath, 'utf-8');
      
      // Apply replacement rules
      for (const rule of this.replacementRules) {
        content = content.replace(rule.pattern, rule.replacement);
      }

      // Write the updated content back
      await fs.writeFile(filePath, content, 'utf-8');
      
      console.log(`✅ Processed ${filePath}: Removed ${instances.length} mock data instances`);
    } catch (error) {
      console.error(`❌ Error processing file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Replace fallback data with NA displays
   */
  async replaceFallbackData(rootPath: string = 'src'): Promise<void> {
    const fallbackReplacements = [
      {
        pattern: /fallback.*data\s*=\s*[^;]+;/gi,
        replacement: '// Fallback data removed - use NAWrapperService.wrapValue() instead'
      },
      {
        pattern: /\|\|\s*\d+/g,
        replacement: '|| null // Use NAWrapperService for null handling'
      }
    ];

    const files = await glob(`${rootPath}/**/*.{ts,tsx}`, {
      ignore: this.excludePatterns
    });

    for (const file of files) {
      let content = await fs.readFile(file, 'utf-8');
      let modified = false;

      for (const replacement of fallbackReplacements) {
        const originalContent = content;
        content = content.replace(replacement.pattern, replacement.replacement);
        if (content !== originalContent) {
          modified = true;
        }
      }

      if (modified) {
        await fs.writeFile(file, content, 'utf-8');
        console.log(`✅ Updated fallback data in ${file}`);
      }
    }
  }

  /**
   * Validate that cleanup was successful
   */
  async validateCleanup(rootPath: string = 'src'): Promise<boolean> {
    const report = await this.scanCodebase(rootPath);
    
    if (report.totalIssues === 0) {
      console.log('✅ Cleanup validation successful: No mock data patterns found');
      return true;
    } else {
      console.log(`❌ Cleanup validation failed: ${report.totalIssues} issues remaining`);
      console.log('Remaining issues:', report);
      return false;
    }
  }

  /**
   * Generate a detailed report of mock data patterns
   */
  async generateReport(rootPath: string = 'src'): Promise<string> {
    const report = await this.scanCodebase(rootPath);
    
    let reportText = `# Mock Data Elimination Report\n\n`;
    reportText += `**Scan Date:** ${report.scanTimestamp.toISOString()}\n`;
    reportText += `**Total Issues:** ${report.totalIssues}\n\n`;

    if (report.mathRandomInstances.length > 0) {
      reportText += `## Math.random() Instances (${report.mathRandomInstances.length})\n\n`;
      report.mathRandomInstances.forEach(instance => {
        reportText += `- **${instance.file}:${instance.line}:${instance.column}** (${instance.severity})\n`;
        reportText += `  \`${instance.content}\`\n\n`;
      });
    }

    if (report.fallbackDataPatterns.length > 0) {
      reportText += `## Fallback Data Patterns (${report.fallbackDataPatterns.length})\n\n`;
      report.fallbackDataPatterns.forEach(instance => {
        reportText += `- **${instance.file}:${instance.line}:${instance.column}** (${instance.severity})\n`;
        reportText += `  \`${instance.content}\`\n\n`;
      });
    }

    if (report.mockDataFiles.length > 0) {
      reportText += `## Files with Mock Data (${report.mockDataFiles.length})\n\n`;
      report.mockDataFiles.forEach(file => {
        reportText += `- ${file}\n`;
      });
    }

    return reportText;
  }
}

// Export singleton instance
export const mockDataEliminator = new MockDataEliminator();