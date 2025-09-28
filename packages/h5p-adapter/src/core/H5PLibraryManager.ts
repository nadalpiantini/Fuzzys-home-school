import { H5PContentType } from '../types';

export interface H5PLibrary {
  name: string;
  title: string;
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
  description: string;
  icon: string;
  category: string;
  keywords: string[];
  tutorial?: string;
  example?: string;
  contentTypes: H5PContentType[];
  isCore: boolean;
  dependencies?: string[];
  requiredCoreApi?: {
    majorVersion: number;
    minorVersion: number;
  };
}

export class H5PLibraryManager {
  private static instance: H5PLibraryManager;
  private libraries: Map<string, H5PLibrary> = new Map();
  private baseUrl: string;

  private constructor(baseUrl: string = '/h5p') {
    this.baseUrl = baseUrl;
    this.initializeCoreLibraries();
  }

  public static getInstance(baseUrl?: string): H5PLibraryManager {
    if (!H5PLibraryManager.instance) {
      H5PLibraryManager.instance = new H5PLibraryManager(baseUrl);
    }
    return H5PLibraryManager.instance;
  }

  private initializeCoreLibraries(): void {
    const coreLibraries: H5PLibrary[] = [
      {
        name: 'H5P.InteractiveVideo',
        title: 'Video Interactivo',
        majorVersion: 1,
        minorVersion: 24,
        patchVersion: 0,
        description: 'Añade interacciones a videos para crear experiencias de aprendizaje atractivas',
        icon: 'video-camera',
        category: 'multimedia',
        keywords: ['video', 'interactivo', 'multimedia', 'quiz'],
        tutorial: 'https://h5p.org/tutorial-interactive-video',
        example: 'https://h5p.org/interactive-video',
        contentTypes: ['interactive_video'],
        isCore: true,
        dependencies: ['H5P.Video', 'H5P.Question'],
        requiredCoreApi: { majorVersion: 1, minorVersion: 24 }
      },
      {
        name: 'H5P.CoursePresentation',
        title: 'Presentación del Curso',
        majorVersion: 1,
        minorVersion: 25,
        patchVersion: 0,
        description: 'Crea presentaciones interactivas con diapositivas multimedia',
        icon: 'presentation',
        category: 'presentation',
        keywords: ['presentación', 'diapositivas', 'multimedia', 'interactivo'],
        tutorial: 'https://h5p.org/tutorial-course-presentation',
        example: 'https://h5p.org/course-presentation',
        contentTypes: ['course_presentation'],
        isCore: true,
        dependencies: ['H5P.Question'],
        requiredCoreApi: { majorVersion: 1, minorVersion: 25 }
      },
      {
        name: 'H5P.ImageHotspots',
        title: 'Puntos de Acceso en Imagen',
        majorVersion: 1,
        minorVersion: 10,
        patchVersion: 0,
        description: 'Crea imágenes interactivas con puntos de información',
        icon: 'image',
        category: 'interactive',
        keywords: ['imagen', 'hotspots', 'interactivo', 'información'],
        tutorial: 'https://h5p.org/tutorial-image-hotspots',
        example: 'https://h5p.org/image-hotspots',
        contentTypes: ['hotspot_image'],
        isCore: true,
        requiredCoreApi: { majorVersion: 1, minorVersion: 10 }
      },
      {
        name: 'H5P.BranchingScenario',
        title: 'Escenario de Ramificación',
        majorVersion: 1,
        minorVersion: 7,
        patchVersion: 0,
        description: 'Crea historias interactivas donde las decisiones afectan el resultado',
        icon: 'branching',
        category: 'interactive',
        keywords: ['historia', 'decisiones', 'ramificación', 'aventura'],
        tutorial: 'https://h5p.org/tutorial-branching-scenario',
        example: 'https://h5p.org/branching-scenario',
        contentTypes: ['branching_scenario'],
        isCore: true,
        dependencies: ['H5P.Question'],
        requiredCoreApi: { majorVersion: 1, minorVersion: 7 }
      },
      {
        name: 'H5P.DragQuestion',
        title: 'Arrastrar y Soltar',
        majorVersion: 1,
        minorVersion: 14,
        patchVersion: 0,
        description: 'Crea tareas de arrastrar y soltar con múltiples zonas de destino',
        icon: 'drag-drop',
        category: 'interactive',
        keywords: ['arrastrar', 'soltar', 'clasificar', 'organizar'],
        tutorial: 'https://h5p.org/tutorial-drag-and-drop',
        example: 'https://h5p.org/drag-and-drop',
        contentTypes: ['drag_drop_advanced'],
        isCore: true,
        dependencies: ['H5P.Question'],
        requiredCoreApi: { majorVersion: 1, minorVersion: 14 }
      },
      {
        name: 'H5P.DragText',
        title: 'Arrastrar las Palabras',
        majorVersion: 1,
        minorVersion: 10,
        patchVersion: 0,
        description: 'Crea tareas donde los estudiantes arrastran palabras para completar oraciones',
        icon: 'text-drag',
        category: 'text',
        keywords: ['texto', 'palabras', 'completar', 'arrastrar'],
        tutorial: 'https://h5p.org/tutorial-drag-the-words',
        example: 'https://h5p.org/drag-the-words',
        contentTypes: ['drag_the_words'],
        isCore: true,
        dependencies: ['H5P.Question'],
        requiredCoreApi: { majorVersion: 1, minorVersion: 10 }
      },
      {
        name: 'H5P.MarkTheWords',
        title: 'Marcar las Palabras',
        majorVersion: 1,
        minorVersion: 11,
        patchVersion: 0,
        description: 'Permite a los estudiantes resaltar palabras importantes en un texto',
        icon: 'highlight',
        category: 'text',
        keywords: ['texto', 'resaltar', 'marcar', 'palabras'],
        tutorial: 'https://h5p.org/tutorial-mark-the-words',
        example: 'https://h5p.org/mark-the-words',
        contentTypes: ['mark_the_words'],
        isCore: true,
        dependencies: ['H5P.Question'],
        requiredCoreApi: { majorVersion: 1, minorVersion: 11 }
      },
      {
        name: 'H5P.DialogCards',
        title: 'Tarjetas de Diálogo',
        majorVersion: 1,
        minorVersion: 9,
        patchVersion: 0,
        description: 'Crea tarjetas didácticas para ejercicios de memorización y repetición',
        icon: 'cards',
        category: 'memorization',
        keywords: ['tarjetas', 'memorización', 'flashcards', 'repetición'],
        tutorial: 'https://h5p.org/tutorial-dialog-cards',
        example: 'https://h5p.org/dialog-cards',
        contentTypes: ['dialog_cards'],
        isCore: true,
        requiredCoreApi: { majorVersion: 1, minorVersion: 9 }
      },
      {
        name: 'H5P.Timeline',
        title: 'Línea de Tiempo',
        majorVersion: 1,
        minorVersion: 1,
        patchVersion: 0,
        description: 'Crea líneas de tiempo interactivas con eventos multimedia',
        icon: 'timeline',
        category: 'presentation',
        keywords: ['tiempo', 'cronología', 'eventos', 'historia'],
        tutorial: 'https://h5p.org/tutorial-timeline',
        example: 'https://h5p.org/timeline',
        contentTypes: ['timeline_interactive'],
        isCore: true,
        requiredCoreApi: { majorVersion: 1, minorVersion: 1 }
      },
      {
        name: 'H5P.ImageSequencing',
        title: 'Secuenciación de Imágenes',
        majorVersion: 1,
        minorVersion: 1,
        patchVersion: 0,
        description: 'Organiza imágenes en el orden correcto para contar una historia',
        icon: 'sequence',
        category: 'interactive',
        keywords: ['secuencia', 'orden', 'imágenes', 'cronología'],
        tutorial: 'https://h5p.org/tutorial-image-sequencing',
        example: 'https://h5p.org/image-sequencing',
        contentTypes: ['image_sequence_advanced'],
        isCore: false,
        dependencies: ['H5P.Question'],
        requiredCoreApi: { majorVersion: 1, minorVersion: 1 }
      }
    ];

    coreLibraries.forEach(library => {
      this.libraries.set(library.name, library);
    });
  }

