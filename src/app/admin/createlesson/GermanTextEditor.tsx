"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontSize } from '@tiptap/extension-text-style/font-size';
import { useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';



interface GermanTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  onContentChange?: (html: string, text: string) => void;
}

export default function GermanTextEditor({ 
  value, 
  onChange, 
  placeholder = "Write your German story here...",
  className = "",
  error = false,
}: GermanTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState('16px');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Font size options
  const fontSizes = [
    { label: 'Small', value: '12px' },
    { label: 'Normal', value: '16px' },
    { label: 'Medium', value: '18px' },
    { label: 'Large', value: '20px' },
    { label: 'X-Large', value: '24px' },
    { label: 'XX-Large', value: '28px' }
  ];
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    immediatelyRender: false, // Fix SSR hydration issues
    onUpdate: ({ editor }) => {
      let html = editor.getHTML();
      // Fix missing spaces before attributes
      html = html
        .replace(/(<span)style=/g, '$1 style=')
        .replace(/(<div)style=/g, '$1 style=')
        .replace(/(<p)style=/g, '$1 style=')
        .replace(/(<h[1-6])style=/g, '$1 style=')
        .replace(/(<\w+)class=/g, '$1 class=')
        .replace(/(<\w+)id=/g, '$1 id=');
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Update font size selector based on current selection
  useEffect(() => {
    if (editor) {
      const updateFontSize = () => {
        const fontSize = editor.getAttributes('textStyle').fontSize;
        if (fontSize) {
          setCurrentFontSize(fontSize);
        } else {
          setCurrentFontSize('16px'); // Default size
        }
      };

      editor.on('selectionUpdate', updateFontSize);
      editor.on('transaction', updateFontSize);

      return () => {
        editor.off('selectionUpdate', updateFontSize);
        editor.off('transaction', updateFontSize);
      };
    }
  }, [editor]);

  // Show loading state during SSR and before editor is ready
  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-300 rounded-md p-4 min-h-[300px] bg-gray-50 animate-pulse">
        <div className="text-gray-400 text-center">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={`german-text-editor border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
        
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'bg-gray-200' : ''}
        >
          <Highlighter className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Font Size Selector */}
        <div className="flex items-center gap-1">
          <Type className="h-4 w-4 text-gray-600" />
          <select
            value={currentFontSize}
            onChange={(e) => {
              const fontSize = e.target.value;
              setCurrentFontSize(fontSize);
              editor.chain().focus().setFontSize(fontSize).run();
            }}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary min-w-[70px]"
          >
            {fontSizes.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Color Picker */}
        <input
          type="color"
          className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          title="Text Color"
        />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>

      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="german-text-content"
      />

      {/* Custom Styles */}
      <style jsx global>{`
        .german-text-content .ProseMirror {
          font-family: 'Times New Roman', serif;
          font-size: 16px;
          line-height: 1.7;
          color: #374151;
          outline: none;
          min-height: 300px;
          padding: 16px;
        }

        .german-text-content .ProseMirror p {
          margin: 1em 0;
        }

        .german-text-content .ProseMirror h1 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1.2em 0 0.8em 0;
        }

        .german-text-content .ProseMirror h2 {
          font-size: 1.3em;
          font-weight: bold;
          margin: 1em 0 0.6em 0;
        }

        .german-text-content .ProseMirror ul, 
        .german-text-content .ProseMirror ol {
          padding-left: 2em;
        }

        .german-text-content .ProseMirror li {
          margin: 0.5em 0;
        }

        .german-text-content .ProseMirror blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1em;
          margin: 1.5em 0;
          font-style: italic;
          color: #6b7280;
        }

        .german-text-content .ProseMirror strong {
          font-weight: 600;
        }

        .german-text-content .ProseMirror em {
          font-style: italic;
        }

        .german-text-content .ProseMirror mark {
          background-color: #fef3c7;
          padding: 0.1em 0.2em;
          border-radius: 0.2em;
        }

        .german-text-content .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}