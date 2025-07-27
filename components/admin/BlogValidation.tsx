'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Target,
  FileText,
  Hash,
  Search
} from 'lucide-react';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  tags: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
}

interface ValidationRule {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'fail' | 'info';
  message: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface BlogValidationProps {
  formData: BlogFormData;
  isVisible: boolean;
}

export function BlogValidation({ formData, isVisible }: BlogValidationProps) {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    const rules: ValidationRule[] = [];

    // Title validation
    if (!formData.title.trim()) {
      rules.push({
        id: 'title-required',
        label: 'Title Required',
        status: 'fail',
        message: 'Title is required',
        icon: XCircle
      });
    } else if (formData.title.length < 10) {
      rules.push({
        id: 'title-length',
        label: 'Title Length',
        status: 'warning',
        message: 'Title should be at least 10 characters for better SEO',
        icon: AlertCircle
      });
    } else if (formData.title.length > 60) {
      rules.push({
        id: 'title-length',
        label: 'Title Length',
        status: 'warning',
        message: 'Title is too long for SEO (over 60 characters)',
        icon: AlertCircle
      });
    } else {
      rules.push({
        id: 'title-length',
        label: 'Title Length',
        status: 'pass',
        message: 'Title length is optimal',
        icon: CheckCircle2
      });
    }

    // Content validation
    if (!formData.content.trim()) {
      rules.push({
        id: 'content-required',
        label: 'Content Required',
        status: 'fail',
        message: 'Content is required',
        icon: XCircle
      });
    } else {
      const wordCount = formData.content.split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount < 300) {
        rules.push({
          id: 'content-length',
          label: 'Content Length',
          status: 'warning',
          message: `Content is short (${wordCount} words). Consider adding more detail.`,
          icon: AlertCircle
        });
      } else if (wordCount > 2000) {
        rules.push({
          id: 'content-length',
          label: 'Content Length',
          status: 'info',
          message: `Long content (${wordCount} words). Consider breaking into sections.`,
          icon: Info
        });
      } else {
        rules.push({
          id: 'content-length',
          label: 'Content Length',
          status: 'pass',
          message: `Good content length (${wordCount} words)`,
          icon: CheckCircle2
        });
      }
    }

    // Excerpt validation
    if (!formData.excerpt.trim()) {
      rules.push({
        id: 'excerpt-required',
        label: 'Excerpt Required',
        status: 'fail',
        message: 'Excerpt is required',
        icon: XCircle
      });
    } else if (formData.excerpt.length < 50) {
      rules.push({
        id: 'excerpt-length',
        label: 'Excerpt Length',
        status: 'warning',
        message: 'Excerpt should be at least 50 characters',
        icon: AlertCircle
      });
    } else if (formData.excerpt.length > 300) {
      rules.push({
        id: 'excerpt-length',
        label: 'Excerpt Length',
        status: 'fail',
        message: 'Excerpt is too long (over 300 characters)',
        icon: XCircle
      });
    } else {
      rules.push({
        id: 'excerpt-length',
        label: 'Excerpt Length',
        status: 'pass',
        message: 'Excerpt length is good',
        icon: CheckCircle2
      });
    }

    // Category validation
    if (!formData.category.trim()) {
      rules.push({
        id: 'category-required',
        label: 'Category Required',
        status: 'warning',
        message: 'Category helps with organization and SEO',
        icon: AlertCircle
      });
    } else {
      rules.push({
        id: 'category-set',
        label: 'Category Set',
        status: 'pass',
        message: 'Category is set',
        icon: CheckCircle2
      });
    }

    // Tags validation
    if (!formData.tags || formData.tags.length === 0) {
      rules.push({
        id: 'tags-missing',
        label: 'Tags Missing',
        status: 'warning',
        message: 'Tags help with discoverability',
        icon: AlertCircle
      });
    } else if (formData.tags.length > 10) {
      rules.push({
        id: 'tags-too-many',
        label: 'Too Many Tags',
        status: 'warning',
        message: 'Too many tags can dilute SEO effectiveness',
        icon: AlertCircle
      });
    } else {
      rules.push({
        id: 'tags-good',
        label: 'Tags Set',
        status: 'pass',
        message: `${formData.tags.length} tags added`,
        icon: CheckCircle2
      });
    }

