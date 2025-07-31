'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Image as ImageIcon, 
  CheckCircle2, 
  Loader2,
  RefreshCw,
  AlertCircle,
  Calendar,
  FileImage
} from 'lucide-react';
import { toast } from 'sonner';

interface SanityImage {
  _id: string;
  url: string;
  originalFilename?: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: string;
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

interface SanityImageBrowserProps {
  onImageSelect: (imageData: { url: string; alt: string; assetId: string }) => void;
  selectedImageId?: string;
}

export function SanityImageBrowser({ onImageSelect, selectedImageId }: SanityImageBrowserProps) {
  const [images, setImages] = useState<SanityImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<SanityImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sanity/images');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load images');
      }

      const data = await response.json();
      setImages(data.images || []);
      setFilteredImages(data.images || []);
    } catch (err) {
      console.error('Error loading Sanity images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
      toast.error('Failed to load images from Sanity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredImages(images);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = images.filter(image => 
        image.originalFilename?.toLowerCase().includes(query) ||
        image._id.toLowerCase().includes(query)
      );
      setFilteredImages(filtered);
    }
  }, [searchQuery, images]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-aviation-primary" />
            <span className="ml-3 text-gray-600">Loading images from Sanity...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Images</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadImages} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="w-5 h-5 text-aviation-primary" />
          Sanity Image Library
          <Badge variant="secondary" className="ml-2">
            {images.length} images
          </Badge>
        </CardTitle>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search images by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {filteredImages.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchQuery ? 'No images match your search' : 'No images found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Try a different search term or clear the search to see all images'
                : 'Upload some images to Sanity to see them here'
              }
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className="border-aviation-primary text-aviation-primary hover:bg-aviation-primary hover:text-white"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image._id}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  selectedImageId === image._id
                    ? 'border-aviation-primary shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onImageSelect({
                  url: image._id, // Use asset ID as reference
                  alt: image.originalFilename?.replace(/\.[^/.]+$/, '') || 'Sanity image',
                  assetId: image._id
                })}
              >
                {/* Image */}
                <div className="aspect-video bg-gray-100">
                  <img
                    src={`${image.url}?w=300&h=200&fit=crop`}
                    alt={image.originalFilename || 'Sanity image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>

                {/* Selection indicator */}
                {selectedImageId === image._id && (
                  <div className="absolute inset-0 bg-aviation-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-aviation-primary bg-white rounded-full" />
                  </div>
                )}

                {/* Image info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="text-white">
                    <p className="text-sm font-medium truncate">
                      {image.originalFilename || 'Untitled'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-white/80 mt-1">
                      <span>{formatFileSize(image.size)}</span>
                      {image.metadata?.dimensions && (
                        <span>
                          {image.metadata.dimensions.width} × {image.metadata.dimensions.height}
                        </span>
                      )}
                    </div>
                    {image.uploadedAt && (
                      <div className="flex items-center text-xs text-white/70 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(image.uploadedAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh button */}
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={loadImages}
            disabled={loading}
            className="border-aviation-primary text-aviation-primary hover:bg-aviation-primary hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Images
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
