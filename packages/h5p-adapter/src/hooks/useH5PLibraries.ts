import { useState, useEffect, useCallback } from 'react';
import { H5PLibraryManager, H5PLibrary } from '../core/H5PLibraryManager';
import { H5PContentType } from '../types';

interface UseH5PLibrariesOptions {
  baseUrl?: string;
  autoLoad?: boolean;
  preloadLibraries?: string[];
}

interface H5PLibrariesState {
  libraries: H5PLibrary[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  libraryManager: H5PLibraryManager;
}

export const useH5PLibraries = ({
  baseUrl = '/h5p',
  autoLoad = true,
  preloadLibraries = []
}: UseH5PLibrariesOptions = {}) => {
  const [state, setState] = useState<H5PLibrariesState>(() => {
    const libraryManager = H5PLibraryManager.getInstance(baseUrl);
    return {
      libraries: libraryManager.getAvailableLibraries(),
      categories: libraryManager.getLibraryCategories(),
      isLoading: autoLoad,
      error: null,
      libraryManager
    };
  });

  // Load libraries on mount
  useEffect(() => {
    if (!autoLoad) return;

    const loadLibraries = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Preload specific libraries if specified
        if (preloadLibraries.length > 0) {
          await state.libraryManager.preloadLibraries(preloadLibraries);
        }

        setState(prev => ({
          ...prev,
          libraries: prev.libraryManager.getAvailableLibraries(),
          categories: prev.libraryManager.getLibraryCategories(),
          isLoading: false
        }));

      } catch (error) {
        console.error('Error loading H5P libraries:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load libraries'
        }));
      }
    };

    loadLibraries();
  }, [autoLoad, preloadLibraries.join(',')]);

  // Load specific library
  const loadLibrary = useCallback(async (libraryName: string): Promise<H5PLibrary | null> => {
    try {
      const library = await state.libraryManager.loadLibrary(libraryName);

      if (library) {
        setState(prev => ({
          ...prev,
          libraries: prev.libraryManager.getAvailableLibraries(),
          categories: prev.libraryManager.getLibraryCategories()
        }));
      }

      return library;
    } catch (error) {
      console.error(`Error loading library ${libraryName}:`, error);
      return null;
    }
  }, [state.libraryManager]);

  // Install library from file
  const installLibrary = useCallback(async (libraryFile: File): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const success = await state.libraryManager.installLibrary(libraryFile);

      if (success) {
        setState(prev => ({
          ...prev,
          libraries: prev.libraryManager.getAvailableLibraries(),
          categories: prev.libraryManager.getLibraryCategories(),
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to install library'
        }));
      }

      return success;
    } catch (error) {
      console.error('Error installing library:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Installation failed'
      }));
      return false;
    }
  }, [state.libraryManager]);

  // Update library
  const updateLibrary = useCallback(async (libraryName: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const success = await state.libraryManager.updateLibrary(libraryName);

      if (success) {
        setState(prev => ({
          ...prev,
          libraries: prev.libraryManager.getAvailableLibraries(),
          categories: prev.libraryManager.getLibraryCategories(),
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to update library'
        }));
      }

      return success;
    } catch (error) {
      console.error('Error updating library:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Update failed'
      }));
      return false;
    }
  }, [state.libraryManager]);

  // Search libraries
  const searchLibraries = useCallback((query: string): H5PLibrary[] => {
    return state.libraryManager.searchLibraries(query);
  }, [state.libraryManager]);

  // Get libraries by category
  const getLibrariesByCategory = useCallback((category: string): H5PLibrary[] => {
    return state.libraryManager.getLibrariesByCategory(category);
  }, [state.libraryManager]);

  // Get libraries by content type
  const getLibrariesByContentType = useCallback((contentType: H5PContentType): H5PLibrary[] => {
    return state.libraryManager.getLibrariesByContentType(contentType);
  }, [state.libraryManager]);

  // Get specific library
  const getLibrary = useCallback((libraryName: string): H5PLibrary | null => {
    return state.libraryManager.getLibrary(libraryName);
  }, [state.libraryManager]);

  // Validate library dependencies
  const validateDependencies = useCallback((libraryName: string): boolean => {
    return state.libraryManager.validateLibraryDependencies(libraryName);
  }, [state.libraryManager]);

  // Get popular/recommended libraries
  const getPopularLibraries = useCallback((): H5PLibrary[] => {
    const popularNames = [
      'H5P.InteractiveVideo',
      'H5P.CoursePresentation',
      'H5P.ImageHotspots',
      'H5P.DragQuestion',
      'H5P.BranchingScenario'
    ];

    return popularNames
      .map(name => state.libraryManager.getLibrary(name))
      .filter((library): library is H5PLibrary => library !== null);
  }, [state.libraryManager]);

  // Get libraries suitable for specific grade levels
  const getLibrariesByGradeLevel = useCallback((gradeLevel: number): H5PLibrary[] => {
    // Define grade level mappings for different library types
    const gradeMappings: Record<string, { min: number; max: number }> = {
      'H5P.DialogCards': { min: 1, max: 12 },
      'H5P.DragQuestion': { min: 3, max: 12 },
      'H5P.ImageHotspots': { min: 2, max: 12 },
      'H5P.MarkTheWords': { min: 4, max: 12 },
      'H5P.DragText': { min: 3, max: 10 },
      'H5P.InteractiveVideo': { min: 5, max: 12 },
      'H5P.CoursePresentation': { min: 6, max: 12 },
      'H5P.BranchingScenario': { min: 8, max: 12 },
      'H5P.Timeline': { min: 7, max: 12 }
    };

    return state.libraries.filter(library => {
      const mapping = gradeMappings[library.name];
      if (!mapping) return true; // Include if no specific mapping
      return gradeLevel >= mapping.min && gradeLevel <= mapping.max;
    });
  }, [state.libraries]);

  // Get libraries by subject area
  const getLibrariesBySubject = useCallback((subject: string): H5PLibrary[] => {
    const subjectMappings: Record<string, string[]> = {
      'mathematics': ['H5P.DragQuestion', 'H5P.CoursePresentation', 'H5P.InteractiveVideo'],
      'science': ['H5P.ImageHotspots', 'H5P.InteractiveVideo', 'H5P.Timeline', 'H5P.BranchingScenario'],
      'language': ['H5P.DragText', 'H5P.MarkTheWords', 'H5P.DialogCards', 'H5P.CoursePresentation'],
      'history': ['H5P.Timeline', 'H5P.BranchingScenario', 'H5P.InteractiveVideo', 'H5P.ImageHotspots'],
      'geography': ['H5P.ImageHotspots', 'H5P.InteractiveVideo', 'H5P.DragQuestion'],
      'arts': ['H5P.ImageHotspots', 'H5P.CoursePresentation', 'H5P.InteractiveVideo']
    };

    const relevantLibraryNames = subjectMappings[subject.toLowerCase()] || [];

    return state.libraries.filter(library =>
      relevantLibraryNames.includes(library.name) ||
      library.keywords.some(keyword =>
        keyword.toLowerCase().includes(subject.toLowerCase())
      )
    );
  }, [state.libraries]);

  // Clear library cache
  const clearCache = useCallback(() => {
    state.libraryManager.clearCache();
    setState(prev => ({
      ...prev,
      libraries: prev.libraryManager.getAvailableLibraries(),
      categories: prev.libraryManager.getLibraryCategories()
    }));
  }, [state.libraryManager]);

  // Get library statistics
  const getLibraryStats = useCallback(() => {
    const stats = {
      total: state.libraries.length,
      byCategory: {} as Record<string, number>,
      core: state.libraries.filter(lib => lib.isCore).length,
      installed: state.libraries.filter(lib => !lib.isCore).length
    };

    state.categories.forEach(category => {
      stats.byCategory[category] = getLibrariesByCategory(category).length;
    });

    return stats;
  }, [state.libraries, state.categories, getLibrariesByCategory]);

  return {
    // State
    libraries: state.libraries,
    categories: state.categories,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    loadLibrary,
    installLibrary,
    updateLibrary,
    clearCache,

    // Query functions
    searchLibraries,
    getLibrariesByCategory,
    getLibrariesByContentType,
    getLibrariesByGradeLevel,
    getLibrariesBySubject,
    getLibrary,
    getPopularLibraries,

    // Utility functions
    validateDependencies,
    getLibraryStats,

    // Direct access to library manager
    libraryManager: state.libraryManager
  };
};

export default useH5PLibraries;