  public async loadLibrary(libraryName: string): Promise<H5PLibrary | null> {
    // Check if library is already loaded
    if (this.libraries.has(libraryName)) {
      return this.libraries.get(libraryName)!;
    }

    try {
      // Fetch library information from server
      const response = await fetch(`${this.baseUrl}/ajax/libraries/${libraryName}`);
      if (!response.ok) {
        throw new Error(`Failed to load library: ${libraryName}`);
      }

      const libraryData = await response.json();
      const library: H5PLibrary = {
        name: libraryData.name,
        title: libraryData.title,
        majorVersion: libraryData.majorVersion,
        minorVersion: libraryData.minorVersion,
        patchVersion: libraryData.patchVersion,
        description: libraryData.description || '',
        icon: libraryData.icon || 'default',
        category: libraryData.category || 'other',
        keywords: libraryData.keywords || [],
        tutorial: libraryData.tutorial,
        example: libraryData.example,
        contentTypes: libraryData.contentTypes || [],
        isCore: libraryData.isCore || false,
        dependencies: libraryData.dependencies || [],
        requiredCoreApi: libraryData.requiredCoreApi
      };

      this.libraries.set(libraryName, library);
      return library;
    } catch (error) {
      console.error(`Failed to load H5P library ${libraryName}:`, error);
      return null;
    }
  }

