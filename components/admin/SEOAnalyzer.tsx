'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Eye,
  Clock,
  Target,
  Globe,
  Code,
  BarChart3,
  Lightbulb,
  RefreshCw,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface SEOAnalyzerProps {
  content: {
    title: string;
    excerpt: string;
    content: string;
    focusKeyword?: string;
    additionalKeywords?: string[];
    seoTitle?: string;
    seoDescription?: string;
    slug?: string;
    category?: string;
    tags?: string[];
  };
  onSuggestionApply?: (field: string, value: string) => void;
  realTime?: boolean;
}

interface SEOIssue {
  type: 'critical' | 'warning' | 'suggestion' | 'good';
  category: 'title' | 'description' | 'content' | 'keywords' | 'structure' | 'readability';
  message: string;
  suggestion?: string;
  autoFix?: {
    field: string;
    value: string;
  };
  impact: 'high' | 'medium' | 'low';
  priority: number;
}

interface SEOMetrics {
  overallScore: number;
  titleScore: number;
  descriptionScore: number;
  contentScore: number;
  keywordScore: number;
  readabilityScore: number;
  structureScore: number;
}

interface ReadabilityMetrics {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  passiveVoicePercentage: number;
  sentenceCount: number;
  wordCount: number;
  paragraphCount: number;
}

interface KeywordAnalysis {
  density: number;
  frequency: number;
  prominence: number;
  distribution: number;
  variations: string[];
  relatedKeywords: string[];
}

