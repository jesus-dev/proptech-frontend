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
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    onMouseDown={(e) => {
      // Prevenir que el botón quite el foco del editor
      e.preventDefault();
    }}
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
    if (!editorRef.current) return false;
    
    // Obtener la selección actual ANTES de cambiar el foco
    const selection = window.getSelection();
    let savedRange: Range | null = null;
    
    // Guardar la selección actual si existe
    if (selection && selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }
    
    // Asegurar que el editor tenga el foco
    editorRef.current.focus();
    
    // Restaurar la selección guardada o crear una nueva
    if (savedRange && selection) {
      try {
        selection.removeAllRanges();
        selection.addRange(savedRange);
      } catch (e) {
        // Si falla, crear una nueva selección al final
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else if (!selection || selection.rangeCount === 0) {
      // Si no hay selección, crear una al final
      const range = document.createRange();
      if (editorRef.current.lastChild) {
        range.setStartAfter(editorRef.current.lastChild);
        range.setEndAfter(editorRef.current.lastChild);
      } else {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
      }
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    
    try {
      // Ejecutar el comando
      const result = document.execCommand(command, false, value);
      
      // Actualizar el contenido
      updateContent();
      
      // Mantener el foco después del comando
      setTimeout(() => {
        editorRef.current?.focus();
      }, 0);
      
      return result;
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      return false;
    }
  };

  const updateContent = () => {
    if (editorRef.current) {
      // Guardar la posición del cursor antes de actualizar
      const selection = window.getSelection();
      let range = null;
      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      }
      
      onChange(editorRef.current.innerHTML);
      
      // Restaurar la posición del cursor si es posible
      if (range && editorRef.current) {
        try {
          selection?.removeAllRanges();
          selection?.addRange(range);
        } catch (e) {
          // Si falla, simplemente enfocar el editor
          editorRef.current.focus();
        }
      }
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
      onClick: () => {
        if (!editorRef.current) return;
        
        // Asegurar que el editor tenga el foco
        editorRef.current.focus();
        
        // Usar requestAnimationFrame para asegurar que el foco esté establecido
        requestAnimationFrame(() => {
          try {
            const selection = window.getSelection();
            
            // Verificar que la selección esté dentro del editor
            if (!editorRef.current) return;
            
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              
              // Verificar que el rango esté dentro del editor
              if (!editorRef.current.contains(range.commonAncestorContainer)) {
                // Si no está dentro, crear una selección al final
                const newRange = document.createRange();
                newRange.selectNodeContents(editorRef.current);
                newRange.collapse(false);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            } else {
              // Si no hay selección, crear una al final
              const range = document.createRange();
              range.selectNodeContents(editorRef.current);
              range.collapse(false);
              selection?.removeAllRanges();
              selection?.addRange(range);
            }
            
            // Intentar con execCommand
            const success = document.execCommand('insertUnorderedList', false, undefined);
            
            if (success) {
              updateContent();
              // Mantener el foco
              setTimeout(() => {
                editorRef.current?.focus();
              }, 0);
            } else {
              // Fallback: crear lista manualmente
              const sel = window.getSelection();
              if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const list = document.createElement('ul');
                const li = document.createElement('li');
                
                if (range.collapsed) {
                  // Si no hay selección, crear un elemento de lista vacío
                  li.innerHTML = '<br>';
                } else {
                  // Si hay texto seleccionado, moverlo al elemento de lista
                  const contents = range.extractContents();
                  li.appendChild(contents);
                }
                
                list.appendChild(li);
                range.insertNode(list);
                
                // Colocar el cursor dentro del elemento de lista
                const newRange = document.createRange();
                newRange.setStart(li, 0);
                newRange.setEnd(li, 0);
                sel.removeAllRanges();
                sel.addRange(newRange);
                
                updateContent();
                editorRef.current?.focus();
              }
            }
          } catch (error) {
            console.error('Error creating unordered list:', error);
          }
        });
      },
      title: 'Lista con viñetas'
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      onClick: () => {
        if (!editorRef.current) return;
        
        // Asegurar que el editor tenga el foco
        editorRef.current.focus();
        
        // Usar requestAnimationFrame para asegurar que el foco esté establecido
        requestAnimationFrame(() => {
          try {
            const selection = window.getSelection();
            
            // Verificar que la selección esté dentro del editor
            if (!editorRef.current) return;
            
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              
              // Verificar que el rango esté dentro del editor
              if (!editorRef.current.contains(range.commonAncestorContainer)) {
                // Si no está dentro, crear una selección al final
                const newRange = document.createRange();
                newRange.selectNodeContents(editorRef.current);
                newRange.collapse(false);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            } else {
              // Si no hay selección, crear una al final
              const range = document.createRange();
              range.selectNodeContents(editorRef.current);
              range.collapse(false);
              selection?.removeAllRanges();
              selection?.addRange(range);
            }
            
            // Intentar con execCommand
            const success = document.execCommand('insertOrderedList', false, undefined);
            
            if (success) {
              updateContent();
              // Mantener el foco
              setTimeout(() => {
                editorRef.current?.focus();
              }, 0);
            } else {
              // Fallback: crear lista manualmente
              const sel = window.getSelection();
              if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const list = document.createElement('ol');
                const li = document.createElement('li');
                
                if (range.collapsed) {
                  // Si no hay selección, crear un elemento de lista vacío
                  li.innerHTML = '<br>';
                } else {
                  // Si hay texto seleccionado, moverlo al elemento de lista
                  const contents = range.extractContents();
                  li.appendChild(contents);
                }
                
                list.appendChild(li);
                range.insertNode(list);
                
                // Colocar el cursor dentro del elemento de lista
                const newRange = document.createRange();
                newRange.setStart(li, 0);
                newRange.setEnd(li, 0);
                sel.removeAllRanges();
                sel.addRange(newRange);
                
                updateContent();
                editorRef.current?.focus();
              }
            }
          } catch (error) {
            console.error('Error creating ordered list:', error);
          }
        });
      },
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
                onClick={button.onClick || (() => {})}
                isActive={button.isActive}
                title={button.title || ''}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Editor Content */}
      <>
        <style dangerouslySetInnerHTML={{__html: `
          .rich-text-editor-content ul {
            list-style-type: disc !important;
            margin-left: 1.5rem !important;
            margin-top: 0.5rem !important;
            margin-bottom: 0.5rem !important;
            padding-left: 0.5rem !important;
          }
          .rich-text-editor-content ul ul {
            list-style-type: circle !important;
          }
          .rich-text-editor-content ul ul ul {
            list-style-type: square !important;
          }
          .rich-text-editor-content ol {
            list-style-type: decimal !important;
            margin-left: 1.5rem !important;
            margin-top: 0.5rem !important;
            margin-bottom: 0.5rem !important;
            padding-left: 0.5rem !important;
          }
          .rich-text-editor-content li {
            margin: 0.25rem 0 !important;
            padding-left: 0.25rem !important;
            display: list-item !important;
          }
          .rich-text-editor-content:empty:before {
            content: attr(data-placeholder);
            color: rgb(156 163 175);
            pointer-events: none;
          }
          .dark .rich-text-editor-content:empty:before {
            color: rgb(107 114 128);
          }
        `}} />
        <div
          ref={editorRef}
          contentEditable
          className="rich-text-editor-content min-h-[200px] p-4 focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-900"
          onInput={updateContent}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          data-placeholder={placeholder}
          style={{
            lineHeight: '1.6'
          } as React.CSSProperties}
        />
      </>
    </div>
  );
}

