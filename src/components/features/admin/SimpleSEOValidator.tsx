'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Lightbulb,
  Search
} from 'lucide-react';

interface SimpleSEOValidatorProps {
  title: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  slug: string;
}

interface SEOIssue {
  type: 'critical' | 'warning' | 'suggestion' | 'good';
  message: string;
  suggestion?: string;
}

export function SimpleSEOValidator({
  title,
  seoTitle,
  seoDescription,
  focusKeyword,
  slug
}: SimpleSEOValidatorProps) {
  const [score, setScore] = useState(0);
  const [issues, setIssues] = useState<SEOIssue[]>([]);

  useEffect(() => {
    const newIssues: SEOIssue[] = [];
    let newScore = 100;

    // Check SEO title
    if (!seoTitle) {
      newIssues.push({
        type: 'warning',
        message: 'SEO title is missing',
        suggestion: 'Add an SEO title to improve search visibility'
      });
      newScore -= 20;
    } else if (seoTitle.length > 60) {
      newIssues.push({
        type: 'warning',
        message: 'SEO title is too long',
        suggestion: 'Keep your SEO title under 60 characters to prevent truncation in search results'
      });
      newScore -= 10;
    } else if (seoTitle.length < 30) {
      newIssues.push({
        type: 'suggestion',
        message: 'SEO title is short',
        suggestion: 'Consider making your SEO title between 30-60 characters for optimal visibility'
      });
      newScore -= 5;
    } else {
      newIssues.push({
        type: 'good',
        message: 'SEO title length is optimal'
      });
    }

    // Check SEO description
    if (!seoDescription) {
      newIssues.push({
        type: 'warning',
        message: 'SEO description is missing',
        suggestion: 'Add an SEO description to improve click-through rates from search results'
      });
      newScore -= 20;
    } else if (seoDescription.length > 160) {
      newIssues.push({
        type: 'warning',
        message: 'SEO description is too long',
        suggestion: 'Keep your SEO description under 160 characters to prevent truncation in search results'
      });
      newScore -= 10;
    } else if (seoDescription.length < 120) {
      newIssues.push({
        type: 'suggestion',
        message: 'SEO description is short',
        suggestion: 'Consider making your SEO description between 120-160 characters for optimal visibility'
      });
      newScore -= 5;
    } else {
      newIssues.push({
        type: 'good',
        message: 'SEO description length is optimal'
      });
    }

    // Check focus keyword
    if (!focusKeyword) {
      newIssues.push({
        type: 'warning',
        message: 'Focus keyword is missing',
        suggestion: 'Add a focus keyword to optimize your content for search engines'
      });
      newScore -= 15;
    } else {
      // Check if focus keyword is in title
      if (seoTitle && seoTitle.toLowerCase().includes(focusKeyword.toLowerCase())) {
        newIssues.push({
          type: 'good',
          message: 'Focus keyword is present in SEO title'
        });
      } else {
        newIssues.push({
          type: 'suggestion',
          message: 'Focus keyword not found in SEO title',
          suggestion: `Consider including "${focusKeyword}" in your SEO title`
        });
        newScore -= 10;
      }

      // Check if focus keyword is in description
      if (seoDescription && seoDescription.toLowerCase().includes(focusKeyword.toLowerCase())) {
        newIssues.push({
          type: 'good',
          message: 'Focus keyword is present in SEO description'
        });
      } else {
        newIssues.push({
          type: 'suggestion',
          message: 'Focus keyword not found in SEO description',
          suggestion: `Consider including "${focusKeyword}" in your SEO description`
        });
        newScore -= 10;
      }

      // Check if focus keyword is in slug
      if (slug && slug.toLowerCase().includes(focusKeyword.toLowerCase().replace(/\s+/g, '-'))) {
        newIssues.push({
          type: 'good',
          message: 'Focus keyword is present in URL slug'
        });
      } else {
        newIssues.push({
          type: 'suggestion',
          message: 'Focus keyword not found in URL slug',
          suggestion: `Consider including "${focusKeyword}" in your URL slug for better SEO`
        });
        newScore -= 10;
      }
    }

    // Check slug format and length
    if (slug) {
      if (slug.length > 60) {
        newIssues.push({
          type: 'warning',
          message: 'URL slug is too long',
          suggestion: 'Keep URL slugs under 60 characters for better SEO'
        });
        newScore -= 5;
      } else if (slug.includes('_') || slug.includes(' ')) {
        newIssues.push({
          type: 'warning',
          message: 'URL slug contains invalid characters',
          suggestion: 'Use hyphens (-) instead of underscores or spaces in URL slugs'
        });
        newScore -= 5;
      } else if (slug.length < 10) {
        newIssues.push({
          type: 'suggestion',
          message: 'URL slug is very short',
          suggestion: 'Consider making your URL slug more descriptive for better SEO'
        });
        newScore -= 3;
      } else {
        newIssues.push({
          type: 'good',
          message: 'URL slug format is SEO-friendly'
        });
      }
    } else {
      newIssues.push({
        type: 'critical',
        message: 'URL slug is missing',
        suggestion: 'Add a URL slug for proper SEO optimization'
      });
      newScore -= 25;
    }

    setScore(Math.max(0, newScore));
    setIssues(newIssues);
  }, [title, seoTitle, seoDescription, focusKeyword, slug]);

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            <span>SEO Analysis</span>
          </div>
          <Badge variant={getScoreBadgeVariant(score)}>
            {score}/100
          </Badge>
        </CardTitle>
        <CardDescription>
          Optimize your content for search engines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={score} className="h-2" />
        
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <Alert key={index} className={
              issue.type === 'critical' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
              issue.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
              issue.type === 'suggestion' ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20' :
              'border-green-200 bg-green-50 dark:bg-green-900/20'
            }>
              <div className="flex items-start gap-3">
                {getIssueIcon(issue.type)}
                <AlertDescription>
                  <strong>{issue.message}</strong>
                  {issue.suggestion && (
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {issue.suggestion}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
