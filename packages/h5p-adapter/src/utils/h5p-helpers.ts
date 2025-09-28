export class H5PHelpers {
  static validateContent(content: any): boolean {
    return content && content.id && content.library;
  }

  static sanitizeContent(content: any): any {
    // Basic sanitization - in a real implementation, you would do more thorough sanitization
    return {
      ...content,
      id: content.id?.toString() || '',
      title: content.title?.toString() || '',
      library: content.library?.toString() || ''
    };
  }

  static generateContentId(): string {
    return `h5p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  static calculateScore(score: number, maxScore: number): number {
    if (maxScore === 0) return 0;
    return Math.round((score / maxScore) * 100);
  }

  static getContentTypeDisplayName(contentType: string): string {
    const typeMap: Record<string, string> = {
      'interactive-video': 'Video Interactivo',
      'course-presentation': 'Presentación del Curso',
      'dialog-cards': 'Tarjetas de Diálogo',
      'drag-the-words': 'Arrastra las Palabras',
      'drag-drop-advanced': 'Arrastrar y Soltar Avanzado',
      'hotspot-image': 'Imagen con Puntos Activos',
      'branching-scenario': 'Escenario de Ramificación',
      'quiz': 'Cuestionario',
      'game': 'Juego',
      'simulation': 'Simulación'
    };
    
    return typeMap[contentType] || contentType.charAt(0).toUpperCase() + contentType.slice(1);
  }
}