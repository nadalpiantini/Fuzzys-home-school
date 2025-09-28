import React, { useEffect, useRef, useState } from 'react';
import { H5PContent, H5PEvent, H5PComponentProps } from '../types';

// Declare global H5P and jQuery types
declare global {
  interface Window {
    H5PEditor?: any;
    H5P?: any;
  }
  const $: any;
}

interface H5PPlayerProps extends H5PComponentProps {
  onProgress?: (progress: number) => void;
  onCompleted?: (score: number, maxScore: number) => void;
  onInteraction?: (data: any) => void;
  enableFullscreen?: boolean;
  showCopyright?: boolean;
  showEmbedButton?: boolean;
}

export const H5PPlayer: React.FC<H5PPlayerProps> = ({
  content,
  onEvent,
  onProgress,
  onCompleted,
  onInteraction,
  className = '',
  style,
  enableFullscreen = true,
  showCopyright = false,
  showEmbedButton = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [h5pInstance, setH5PInstance] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadH5P = async () => {
      try {
        // Initialize H5P if not already loaded
        if (typeof window !== 'undefined' && !window.H5P) {
          await loadH5PCore();
        }

        const h5pData = {
          library: content.library,
          params: content.params,
          metadata: {
            title: content.title,
            license: 'U',
            licenseVersion: '4.0',
            yearFrom: new Date().getFullYear(),
            yearTo: new Date().getFullYear(),
            source: window.location.origin,
            ...content.metadata
          }
        };

        // Create H5P instance
        const instance = new window.H5P.ContentType(
          h5pData.library,
          h5pData.params,
          content.id
        );

        // Setup event listeners
        instance.on('completed', (event: any) => {
          const score = event.data.score || 0;
          const maxScore = event.data.maxScore || 0;
          onCompleted?.(score, maxScore);
          onEvent?.({
            type: 'completed',
            data: { score, maxScore, completion: 1 }
          });
        });

        instance.on('progress', (event: any) => {
          const progress = event.data.completion || 0;
          onProgress?.(progress);
          onEvent?.({
            type: 'progress',
            data: { completion: progress }
          });
        });

        instance.on('xAPI', (event: any) => {
          onInteraction?.(event.data);
          onEvent?.({
            type: 'interaction',
            data: event.data
          });
        });

        // Attach to DOM
        instance.attach($(containerRef.current));

        setH5PInstance(instance);
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load H5P content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      }
    };

    loadH5P();

    return () => {
      // Cleanup H5P instance
      if (h5pInstance && h5pInstance.$ && h5pInstance.$.fn) {
        h5pInstance.$.fn.remove?.();
      }
    };
  }, [content]);

  const loadH5PCore = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.H5P) {
        resolve();
        return;
      }

      // Load H5P core CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = '/h5p/core/styles/h5p.css';
      document.head.appendChild(cssLink);

      // Load H5P core JavaScript
      const script = document.createElement('script');
      script.src = '/h5p/core/js/h5p.js';
      script.onload = () => {
        // Load H5P content types
        const contentScript = document.createElement('script');
        contentScript.src = `/h5p/libraries/${content.library}/library.js`;
        contentScript.onload = () => resolve();
        contentScript.onerror = () => reject(new Error('Failed to load H5P library'));
        document.head.appendChild(contentScript);
      };
      script.onerror = () => reject(new Error('Failed to load H5P core'));
      document.head.appendChild(script);
    });
  };

  const handleFullscreen = () => {
    if (containerRef.current && enableFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleRestart = () => {
    if (h5pInstance && h5pInstance.resetTask) {
      h5pInstance.resetTask();
    }
  };

  if (error) {
    return (
      <div className={`h5p-error ${className}`} style={style}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading content</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`h5p-loading ${className}`} style={style}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading interactive content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`h5p-player ${className}`} style={style}>
      {/* H5P Controls */}
      <div className="h5p-controls mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRestart}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Restart
          </button>
          {enableFullscreen && (
            <button
              onClick={handleFullscreen}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Fullscreen
            </button>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {content.title}
        </div>
      </div>

      {/* H5P Content Container */}
      <div
        ref={containerRef}
        className="h5p-container border border-gray-200 rounded-lg overflow-hidden"
        data-content-id={content.id}
      />

      {/* H5P Footer */}
      {(showCopyright || showEmbedButton) && (
        <div className="h5p-footer mt-2 flex items-center justify-between text-xs text-gray-500">
          {showCopyright && (
            <div>
              Powered by H5P
            </div>
          )}
          {showEmbedButton && (
            <button className="text-blue-600 hover:text-blue-800">
              Embed
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default H5PPlayer;