export function SEOAnalyzer({ content, onSuggestionApply, realTime = true }: SEOAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  // Calculate SEO metrics and issues
  const analysis = useMemo(() => {
    return analyzeSEO(content);
  }, [content]);

  // Auto-analyze when content changes (if realTime is enabled)
  useEffect(() => {
    if (realTime && content.title && content.content) {
      const timer = setTimeout(() => {
        setLastAnalyzed(new Date());
      }, 1000); // Debounce analysis

      return () => clearTimeout(timer);
    }
  }, [content, realTime]);

  const handleManualAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setLastAnalyzed(new Date());
      toast.success('SEO analysis completed');
    }, 1500);
  };

  const handleApplySuggestion = (issue: SEOIssue) => {
    if (issue.autoFix && onSuggestionApply) {
      onSuggestionApply(issue.autoFix.field, issue.autoFix.value);
      toast.success('Suggestion applied successfully');
    }
  };

  const handleCopyStructuredData = () => {
    const structuredData = generateStructuredData(content);
    navigator.clipboard.writeText(JSON.stringify(structuredData, null, 2));
    toast.success('Structured data copied to clipboard');
  };

  const handleExportReport = () => {
    const report = {
      analysis,
      content: {
        title: content.title,
        excerpt: content.excerpt,
        wordCount: analysis.readability.wordCount,
        seoScore: analysis.metrics.overallScore,
      },
      timestamp: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `seo-analysis-${content.slug || 'report'}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('SEO report exported');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getIssueIcon = (type: SEOIssue['type']) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Analysis
          </h3>
          {lastAnalyzed && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Last analyzed: {lastAnalyzed.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall SEO Score</span>
            <Badge variant={getScoreBadgeVariant(analysis.metrics.overallScore)}>
              {analysis.metrics.overallScore}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={analysis.metrics.overallScore} className="h-3" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.metrics.titleScore)}`}>
                  {analysis.metrics.titleScore}
                </div>
                <div className="text-sm text-slate-500">Title</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.metrics.descriptionScore)}`}>
                  {analysis.metrics.descriptionScore}
                </div>
                <div className="text-sm text-slate-500">Description</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.metrics.contentScore)}`}>
                  {analysis.metrics.contentScore}
                </div>
                <div className="text-sm text-slate-500">Content</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.metrics.keywordScore)}`}>
                  {analysis.metrics.keywordScore}
                </div>
                <div className="text-sm text-slate-500">Keywords</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.metrics.readabilityScore)}`}>
                  {analysis.metrics.readabilityScore}
                </div>
                <div className="text-sm text-slate-500">Readability</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.metrics.structureScore)}`}>
                  {analysis.metrics.structureScore}
                </div>
                <div className="text-sm text-slate-500">Structure</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="issues">Issues & Suggestions</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="readability">Readability</TabsTrigger>
          <TabsTrigger value="structured-data">Structured Data</TabsTrigger>
        </TabsList>

        {/* Issues & Suggestions */}
        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                SEO Issues & Recommendations
              </CardTitle>
              <CardDescription>
                Address these issues to improve your SEO score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.issues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Great job! No issues found.
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Your content follows SEO best practices.
                    </p>
                  </div>
                ) : (
                  analysis.issues
                    .sort((a, b) => b.priority - a.priority)
                    .map((issue, index) => (
                      <Alert key={index} className={
                        issue.type === 'critical' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
                        issue.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
                        issue.type === 'suggestion' ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20' :
                        'border-green-200 bg-green-50 dark:bg-green-900/20'
                      }>
                        <div className="flex items-start gap-3">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1">
                            <AlertDescription className="mb-2">
                              <strong>{issue.message}</strong>
                              {issue.suggestion && (
                                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                  {issue.suggestion}
                                </div>
                              )}
                            </AlertDescription>
                            {issue.autoFix && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApplySuggestion(issue)}
                                className="mt-2"
                              >
                                Apply Suggestion
                              </Button>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {issue.impact} impact
                          </Badge>
                        </div>
                      </Alert>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords Analysis */}
        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Keyword Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {content.focusKeyword ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {analysis.keywordAnalysis.density.toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-500">Density</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {analysis.keywordAnalysis.frequency}
                      </div>
                      <div className="text-sm text-slate-500">Frequency</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {analysis.keywordAnalysis.prominence}/10
                      </div>
                      <div className="text-sm text-slate-500">Prominence</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {analysis.keywordAnalysis.distribution}/10
                      </div>
                      <div className="text-sm text-slate-500">Distribution</div>
                    </div>
                  </div>

                  {analysis.keywordAnalysis.variations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Keyword Variations Found
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywordAnalysis.variations.map((variation, index) => (
                          <Badge key={index} variant="secondary">
                            {variation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.keywordAnalysis.relatedKeywords.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Related Keywords Suggestions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywordAnalysis.relatedKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No Focus Keyword Set
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Set a focus keyword to analyze keyword optimization.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Readability Analysis */}
        <TabsContent value="readability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Readability Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {analysis.readability.fleschReadingEase.toFixed(0)}
                    </div>
                    <div className="text-sm text-slate-500">Reading Ease</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {analysis.readability.fleschKincaidGrade.toFixed(1)}
                    </div>
                    <div className="text-sm text-slate-500">Grade Level</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {analysis.readability.averageWordsPerSentence.toFixed(1)}
                    </div>
                    <div className="text-sm text-slate-500">Words/Sentence</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {analysis.readability.passiveVoicePercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-500">Passive Voice</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {analysis.readability.wordCount}
                    </div>
                    <div className="text-sm text-slate-500">Words</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {analysis.readability.sentenceCount}
                    </div>
                    <div className="text-sm text-slate-500">Sentences</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {analysis.readability.paragraphCount}
                    </div>
                    <div className="text-sm text-slate-500">Paragraphs</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Readability Assessment
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {getReadabilityAssessment(analysis.readability.fleschReadingEase)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Structured Data */}
        <TabsContent value="structured-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Structured Data Preview
              </CardTitle>
              <CardDescription>
                JSON-LD structured data that will be added to your page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyStructuredData}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy JSON-LD
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://search.google.com/test/rich-results', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test with Google
                  </Button>
                </div>

                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    {JSON.stringify(generateStructuredData(content), null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// SEO Analysis Functions
function analyzeSEO(content: SEOAnalyzerProps['content']) {
  const issues: SEOIssue[] = [];
  const metrics: SEOMetrics = {
    overallScore: 0,
    titleScore: 0,
    descriptionScore: 0,
    contentScore: 0,
    keywordScore: 0,
    readabilityScore: 0,
    structureScore: 0,
  };

  // Analyze title
  const titleAnalysis = analyzeTitle(content.title, content.seoTitle, content.focusKeyword);
  metrics.titleScore = titleAnalysis.score;
  issues.push(...titleAnalysis.issues);

  // Analyze description
  const descriptionAnalysis = analyzeDescription(content.excerpt, content.seoDescription, content.focusKeyword);
  metrics.descriptionScore = descriptionAnalysis.score;
  issues.push(...descriptionAnalysis.issues);

  // Analyze content
  const contentAnalysis = analyzeContent(content.content, content.focusKeyword);
  metrics.contentScore = contentAnalysis.score;
  issues.push(...contentAnalysis.issues);

  // Analyze keywords
  const keywordAnalysis = analyzeKeywords(content.content, content.focusKeyword, content.additionalKeywords);
  metrics.keywordScore = keywordAnalysis.score;
  issues.push(...keywordAnalysis.issues);

  // Analyze readability
  const readabilityAnalysis = analyzeReadability(content.content);
  metrics.readabilityScore = readabilityAnalysis.score;
  issues.push(...readabilityAnalysis.issues);

  // Analyze structure
  const structureAnalysis = analyzeStructure(content.content);
  metrics.structureScore = structureAnalysis.score;
  issues.push(...structureAnalysis.issues);

  // Calculate overall score
  metrics.overallScore = Math.round(
    (metrics.titleScore + 
     metrics.descriptionScore + 
     metrics.contentScore + 
     metrics.keywordScore + 
     metrics.readabilityScore + 
     metrics.structureScore) / 6
  );

  return {
    metrics,
    issues,
    readability: readabilityAnalysis.readability,
    keywordAnalysis: keywordAnalysis.keywordAnalysis,
  };
}

function analyzeTitle(title: string, seoTitle?: string, focusKeyword?: string) {
  const issues: SEOIssue[] = [];
  let score = 100;

  const titleToAnalyze = seoTitle || title;

  if (!titleToAnalyze) {
    issues.push({
      type: 'critical',
      category: 'title',
      message: 'Title is missing',
      suggestion: 'Add a compelling title for your blog post',
      impact: 'high',
      priority: 100,
    });
    score = 0;
  } else {
    if (titleToAnalyze.length < 30) {
      issues.push({
        type: 'warning',
        category: 'title',
        message: 'Title is too short',
        suggestion: 'Consider expanding your title to 30-60 characters for better SEO',
        impact: 'medium',
        priority: 70,
      });
      score -= 20;
    }

    if (titleToAnalyze.length > 60) {
      issues.push({
        type: 'warning',
        category: 'title',
        message: 'Title is too long',
        suggestion: 'Shorten your title to under 60 characters to prevent truncation in search results',
        autoFix: {
          field: 'seoTitle',
          value: titleToAnalyze.substring(0, 57) + '...',
        },
        impact: 'medium',
        priority: 80,
      });
      score -= 15;
    }

    if (focusKeyword && !titleToAnalyze.toLowerCase().includes(focusKeyword.toLowerCase())) {
      issues.push({
        type: 'suggestion',
        category: 'title',
        message: 'Focus keyword not found in title',
        suggestion: `Consider including "${focusKeyword}" in your title for better keyword optimization`,
        impact: 'medium',
        priority: 60,
      });
      score -= 25;
    }
  }

  return { score: Math.max(0, score), issues };
}

function analyzeDescription(excerpt: string, seoDescription?: string, focusKeyword?: string) {
  const issues: SEOIssue[] = [];
  let score = 100;

  const descriptionToAnalyze = seoDescription || excerpt;

  if (!descriptionToAnalyze) {
    issues.push({
      type: 'critical',
      category: 'description',
      message: 'Meta description is missing',
      suggestion: 'Add a compelling meta description to improve click-through rates',
      impact: 'high',
      priority: 90,
    });
    score = 0;
  } else {
    if (descriptionToAnalyze.length < 120) {
      issues.push({
        type: 'suggestion',
        category: 'description',
        message: 'Meta description is short',
        suggestion: 'Consider expanding to 120-160 characters for better search result visibility',
        impact: 'low',
        priority: 40,
      });
      score -= 10;
    }

    if (descriptionToAnalyze.length > 160) {
      issues.push({
        type: 'warning',
        category: 'description',
        message: 'Meta description is too long',
        suggestion: 'Shorten to under 160 characters to prevent truncation',
        autoFix: {
          field: 'seoDescription',
          value: descriptionToAnalyze.substring(0, 157) + '...',
        },
        impact: 'medium',
        priority: 75,
      });
      score -= 20;
    }

    if (focusKeyword && !descriptionToAnalyze.toLowerCase().includes(focusKeyword.toLowerCase())) {
      issues.push({
        type: 'suggestion',
        category: 'description',
        message: 'Focus keyword not found in meta description',
        suggestion: `Consider including "${focusKeyword}" in your meta description`,
        impact: 'medium',
        priority: 50,
      });
      score -= 15;
    }
  }

  return { score: Math.max(0, score), issues };
}

function analyzeContent(content: string, focusKeyword?: string) {
  const issues: SEOIssue[] = [];
  let score = 100;

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

  if (wordCount < 300) {
    issues.push({
      type: 'warning',
      category: 'content',
      message: 'Content is too short',
      suggestion: 'Aim for at least 300 words for better SEO performance',
      impact: 'high',
      priority: 85,
    });
    score -= 30;
  }

  if (wordCount > 3000) {
    issues.push({
      type: 'suggestion',
      category: 'content',
      message: 'Content is very long',
      suggestion: 'Consider breaking this into multiple posts or adding a table of contents',
      impact: 'low',
      priority: 20,
    });
    score -= 5;
  }

  // Check for headings
  const headingMatches = content.match(/^#{1,6}\s+.+$/gm);
  if (!headingMatches || headingMatches.length === 0) {
    issues.push({
      type: 'warning',
      category: 'structure',
      message: 'No headings found',
      suggestion: 'Add headings (H2, H3, etc.) to improve content structure and readability',
      impact: 'medium',
      priority: 65,
    });
    score -= 20;
  }

  return { score: Math.max(0, score), issues };
}

function analyzeKeywords(content: string, focusKeyword?: string, additionalKeywords?: string[]) {
  const issues: SEOIssue[] = [];
  let score = 100;
  let keywordAnalysis: KeywordAnalysis = {
    density: 0,
    frequency: 0,
    prominence: 0,
    distribution: 0,
    variations: [],
    relatedKeywords: [],
  };

  if (!focusKeyword) {
    issues.push({
      type: 'suggestion',
      category: 'keywords',
      message: 'No focus keyword set',
      suggestion: 'Set a focus keyword to optimize your content for search engines',
      impact: 'medium',
      priority: 55,
    });
    score -= 25;
  } else {
    const contentLower = content.toLowerCase();
    const keywordLower = focusKeyword.toLowerCase();
    const wordCount = content.split(/\s+/).length;
    
    // Calculate keyword frequency and density
    const keywordMatches = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
    keywordAnalysis.frequency = keywordMatches;
    keywordAnalysis.density = (keywordMatches / wordCount) * 100;

    if (keywordAnalysis.density < 0.5) {
      issues.push({
        type: 'suggestion',
        category: 'keywords',
        message: 'Keyword density is low',
        suggestion: `Consider using "${focusKeyword}" more frequently (current: ${keywordAnalysis.density.toFixed(1)}%)`,
        impact: 'medium',
        priority: 45,
      });
      score -= 15;
    }

    if (keywordAnalysis.density > 3) {
      issues.push({
        type: 'warning',
        category: 'keywords',
        message: 'Keyword density is too high',
        suggestion: `Reduce keyword usage to avoid over-optimization (current: ${keywordAnalysis.density.toFixed(1)}%)`,
        impact: 'medium',
        priority: 70,
      });
      score -= 25;
    }

    // Generate related keywords suggestions
    keywordAnalysis.relatedKeywords = generateRelatedKeywords(focusKeyword);
  }

  return { score: Math.max(0, score), issues, keywordAnalysis };
}

function analyzeReadability(content: string): { score: number; issues: SEOIssue[]; readability: ReadabilityMetrics } {
  const issues: SEOIssue[] = [];
  let score = 100;

  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  const readability: ReadabilityMetrics = {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    averageWordsPerSentence: words.length / sentences.length,
    averageSyllablesPerWord: calculateAverageSyllables(words),
    fleschReadingEase: 0,
    fleschKincaidGrade: 0,
    passiveVoicePercentage: calculatePassiveVoice(sentences),
  };

  // Calculate Flesch Reading Ease
  readability.fleschReadingEase = 206.835 - 
    (1.015 * readability.averageWordsPerSentence) - 
    (84.6 * readability.averageSyllablesPerWord);

  // Calculate Flesch-Kincaid Grade Level
  readability.fleschKincaidGrade = 
    (0.39 * readability.averageWordsPerSentence) + 
    (11.8 * readability.averageSyllablesPerWord) - 15.59;

  if (readability.fleschReadingEase < 60) {
    issues.push({
      type: 'suggestion',
      category: 'readability',
      message: 'Content may be difficult to read',
      suggestion: 'Consider using shorter sentences and simpler words to improve readability',
      impact: 'medium',
      priority: 40,
    });
    score -= 15;
  }

  if (readability.averageWordsPerSentence > 20) {
    issues.push({
      type: 'suggestion',
      category: 'readability',
      message: 'Sentences are too long',
      suggestion: 'Break down long sentences for better readability',
      impact: 'medium',
      priority: 35,
    });
    score -= 10;
  }

  if (readability.passiveVoicePercentage > 25) {
    issues.push({
      type: 'suggestion',
      category: 'readability',
      message: 'High passive voice usage',
      suggestion: 'Use more active voice to make your content more engaging',
      impact: 'low',
      priority: 25,
    });
    score -= 10;
  }

  return { score: Math.max(0, score), issues, readability };
}

function analyzeStructure(content: string) {
  const issues: SEOIssue[] = [];
  let score = 100;

  // Check for proper heading hierarchy
  const headings = content.match(/^(#{1,6})\s+(.+)$/gm) || [];
  if (headings.length === 0) {
    issues.push({
      type: 'warning',
      category: 'structure',
      message: 'No headings found',
      suggestion: 'Add headings to structure your content better',
      impact: 'medium',
      priority: 60,
    });
    score -= 25;
  }

  // Check for lists
  const lists = content.match(/^[\s]*[-*+]\s+.+$/gm) || [];
  if (lists.length === 0) {
    issues.push({
      type: 'suggestion',
      category: 'structure',
      message: 'No lists found',
      suggestion: 'Consider using bullet points or numbered lists to improve readability',
      impact: 'low',
      priority: 30,
    });
    score -= 5;
  }

  return { score: Math.max(0, score), issues };
}

// Helper functions
function calculateAverageSyllables(words: string[]): number {
  const totalSyllables = words.reduce((total, word) => {
    return total + countSyllables(word);
  }, 0);
  return totalSyllables / words.length;
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function calculatePassiveVoice(sentences: string[]): number {
  const passiveIndicators = ['was', 'were', 'been', 'being', 'be', 'is', 'are', 'am'];
  let passiveCount = 0;

  sentences.forEach(sentence => {
    const words = sentence.toLowerCase().split(/\s+/);
    const hasPassiveIndicator = passiveIndicators.some(indicator => words.includes(indicator));
    const hasPastParticiple = words.some(word => word.endsWith('ed') || word.endsWith('en'));
    
    if (hasPassiveIndicator && hasPastParticiple) {
      passiveCount++;
    }
  });

  return (passiveCount / sentences.length) * 100;
}

function generateRelatedKeywords(focusKeyword: string): string[] {
  // In a real implementation, this would use an API or database
  // For now, return some mock related keywords
  const baseKeywords = [
    `${focusKeyword} guide`,
    `${focusKeyword} tips`,
    `${focusKeyword} training`,
    `${focusKeyword} course`,
    `${focusKeyword} certification`,
    `best ${focusKeyword}`,
    `${focusKeyword} requirements`,
    `${focusKeyword} preparation`,
  ];
  
  return baseKeywords.slice(0, 5);
}

function getReadabilityAssessment(score: number): string {
  if (score >= 90) return 'Very Easy - Easily understood by an average 11-year-old student.';
  if (score >= 80) return 'Easy - Conversational English for consumers.';
  if (score >= 70) return 'Fairly Easy - Easily understood by 13- to 15-year-old students.';
  if (score >= 60) return 'Standard - Easily understood by 15- to 17-year-old students.';
  if (score >= 50) return 'Fairly Difficult - Understood by 17- to 18-year-old students.';
  if (score >= 30) return 'Difficult - Best understood by university graduates.';
  return 'Very Difficult - Best understood by university graduates with advanced degrees.';
}

function generateStructuredData(content: SEOAnalyzerProps['content']) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": content.seoTitle || content.title,
    "description": content.seoDescription || content.excerpt,
    "author": {
      "@type": "Organization",
      "name": "Aviators Training Centre",
      "url": "https://aviatorstrainingcentre.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Aviators Training Centre",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aviatorstrainingcentre.com/logo.png"
      }
    },
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://aviatorstrainingcentre.com/blog/${content.slug}`
    },
    "keywords": [content.focusKeyword, ...(content.additionalKeywords || [])].filter(Boolean).join(', '),
    "articleSection": content.category,
    "wordCount": content.content.split(/\s+/).length,
    "educationalLevel": "Professional",
    "learningResourceType": "Article",
    "about": {
      "@type": "Thing",
      "name": content.focusKeyword || "Aviation Training"
    }
  };
}