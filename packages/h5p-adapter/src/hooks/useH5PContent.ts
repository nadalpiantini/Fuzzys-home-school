import { useState, useEffect } from 'react';
import { H5PContent } from '../types';

export const useH5PContent = (contentId: string) => {
  const [content, setContent] = useState<H5PContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        // This is a placeholder - in a real implementation, you would fetch from an API
        const mockContent: H5PContent = {
          id: contentId,
          title: 'Mock H5P Content',
          library: 'H5P.InteractiveVideo',
          type: 'interactive-video',
          params: {},
          metadata: {}
        };
        setContent(mockContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      loadContent();
    }
  }, [contentId]);

  return { content, loading, error };
};

export default useH5PContent;