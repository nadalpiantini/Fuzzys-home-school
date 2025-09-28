import React, { useEffect, useRef, useState } from 'react';
import { H5PContent } from '../types';

// Declare global H5P types
declare global {
  interface Window {
    H5PEditor?: any;
    H5P?: any;
  }
}

interface H5PEditorProps {
  contentId?: string;
  library?: string;
  onSave: (content: H5PContent) => Promise<void>;
  onCancel?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const H5PEditor: React.FC<H5PEditorProps> = ({
  contentId,
  library,
  onSave,
  onCancel,
  className = '',
  style
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const loadEditor = async () => {
      try {
        // Initialize H5P Editor if not already loaded
        if (typeof window !== 'undefined' && !window.H5PEditor) {
          await loadH5PEditor();
        }

        const editorConfig = {
          baseUrl: '/h5p',
          url: '/h5p/ajax',
          postUserStatistics: false,
          ajax: {
            setFinished: '/h5p/ajax/set-finished',
            contentUserData: '/h5p/ajax/content-user-data'
          },
          saveFreq: 30, // Auto-save every 30 seconds
          l10n: {
            H5P: {
              save: 'Guardar',
              cancel: 'Cancelar',
              close: 'Cerrar',
              title: 'Título',
              author: 'Autor',
              source: 'Fuente',
              license: 'Licencia',
              licenseU: 'Sin especificar',
              licenseCC: 'Creative Commons',
              licenseCC0: 'Dominio Público',
              licenseGPL: 'General Public License v3',
              licenseV1: 'Versión 1',
              licenseV2: 'Versión 2',
              licenseV3: 'Versión 3',
              licenseV4: 'Versión 4',
              changeLicense: 'Cambiar Licencia',
              contentTypePlaceholder: 'Buscar tipos de contenido'
            }
          }
        };

        // Create editor instance
        const editor = new window.H5PEditor.Editor(
          library || 'H5P.InteractiveVideo',
          JSON.stringify({}),
          editorRef.current
        );

        // Setup editor events
        editor.on('save', async (content: any) => {
          setIsSaving(true);
          try {
            const h5pContent: H5PContent = {
              id: contentId || `h5p-${Date.now()}`,
              type: library as any || 'interactive_video',
              title: content.metadata?.title || 'Nueva actividad H5P',
              description: content.metadata?.description,
              metadata: content.metadata,
              params: content.params,
              library: content.library || library || 'H5P.InteractiveVideo',
              language: 'es'
            };

            await onSave(h5pContent);
            setIsSaving(false);
          } catch (err) {
            console.error('Failed to save H5P content:', err);
            setError('Error al guardar el contenido');
            setIsSaving(false);
          }
        });

        setEditorInstance(editor);
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load H5P editor:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el editor');
      }
    };

    loadEditor();

    return () => {
      // Cleanup editor instance
      if (editorInstance && editorInstance.$ && editorInstance.$.fn) {
        editorInstance.$.fn.remove?.();
      }
    };
  }, [contentId, library]);

  const loadH5PEditor = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.H5PEditor) {
        resolve();
        return;
      }

      // Load H5P Editor CSS
      const cssFiles = [
        '/h5p/core/styles/h5p.css',
        '/h5p/editor/styles/css/h5p-editor.css'
      ];

      cssFiles.forEach(cssFile => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssFile;
        document.head.appendChild(link);
      });

      // Load H5P Editor JavaScript files
      const scriptFiles = [
        '/h5p/core/js/jquery.js',
        '/h5p/core/js/h5p.js',
        '/h5p/editor/scripts/h5peditor.js',
        '/h5p/editor/scripts/h5peditor-semantic-structure.js',
        '/h5p/editor/scripts/h5peditor-library-selector.js',
        '/h5p/editor/scripts/h5peditor-form.js',
        '/h5p/editor/scripts/h5peditor-text.js',
        '/h5p/editor/scripts/h5peditor-html.js',
        '/h5p/editor/scripts/h5peditor-number.js',
        '/h5p/editor/scripts/h5peditor-textarea.js',
        '/h5p/editor/scripts/h5peditor-file-uploader.js',
        '/h5p/editor/scripts/h5peditor-file.js',
        '/h5p/editor/scripts/h5peditor-image.js',
        '/h5p/editor/scripts/h5peditor-image-popup.js',
        '/h5p/editor/scripts/h5peditor-av.js',
        '/h5p/editor/scripts/h5peditor-group.js',
        '/h5p/editor/scripts/h5peditor-boolean.js',
        '/h5p/editor/scripts/h5peditor-list.js',
        '/h5p/editor/scripts/h5peditor-list-editor.js',
        '/h5p/editor/scripts/h5peditor-library.js',
        '/h5p/editor/scripts/h5peditor-library-list-cache.js',
        '/h5p/editor/scripts/h5peditor-select.js'
      ];

      let loadedScripts = 0;
      const totalScripts = scriptFiles.length;

      scriptFiles.forEach(scriptFile => {
        const script = document.createElement('script');
        script.src = scriptFile;
        script.onload = () => {
          loadedScripts++;
          if (loadedScripts === totalScripts) {
            resolve();
          }
        };
        script.onerror = () => reject(new Error(`Failed to load ${scriptFile}`));
        document.head.appendChild(script);
      });
    });
  };

  const handleSave = () => {
    if (editorInstance && editorInstance.save) {
      editorInstance.save();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (error) {
    return (
      <div className={`h5p-editor-error ${className}`} style={style}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error del Editor</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Recargar Página
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`h5p-editor-loading ${className}`} style={style}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando editor H5P...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`h5p-editor ${className}`} style={style}>
      {/* Editor Header */}
      <div className="h5p-editor-header bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Editor de Contenido H5P
          </h2>
          <p className="text-sm text-gray-600">
            {library ? `Tipo: ${library}` : 'Selecciona un tipo de contenido'}
          </p>
        </div>

        <div className="flex space-x-2">
          {onCancel && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div
        ref={editorRef}
        className="h5p-editor-container min-h-96 p-4"
        data-library={library}
      />

      {/* Editor Footer */}
      <div className="h5p-editor-footer bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            H5P Editor - Fuzzy's Home School
          </div>
          <div>
            Auto-guardado cada 30 segundos
          </div>
        </div>
      </div>
    </div>
  );
};

export default H5PEditor;