  public getAvailableLibraries(): H5PLibrary[] {
    return Array.from(this.libraries.values());
  }

  public getLibrariesByCategory(category: string): H5PLibrary[] {
    return Array.from(this.libraries.values()).filter(
      library => library.category === category
    );
  }

  public getLibrariesByContentType(contentType: H5PContentType): H5PLibrary[] {
    return Array.from(this.libraries.values()).filter(
      library => library.contentTypes.includes(contentType)
    );
  }

  public searchLibraries(query: string): H5PLibrary[] {
    const searchQuery = query.toLowerCase();
    return Array.from(this.libraries.values()).filter(library =>
      library.title.toLowerCase().includes(searchQuery) ||
      library.description.toLowerCase().includes(searchQuery) ||
      library.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery))
    );
  }

  public getLibrary(libraryName: string): H5PLibrary | null {
    return this.libraries.get(libraryName) || null;
  }

  public async installLibrary(libraryPackage: File): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('library', libraryPackage);

      const response = await fetch(`${this.baseUrl}/ajax/install-library`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to install library');
      }

      const result = await response.json();
      if (result.success && result.library) {
        const library = result.library;
        this.libraries.set(library.name, library);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to install H5P library:', error);
      return false;
    }
  }

  public async updateLibrary(libraryName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/ajax/update-library/${libraryName}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to update library');
      }

      const result = await response.json();
      if (result.success && result.library) {
        const library = result.library;
        this.libraries.set(library.name, library);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to update H5P library:', error);
      return false;
    }
  }

  public validateLibraryDependencies(libraryName: string): boolean {
    const library = this.getLibrary(libraryName);
    if (!library) return false;

    if (!library.dependencies) return true;

    for (const dependency of library.dependencies) {
      if (!this.libraries.has(dependency)) {
        console.warn(`Missing dependency: ${dependency} for library: ${libraryName}`);
        return false;
      }
    }

    return true;
  }

  public getLibraryCategories(): string[] {
    const categories = new Set<string>();
    Array.from(this.libraries.values()).forEach(library => {
      categories.add(library.category);
    });
    return Array.from(categories).sort();
  }

  public async preloadLibraries(libraryNames: string[]): Promise<void> {
    const loadPromises = libraryNames.map(name => this.loadLibrary(name));
    await Promise.all(loadPromises);
  }

  public clearCache(): void {
    this.libraries.clear();
    this.initializeCoreLibraries();
  }
}

export default H5PLibraryManager;