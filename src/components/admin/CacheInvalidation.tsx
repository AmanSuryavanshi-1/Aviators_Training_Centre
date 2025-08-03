'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Zap, Globe, FileText } from 'lucide-react';

export default function CacheInvalidation() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastInvalidation, setLastInvalidation] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const invalidateCache = async (type: 'all' | 'blog' | 'homepage') => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/cache/invalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CACHE_TOKEN || 'dev-token'}`
        },
        body: JSON.stringify({ 
          type: type === 'homepage' ? 'path' : type,
          path: type === 'homepage' ? '/' : undefined,
          token: 'dev-token' // Fallback token
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        setLastInvalidation(new Date().toLocaleString());
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Cache Management
        </CardTitle>
        <p className="text-sm text-gray-600">
          Clear website cache to see your Sanity Studio changes immediately
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.startsWith('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={() => invalidateCache('all')}
            disabled={isLoading}
            className="flex items-center gap-2 h-auto py-3 px-4"
            variant="default"
          >
            <Zap className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium">Clear All Cache</div>
              <div className="text-xs opacity-80">Entire website</div>
            </div>
          </Button>

          <Button
            onClick={() => invalidateCache('blog')}
            disabled={isLoading}
            className="flex items-center gap-2 h-auto py-3 px-4"
            variant="outline"
          >
            <FileText className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium">Clear Blog Cache</div>
              <div className="text-xs opacity-80">Blog posts only</div>
            </div>
          </Button>

          <Button
            onClick={() => invalidateCache('homepage')}
            disabled={isLoading}
            className="flex items-center gap-2 h-auto py-3 px-4"
            variant="outline"
          >
            <Globe className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium">Clear Homepage</div>
              <div className="text-xs opacity-80">Homepage only</div>
            </div>
          </Button>
        </div>

        {lastInvalidation && (
          <div className="text-sm text-gray-500 pt-2 border-t">
            Last cleared: {lastInvalidation}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <h4 className="font-medium text-blue-900 mb-1">💡 Quick Tip</h4>
          <p className="text-sm text-blue-800">
            After making changes in Sanity Studio, click "Clear All Cache" to see your changes on the live website immediately.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <h4 className="font-medium text-gray-900 mb-2">🔄 How it works</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Your website uses caching for better performance</li>
            <li>• Changes in Sanity Studio may take time to appear</li>
            <li>• Use these buttons to force immediate updates</li>
            <li>• The cache will rebuild automatically with fresh content</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}