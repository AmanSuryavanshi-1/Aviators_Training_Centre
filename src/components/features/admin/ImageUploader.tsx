'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  X, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { SanityImageBrowser } from './SanityImageBrowser';

interface ImageUploaderProps {
  onImageSelect: (imageData: { file?: File; url?: string; alt: string }) => void;
  selectedImage?: { file?: File; url?: string; alt: string };
  availableImages?: string[];
}

export function ImageUploader({ 
  onImageSelect, 
  selectedImage, 
  availableImages = [] 
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default available images
  const defaultImages = [
    '/Blogs/Blog2.webp',
    '/Blogs/Blog3.webp', 
    '/Blogs/Blog4.webp',
    '/Blogs/Blog5.webp',
    '/Blogs/Blog6.webp',
    '/Blogs/Blog7.webp',
    '/Blogs/Blog8.webp',
    '/Blogs/Blog_Header.webp',
    '/Blogs/Blog_Preperation.webp',
    '/Blogs/Blog_money.webp',
    '/Blogs/Blog_money2.webp',
    '/Blogs/Instructor.webp'
  ];

  const imagesToShow = availableImages.length > 0 ? availableImages : defaultImages;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload to Sanity via API
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const result = await response.json();
      
      // Call the parent component with the uploaded image data
      onImageSelect({
        file: file,
        url: result.assetId, // Sanity asset ID
        alt: file.name.replace(/\.[^/.]+$/, '') // Remove file extension for alt text
      });

      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePresetImageSelect = (imageUrl: string) => {
    onImageSelect({
      url: imageUrl,
      alt: `Featured image from ${imageUrl.split('/').pop()?.replace('.webp', '') || 'gallery'}`
    });
  };

  const clearSelection = () => {
    onImageSelect({ alt: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-aviation-primary transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-aviation-primary/10 rounded-full">
                <Upload className="w-8 h-8 text-aviation-primary" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Upload Custom Image
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Upload your own image (JPG, PNG, WebP - Max 5MB)
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="border-aviation-primary text-aviation-primary hover:bg-aviation-primary hover:text-white"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </>
                  )}
                </Button>

                {uploadError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {uploadError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sanity Image Browser */}
      <SanityImageBrowser
        onImageSelect={(imageData) => {
          onImageSelect({
            url: imageData.assetId, // Use Sanity asset ID
            alt: imageData.alt
          });
        }}
        selectedImageId={selectedImage?.url}
      />

      {/* Preset Images Section (Fallback) */}
      <div>
        <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-aviation-primary" />
          Local Gallery (Legacy)
        </Label>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imagesToShow.map((image, index) => (
            <div
              key={index}
              className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedImage?.url === image 
                  ? 'border-aviation-primary shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePresetImageSelect(image)}
            >
              <img
                src={image}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  // Hide broken images
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {selectedImage?.url === image && (
                <div className="absolute inset-0 bg-aviation-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-aviation-primary bg-white rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Note: These local images will be automatically uploaded to Sanity when used in blog posts.
        </p>
      </div>

      {/* Selected Image Preview */}
      {selectedImage && (selectedImage.file || selectedImage.url) && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-green-800 mb-1">Selected Image</h4>
                  {selectedImage.file ? (
                    <p className="text-sm text-green-700">
                      Custom upload: {selectedImage.file.name}
                    </p>
                  ) : (
                    <p className="text-sm text-green-700">
                      Gallery image: {selectedImage.url?.split('/').pop()}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-green-600 hover:text-green-800 hover:bg-green-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Image Preview */}
            <div className="mt-3">
              {selectedImage.file ? (
                <img
                  src={URL.createObjectURL(selectedImage.file)}
                  alt="Preview"
                  className="w-full max-w-md h-32 object-cover rounded-lg"
                />
              ) : selectedImage.url ? (
                <img
                  src={selectedImage.url}
                  alt="Preview"
                  className="w-full max-w-md h-32 object-cover rounded-lg"
                />
              ) : null}
            </div>

            {/* Alt Text Input */}
            <div className="mt-3">
              <Label htmlFor="imageAlt" className="text-sm font-medium text-green-800">
                Alt Text (for accessibility)
              </Label>
              <Input
                id="imageAlt"
                value={selectedImage.alt || ''}
                onChange={(e) => onImageSelect({
                  ...selectedImage,
                  alt: e.target.value
                })}
                placeholder="Describe the image for screen readers..."
                className="mt-1 border-green-300 focus:border-green-500"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
