import { H5PContent, H5PContentType } from '../types';

/**
 * Utility functions for H5P content manipulation and validation
 */

export class H5PHelpers {
  /**
   * Validate H5P content structure
   */
  static validateContent(content: any): content is H5PContent {
    return (
      content &&
      typeof content.id === 'string' &&
      typeof content.type === 'string' &&
      typeof content.title === 'string' &&
      typeof content.library === 'string' &&
      content.params &&
      typeof content.params === 'object'
    );
  }

  /**
   * Generate a unique content ID
   */
  static generateContentId(): string {
    return `h5p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract library name and version from library string
   */
  static parseLibraryString(library: string): {
    name: string;
    majorVersion: number;
    minorVersion: number;
  } | null {
    const match = library.match(/^(.+?)\s+(\d+)\.(\d+)$/);
    if (!match) return null;

    return {
      name: match[1],
      majorVersion: parseInt(match[2], 10),
      minorVersion: parseInt(match[3], 10)
    };
  }

  /**
   * Format library string from components
   */
  static formatLibraryString(
    name: string,
    majorVersion: number,
    minorVersion: number
  ): string {
    return `${name} ${majorVersion}.${minorVersion}`;
  }

  /**
   * Get default parameters for content type
   */
  static getDefaultParams(contentType: H5PContentType): any {
    const defaults: Record<H5PContentType, any> = {
      drag_drop_advanced: {
        taskDescription: 'Arrastra los elementos a las zonas correctas',
        dropzones: [],
        draggables: [],
        feedback: {
          correct: '¡Correcto!',
          incorrect: 'Inténtalo de nuevo'
        }
      },
      hotspot_image: {
        image: { url: '', alt: '' },
        hotspots: []
      },
      branching_scenario: {
        title: 'Nuevo escenario',
        startingScreen: 'start',
        screens: [{
          id: 'start',
          content: 'Inicio del escenario',
          choices: []
        }]
      },
      interactive_video: {
        video: {
          url: '',
          startScreenOptions: {
            title: 'Video Interactivo',
            hideStartTitle: false
          }
        },
        interactions: []
      },
      dialog_cards: {
        title: 'Tarjetas de Diálogo',
        description: '',
        cards: [],
        behaviour: {
          enableRetry: true,
          randomCards: false,
          maxProficiency: 5
        }
      },
      course_presentation: {
        title: 'Presentación',
        slides: [],
        settings: {
          showProgressBar: true,
          showSummarySlide: true,
          enableKeyboardNavigation: true
        }
      },
      drag_the_words: {
        taskDescription: 'Arrastra las palabras para completar el texto',
        textField: 'Este es un texto con *palabras* para arrastrar.',
        checkAnswer: 'Verificar',
        tryAgain: 'Intentar de nuevo',
        showSolution: 'Mostrar solución',
        behaviour: {
          enableRetry: true,
          enableSolutionsButton: true,
          instantFeedback: false
        }
      },
      mark_the_words: {
        taskDescription: 'Marca las palabras correctas',
        textField: 'Este es un texto con *palabras* marcadas.',
        checkAnswer: 'Verificar',
        tryAgain: 'Intentar de nuevo',
        showSolution: 'Mostrar solución',
        behaviour: {
          enableRetry: true,
          enableSolutionsButton: true,
          showScorePoints: true
        }
      },
      image_sequence_advanced: {
        title: 'Secuencia de Imágenes',
        description: 'Ordena las imágenes en la secuencia correcta',
        images: [],
        behaviour: {
          enableRetry: true,
          enableSolutionsButton: true
        }
      },
      timeline_interactive: {
        title: 'Línea de Tiempo',
        description: 'Explora los eventos en orden cronológico',
        events: [],
        settings: {
          enableZoom: true,
          startYear: new Date().getFullYear() - 10,
          endYear: new Date().getFullYear()
        }
      },
      accordion: {
        title: 'Acordeón',
        panels: []
      },
      collage: {
        title: 'Collage',
        description: '',
        images: []
      },
      image_hotspots: {
        image: { url: '', alt: '' },
        hotspots: []
      },
      image_slider: {
        title: 'Comparador de Imágenes',
        leftImage: { url: '', alt: '' },
        rightImage: { url: '', alt: '' }
      },
      speak_the_words: {
        description: 'Pronuncia las palabras correctamente',
        words: [],
        language: 'es'
      },
      find_the_words: {
        taskDescription: 'Encuentra las palabras en la sopa de letras',
        words: [],
        gridSize: 10
      },
      sort_paragraphs: {
        taskDescription: 'Ordena los párrafos en el orden correcto',
        paragraphs: []
      }
    };

    return defaults[contentType] || {};
  }

  /**
   * Convert H5P content to exportable format
   */
  static exportContent(content: H5PContent): any {
    return {
      mainLibrary: content.library,
      title: content.title,
      language: content.language || 'es',
      embedTypes: ['div'],
      license: 'U',
      defaultLanguage: content.language || 'es',
      params: content.params,
      metadata: {
        title: content.title,
        description: content.description || '',
        license: 'U',
        licenseVersion: '4.0',
        yearFrom: new Date().getFullYear(),
        yearTo: new Date().getFullYear(),
        source: window.location.origin,
        ...content.metadata
      }
    };
  }

  /**
   * Import content from H5P export format
   */
  static importContent(
    exportData: any,
    contentId?: string
  ): H5PContent | null {
    if (!exportData || !exportData.mainLibrary || !exportData.params) {
      return null;
    }

    try {
      const library = H5PHelpers.parseLibraryString(exportData.mainLibrary);
      if (!library) return null;

      // Determine content type from library name
      const contentTypeMap: Record<string, H5PContentType> = {
        'H5P.DragQuestion': 'drag_drop_advanced',
        'H5P.ImageHotspots': 'hotspot_image',
        'H5P.BranchingScenario': 'branching_scenario',
        'H5P.InteractiveVideo': 'interactive_video',
        'H5P.DialogCards': 'dialog_cards',
        'H5P.CoursePresentation': 'course_presentation',
        'H5P.DragText': 'drag_the_words',
        'H5P.MarkTheWords': 'mark_the_words'
      };

      const contentType = contentTypeMap[library.name];
      if (!contentType) {
        console.warn(`Unknown library type: ${library.name}`);
        return null;
      }

      return {
        id: contentId || H5PHelpers.generateContentId(),
        type: contentType,
        title: exportData.title || exportData.metadata?.title || 'Contenido H5P',
        description: exportData.metadata?.description,
        metadata: exportData.metadata,
        params: exportData.params,
        library: exportData.mainLibrary,
        language: exportData.language || exportData.defaultLanguage || 'es'
      };
    } catch (error) {
      console.error('Error importing H5P content:', error);
      return null;
    }
  }

  /**
   * Sanitize HTML content for H5P
   */
  static sanitizeHTML(html: string): string {
    // Basic HTML sanitization for H5P content
    const allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'span', 'div', 'table', 'tr', 'td', 'th'
    ];

    const allowedAttributes = [
      'href', 'src', 'alt', 'title', 'class', 'id', 'style'
    ];

    // Simple implementation - in production, use a proper HTML sanitizer
    let sanitized = html;

    // Remove script tags
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');

    // Remove dangerous attributes
    sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');

    return sanitized;
  }

  /**
   * Get content type display name in Spanish
   */
  static getContentTypeDisplayName(contentType: H5PContentType): string {
    const displayNames: Record<H5PContentType, string> = {
      drag_drop_advanced: 'Arrastrar y Soltar',
      hotspot_image: 'Imagen con Puntos de Acceso',
      branching_scenario: 'Escenario de Ramificación',
      interactive_video: 'Video Interactivo',
      dialog_cards: 'Tarjetas de Diálogo',
      course_presentation: 'Presentación del Curso',
      drag_the_words: 'Arrastra las Palabras',
      mark_the_words: 'Marca las Palabras',
      image_sequence_advanced: 'Secuencia de Imágenes',
      timeline_interactive: 'Línea de Tiempo Interactiva',
      accordion: 'Acordeón',
      collage: 'Collage',
      image_hotspots: 'Puntos de Acceso en Imagen',
      image_slider: 'Comparador de Imágenes',
      speak_the_words: 'Pronuncia las Palabras',
      find_the_words: 'Sopa de Letras',
      sort_paragraphs: 'Ordenar Párrafos'
    };

    return displayNames[contentType] || contentType;
  }

  /**
   * Get content difficulty level based on content type and parameters
   */
  static getContentDifficulty(content: H5PContent): 'easy' | 'medium' | 'hard' {
    const { type, params } = content;

    // Simple heuristics for determining difficulty
    switch (type) {
      case 'dialog_cards':
        return params.cards?.length > 20 ? 'hard' : params.cards?.length > 10 ? 'medium' : 'easy';

      case 'drag_drop_advanced':
        return params.draggables?.length > 8 ? 'hard' : params.draggables?.length > 4 ? 'medium' : 'easy';

      case 'branching_scenario':
        return params.screens?.length > 10 ? 'hard' : params.screens?.length > 5 ? 'medium' : 'easy';

      case 'interactive_video':
        return params.interactions?.length > 10 ? 'hard' : params.interactions?.length > 5 ? 'medium' : 'easy';

      case 'mark_the_words':
      case 'drag_the_words':
        const wordCount = (params.textField || '').split('*').length - 1;
        return wordCount > 10 ? 'hard' : wordCount > 5 ? 'medium' : 'easy';

      default:
        return 'medium';
    }
  }

  /**
   * Estimate completion time for content
   */
  static estimateCompletionTime(content: H5PContent): number {
    const { type, params } = content;

    // Return estimated time in minutes
    switch (type) {
      case 'dialog_cards':
        return Math.max(2, Math.ceil((params.cards?.length || 0) * 0.5));

      case 'drag_drop_advanced':
        return Math.max(3, Math.ceil((params.draggables?.length || 0) * 0.8));

      case 'interactive_video':
        // Assume video duration plus interaction time
        return Math.max(5, 10 + (params.interactions?.length || 0) * 2);

      case 'branching_scenario':
        return Math.max(5, Math.ceil((params.screens?.length || 0) * 1.5));

      case 'course_presentation':
        return Math.max(5, Math.ceil((params.slides?.length || 0) * 2));

      case 'mark_the_words':
      case 'drag_the_words':
        const wordCount = (params.textField || '').split('*').length - 1;
        return Math.max(2, Math.ceil(wordCount * 0.3));

      default:
        return 5;
    }
  }

  /**
   * Generate content summary for display
   */
  static generateContentSummary(content: H5PContent): string {
    const { type, params } = content;

    switch (type) {
      case 'dialog_cards':
        return `${params.cards?.length || 0} tarjetas de diálogo`;

      case 'drag_drop_advanced':
        return `${params.draggables?.length || 0} elementos para arrastrar`;

      case 'interactive_video':
        return `Video con ${params.interactions?.length || 0} interacciones`;

      case 'branching_scenario':
        return `Escenario con ${params.screens?.length || 0} pantallas`;

      case 'course_presentation':
        return `Presentación con ${params.slides?.length || 0} diapositivas`;

      case 'mark_the_words':
      case 'drag_the_words':
        const wordCount = (params.textField || '').split('*').length - 1;
        return `Texto con ${wordCount} palabras interactivas`;

      default:
        return 'Contenido interactivo H5P';
    }
  }

  /**
   * Check if content is compatible with mobile devices
   */
  static isMobileCompatible(content: H5PContent): boolean {
    const mobileCompatibleTypes: H5PContentType[] = [
      'dialog_cards',
      'mark_the_words',
      'drag_the_words',
      'hotspot_image',
      'image_sequence_advanced',
      'accordion'
    ];

    return mobileCompatibleTypes.includes(content.type);
  }

  /**
   * Get recommended grade levels for content type
   */
  static getRecommendedGradeLevels(contentType: H5PContentType): { min: number; max: number } {
    const gradeLevels: Record<H5PContentType, { min: number; max: number }> = {
      dialog_cards: { min: 1, max: 12 },
      drag_drop_advanced: { min: 3, max: 12 },
      hotspot_image: { min: 2, max: 12 },
      mark_the_words: { min: 4, max: 12 },
      drag_the_words: { min: 3, max: 10 },
      interactive_video: { min: 5, max: 12 },
      course_presentation: { min: 6, max: 12 },
      branching_scenario: { min: 8, max: 12 },
      image_sequence_advanced: { min: 2, max: 8 },
      timeline_interactive: { min: 7, max: 12 },
      accordion: { min: 4, max: 12 },
      collage: { min: 1, max: 6 },
      image_hotspots: { min: 2, max: 12 },
      image_slider: { min: 3, max: 12 },
      speak_the_words: { min: 1, max: 8 },
      find_the_words: { min: 4, max: 12 },
      sort_paragraphs: { min: 5, max: 12 }
    };

    return gradeLevels[contentType] || { min: 1, max: 12 };
  }
}

export default H5PHelpers;