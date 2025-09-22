"use client";
import React, { useState, useRef, useEffect } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Link,
  Unlink,
  Quote,
  Code,
  Undo,
  Redo,
  Type,
  Heading1,
  Heading2,
  Heading3
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  title: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, onClick, isActive, title }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-md transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
      isActive 
        ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' 
        : 'text-gray-600 dark:text-gray-400'
    }`}
    title={title}
  >
    {icon}
  </button>
);

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Escribe aquí...",
  className = ""
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    updateContent();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      execCommand('insertLineBreak');
    }
  };

  const insertLink = () => {
    const url = prompt('Ingresa la URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const removeLink = () => {
    execCommand('unlink');
  };

  const isActive = (command: string) => {
    return document.queryCommandState(command);
  };

  const toolbarButtons = [
    {
      icon: <Undo className="w-4 h-4" />,
      onClick: () => execCommand('undo'),
      title: 'Deshacer'
    },
    {
      icon: <Redo className="w-4 h-4" />,
      onClick: () => execCommand('redo'),
      title: 'Rehacer'
    },
    { divider: true },
    {
      icon: <Bold className="w-4 h-4" />,
      onClick: () => execCommand('bold'),
      isActive: isActive('bold'),
      title: 'Negrita'
    },
    {
      icon: <Italic className="w-4 h-4" />,
      onClick: () => execCommand('italic'),
      isActive: isActive('italic'),
      title: 'Cursiva'
    },
    {
      icon: <Underline className="w-4 h-4" />,
      onClick: () => execCommand('underline'),
      isActive: isActive('underline'),
      title: 'Subrayado'
    },
    { divider: true },
    {
      icon: <Heading1 className="w-4 h-4" />,
      onClick: () => execCommand('formatBlock', '<h1>'),
      title: 'Título 1'
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      onClick: () => execCommand('formatBlock', '<h2>'),
      title: 'Título 2'
    },
    {
      icon: <Heading3 className="w-4 h-4" />,
      onClick: () => execCommand('formatBlock', '<h3>'),
      title: 'Título 3'
    },
    { divider: true },
    {
      icon: <AlignLeft className="w-4 h-4" />,
      onClick: () => execCommand('justifyLeft'),
      isActive: isActive('justifyLeft'),
      title: 'Alinear izquierda'
    },
    {
      icon: <AlignCenter className="w-4 h-4" />,
      onClick: () => execCommand('justifyCenter'),
      isActive: isActive('justifyCenter'),
      title: 'Alinear centro'
    },
    {
      icon: <AlignRight className="w-4 h-4" />,
      onClick: () => execCommand('justifyRight'),
      isActive: isActive('justifyRight'),
      title: 'Alinear derecha'
    },
    {
      icon: <AlignJustify className="w-4 h-4" />,
      onClick: () => execCommand('justifyFull'),
      isActive: isActive('justifyFull'),
      title: 'Justificar'
    },
    { divider: true },
    {
      icon: <List className="w-4 h-4" />,
      onClick: () => execCommand('insertUnorderedList'),
      title: 'Lista con viñetas'
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      onClick: () => execCommand('insertOrderedList'),
      title: 'Lista numerada'
    },
    { divider: true },
    {
      icon: <Quote className="w-4 h-4" />,
      onClick: () => execCommand('formatBlock', '<blockquote>'),
      title: 'Cita'
    },
    {
      icon: <Code className="w-4 h-4" />,
      onClick: () => execCommand('formatBlock', '<pre>'),
      title: 'Código'
    },
    { divider: true },
    {
      icon: <Link className="w-4 h-4" />,
      onClick: insertLink,
      title: 'Insertar enlace'
    },
    {
      icon: <Unlink className="w-4 h-4" />,
      onClick: removeLink,
      title: 'Quitar enlace'
    }
  ];

  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
      isFocused 
        ? 'border-brand-500 ring-2 ring-brand-500/20' 
        : 'border-gray-300 dark:border-gray-600'
    } ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {toolbarButtons.map((button, index) => (
          <React.Fragment key={index}>
            {button.divider ? (
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            ) : (
              <ToolbarButton
                icon={button.icon}
                onClick={button.onClick}
                isActive={button.isActive}
                title={button.title}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900"
        onInput={updateContent}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        style={{
          '--placeholder-color': 'rgb(156 163 175)',
          '--placeholder-color-dark': 'rgb(107 114 128)'
        } as React.CSSProperties}
      />
    </div>
  );
}

