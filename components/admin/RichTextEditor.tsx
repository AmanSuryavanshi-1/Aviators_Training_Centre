"use client";

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Type,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

interface ToolbarConfig {
  showHeadings?: boolean;
  showFormatting?: boolean;
  showLists?: boolean;
  showAlignment?: boolean;
  showLinks?: boolean;
  showImages?: boolean;
  showCode?: boolean;
  showUndoRedo?: boolean;
}

const defaultToolbarConfig: ToolbarConfig = {
  showHeadings: true,
  showFormatting: true,
  showLists: true,
  showAlignment: true,
  showLinks: true,
  showImages: true,
  showCode: true,
  showUndoRedo: true,
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing...",
  className = "",
  readOnly = false,
  onImageUpload,
}) => {
  const [linkUrl, setLinkUrl] = React.useState('');
  const [linkText, setLinkText] = React.useState('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState('');
  const [imageAlt, setImageAlt] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        strike: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Strike,
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-muted p-4 rounded-lg font-mono text-sm',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-primary pl-4 italic',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc list-inside',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal list-inside',
        },
      }),
      ListItem,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 ${className}`,
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addLink = () => {
    if (linkUrl && editor) {
      if (linkText) {
        editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run();
      } else {
        editor.chain().focus().setLink({ href: linkUrl }).run();
      }
      setLinkUrl('');
      setLinkText('');
      setIsLinkDialogOpen(false);
    }
  };

  const addImage = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
      setImageUrl('');
      setImageAlt('');
      setIsImageDialogOpen(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      setIsUploading(true);
      try {
        const url = await onImageUpload(file);
        setImageUrl(url);
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!editor) {
    return (
      <div className="border rounded-lg p-4 min-h-[200px] bg-muted animate-pulse">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      {!readOnly && (
        <div className="border-b bg-muted/50 p-2">
          <div className="flex flex-wrap items-center gap-1">
            {/* Undo/Redo */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Headings */}
            <Button
              variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('paragraph') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setParagraph().run()}
              title="Paragraph"
            >
              <Type className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Text Formatting */}
            <Button
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('underline') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('strike') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Lists */}
            <Button
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Alignment */}
            <Button
              variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Special Elements */}
            <Button
              variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Link Dialog */}
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant={editor.isActive('link') ? 'default' : 'ghost'}
                  size="sm"
                  title="Add Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Link</DialogTitle>
                  <DialogDescription>
                    Enter the URL and optional link text.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="link-url">URL</Label>
                    <Input
                      id="link-url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="link-text">Link Text (optional)</Label>
                    <Input
                      id="link-text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Click here"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addLink} disabled={!linkUrl}>
                    Add Link
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Image Dialog */}
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" title="Add Image">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Image</DialogTitle>
                  <DialogDescription>
                    Upload an image or enter an image URL.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {onImageUpload && (
                    <div>
                      <Label htmlFor="image-upload">Upload Image</Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                    </div>
                  )}
                  <div>
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image-alt">Alt Text</Label>
                    <Input
                      id="image-alt"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Describe the image"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addImage} disabled={!imageUrl}>
                    Add Image
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="min-h-[200px]">
        <EditorContent 
          editor={editor} 
          className={readOnly ? 'cursor-default' : 'cursor-text'}
        />
        {!readOnly && editor.isEmpty && (
          <div className="absolute top-16 left-4 text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;