    // SEO Title validation
    if (formData.seoTitle && formData.seoTitle.length > 60) {
      rules.push({
        id: 'seo-title-length',
        label: 'SEO Title Length',
        status: 'warning',
        message: 'SEO title should be under 60 characters',
        icon: AlertCircle
      });
    } else if (formData.seoTitle) {
      rules.push({
        id: 'seo-title-good',
        label: 'SEO Title',
        status: 'pass',
        message: 'SEO title is optimized',
        icon: CheckCircle2
      });
    } else {
      rules.push({
        id: 'seo-title-missing',
        label: 'SEO Title',
        status: 'info',
        message: 'SEO title will be auto-generated',
        icon: Info
      });
    }

    // SEO Description validation
    if (formData.seoDescription && formData.seoDescription.length > 160) {
      rules.push({
        id: 'seo-desc-length',
        label: 'SEO Description Length',
        status: 'warning',
        message: 'SEO description should be under 160 characters',
        icon: AlertCircle
      });
    } else if (formData.seoDescription) {
      rules.push({
        id: 'seo-desc-good',
        label: 'SEO Description',
        status: 'pass',
        message: 'SEO description is optimized',
        icon: CheckCircle2
      });
    } else {
      rules.push({
        id: 'seo-desc-missing',
        label: 'SEO Description',
        status: 'info',
        message: 'SEO description will be auto-generated',
        icon: Info
      });
    }

    // Focus keyword validation
    if (formData.focusKeyword) {
      const keywordInTitle = formData.title.toLowerCase().includes(formData.focusKeyword.toLowerCase());
      const keywordInContent = formData.content.toLowerCase().includes(formData.focusKeyword.toLowerCase());
      
      if (keywordInTitle && keywordInContent) {
        rules.push({
          id: 'focus-keyword-good',
          label: 'Focus Keyword',
          status: 'pass',
          message: 'Focus keyword appears in title and content',
          icon: CheckCircle2
        });
      } else if (keywordInTitle || keywordInContent) {
        rules.push({
          id: 'focus-keyword-partial',
          label: 'Focus Keyword',
          status: 'warning',
          message: 'Focus keyword should appear in both title and content',
          icon: AlertCircle
        });
      } else {
        rules.push({
          id: 'focus-keyword-missing',
          label: 'Focus Keyword',
          status: 'warning',
          message: 'Focus keyword not found in title or content',
          icon: AlertCircle
        });
      }
    } else {
      rules.push({
        id: 'focus-keyword-not-set',
        label: 'Focus Keyword',
        status: 'info',
        message: 'Consider setting a focus keyword for SEO',
        icon: Info
      });
    }

    setValidationRules(rules);

    // Calculate overall score
    const passCount = rules.filter(rule => rule.status === 'pass').length;
    const totalCount = rules.length;
    const score = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
    setOverallScore(score);
  }, [formData]);

  if (!isVisible) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'fail': return 'text-red-600 dark:text-red-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Content Validation</span>
          <Badge variant="outline" className={getScoreColor(overallScore)}>
            {overallScore}% Complete
          </Badge>
        </CardTitle>
        <Progress value={overallScore} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {validationRules.map((rule) => {
          const IconComponent = rule.icon;
          return (
            <div key={rule.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <IconComponent className={`h-4 w-4 mt-0.5 flex-shrink-0 ${getStatusColor(rule.status)}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{rule.label}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {rule.message}
                </div>
              </div>
            </div>
          );
        })}

        {overallScore < 60 && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Consider addressing the validation issues above to improve your post quality and SEO performance.
            </AlertDescription>
          </Alert>
        )}

        {overallScore >= 80 && (
          <Alert className="mt-4 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Great! Your post meets most quality standards and is ready to publish.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}