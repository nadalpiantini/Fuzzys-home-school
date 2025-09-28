import { useState, useEffect } from 'react';
import { H5PLibrary } from '../types';

export const useH5PLibraries = () => {
  const [libraries, setLibraries] = useState<H5PLibrary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLibraries = async () => {
      try {
        setIsLoading(true);
        // This is a placeholder - in a real implementation, you would fetch from an API
        const mockLibraries: H5PLibrary[] = [
          {
            id: 'interactive-video',
            title: 'Interactive Video',
            description: 'Create interactive videos with questions and hotspots',
            type: 'InteractiveVideo',
            difficulty: 'intermediate',
            subject: 'multimedia',
            estimatedTime: 30,
            rating: 4.5,
            completions: 150,
            tags: ['video', 'interactive', 'multimedia']
          }
        ];
        setLibraries(mockLibraries);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load libraries');
      } finally {
        setIsLoading(false);
      }
    };

    loadLibraries();
  }, []);

  const searchLibraries = (query: string): H5PLibrary[] => {
    if (!query.trim()) {
      return libraries;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return libraries.filter(library => 
      library.title.toLowerCase().includes(lowercaseQuery) ||
      library.description.toLowerCase().includes(lowercaseQuery) ||
      library.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      library.subject.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getPopularLibraries = (): H5PLibrary[] => {
    return libraries
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 6); // Return top 6 popular libraries
  };

  // Get unique categories from libraries
  const categories = Array.from(new Set(libraries.map(lib => lib.subject)));

  return { libraries, isLoading, error, searchLibraries, categories, getPopularLibraries };
};

export default useH5PLibraries;