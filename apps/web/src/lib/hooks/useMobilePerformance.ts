'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useMobileOptimization } from '../optimization/mobile-optimization';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  touchLatency: number;
}

interface PerformanceConfig {
  targetFPS: number;
  maxMemoryUsage: number;
  maxRenderTime: number;
  maxTouchLatency: number;
}

export const useMobilePerformance = (config?: Partial<PerformanceConfig>) => {
  const {
    capabilities,
    memoryStats,
    optimizeForDevice,
  } = useMobileOptimization();

  const defaultConfig: PerformanceConfig = {
    targetFPS: capabilities.isLowEnd ? 30 : 60,
    maxMemoryUsage: capabilities.isLowEnd ? 70 : 80,
    maxRenderTime: capabilities.isLowEnd ? 16 : 8,
    maxTouchLatency: capabilities.isLowEnd ? 50 : 16,
  };

  const finalConfig = { ...defaultConfig, ...config };

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    touchLatency: 0,
  });

  const [isOptimized, setIsOptimized] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderStartRef = useRef(0);
  const touchStartRef = useRef(0);

  // Medir FPS
  const measureFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    
    if (delta >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / delta);
      setMetrics(prev => ({ ...prev, fps }));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    } else {
      frameCountRef.current++;
    }
  }, []);

  // Medir tiempo de renderizado
  const startRenderMeasure = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  const endRenderMeasure = useCallback(() => {
    const renderTime = performance.now() - renderStartRef.current;
    setMetrics(prev => ({ ...prev, renderTime }));
  }, []);

  // Medir latencia táctil
  const startTouchMeasure = useCallback(() => {
    touchStartRef.current = performance.now();
  }, []);

  const endTouchMeasure = useCallback(() => {
    const touchLatency = performance.now() - touchStartRef.current;
    setMetrics(prev => ({ ...prev, touchLatency }));
  }, []);

  // Optimizaciones automáticas basadas en métricas
  const applyOptimizations = useCallback(() => {
    const optimizations: string[] = [];

    // Optimización de FPS
    if (metrics.fps < finalConfig.targetFPS) {
      optimizations.push('Reducing animation complexity');
      document.documentElement.classList.add('low-fps');
    }

    // Optimización de memoria
    if (memoryStats.percentage > finalConfig.maxMemoryUsage) {
      optimizations.push('Clearing unused components');
      // Limpiar componentes no utilizados
      const unusedElements = document.querySelectorAll('[data-cleanup]');
      unusedElements.forEach(el => el.remove());
    }

    // Optimización de renderizado
    if (metrics.renderTime > finalConfig.maxRenderTime) {
      optimizations.push('Reducing DOM complexity');
      document.documentElement.classList.add('slow-render');
    }

    // Optimización de latencia táctil
    if (metrics.touchLatency > finalConfig.maxTouchLatency) {
      optimizations.push('Optimizing touch events');
      document.documentElement.classList.add('slow-touch');
    }

    if (optimizations.length > 0) {
      setWarnings(prev => [...prev, ...optimizations]);
      setIsOptimized(true);
    }
  }, [metrics, memoryStats, finalConfig]);

  // Hook para optimizar componentes específicos
  const optimizeComponent = useCallback((componentName: string) => {
    const optimizations = {
      'MemoryCards': () => {
        // Reducir número de tarjetas visibles
        const cards = document.querySelectorAll('[data-card-index]');
        if (cards.length > 12) {
          cards.forEach((card, index) => {
            if (index > 11) {
              (card as HTMLElement).style.display = 'none';
            }
          });
        }
      },
      'DragDrop': () => {
        // Optimizar elementos arrastrables
        const dragItems = document.querySelectorAll('.drag-item');
        dragItems.forEach(item => {
          (item as HTMLElement).style.willChange = 'transform';
        });
      },
      'StoryLesson': () => {
        // Lazy load actividades no visibles
        const activities = document.querySelectorAll('[data-activity]');
        activities.forEach((activity, index) => {
          if (index > 2) {
            (activity as HTMLElement).style.display = 'none';
          }
        });
      },
    };

    const optimization = optimizations[componentName as keyof typeof optimizations];
    if (optimization) {
      optimization();
    }
  }, []);

  // Hook para preload de recursos críticos
  const preloadCriticalResources = useCallback(() => {
    const criticalResources = [
      '/images/barney-avatar.png',
      '/images/fuzzy-teacher.png',
      '/fonts/alan-sans.woff2',
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      if (resource.endsWith('.woff2')) {
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      } else if (resource.endsWith('.png') || resource.endsWith('.jpg')) {
        link.as = 'image';
      }
      document.head.appendChild(link);
    });
  }, []);

  // Hook para optimizar imágenes
  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const element = img as HTMLImageElement;
      
      // Aplicar lazy loading
      if (!element.loading) {
        element.loading = 'lazy';
      }
      
      // Optimizar formato
      if (element.src.includes('.jpg') && capabilities.connection?.effectiveType !== 'slow-2g') {
        element.src = element.src.replace('.jpg', '.webp');
      }
      
      // Reducir calidad en dispositivos de gama baja
      if (capabilities.isLowEnd) {
        element.style.imageRendering = 'crisp-edges';
      }
    });
  }, [capabilities]);

  // Hook para optimizar animaciones
  const optimizeAnimations = useCallback(() => {
    const animatedElements = document.querySelectorAll('.animate, .transition');
    animatedElements.forEach(element => {
      const el = element as HTMLElement;
      
      // Reducir animaciones en dispositivos de gama baja
      if (capabilities.isLowEnd) {
        el.style.animationDuration = '0.1s';
        el.style.transitionDuration = '0.1s';
      }
      
      // Aplicar hardware acceleration
      el.style.willChange = 'transform';
      el.style.transform = 'translateZ(0)';
    });
  }, [capabilities]);

  // Efecto principal de optimización
  useEffect(() => {
    const interval = setInterval(() => {
      measureFPS();
      applyOptimizations();
    }, 1000);

    return () => clearInterval(interval);
  }, [measureFPS, applyOptimizations]);

  // Aplicar optimizaciones iniciales
  useEffect(() => {
    preloadCriticalResources();
    optimizeImages();
    optimizeAnimations();
    optimizeForDevice();
  }, [preloadCriticalResources, optimizeImages, optimizeAnimations, optimizeForDevice]);

  // Hook para limpiar optimizaciones
  const cleanup = useCallback(() => {
    document.documentElement.classList.remove('low-fps', 'slow-render', 'slow-touch');
    setWarnings([]);
    setIsOptimized(false);
  }, []);

  // Hook para obtener recomendaciones de optimización
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics.fps < finalConfig.targetFPS) {
      recommendations.push('Consider reducing animation complexity or using CSS transforms instead of changing layout properties');
    }

    if (memoryStats.percentage > finalConfig.maxMemoryUsage) {
      recommendations.push('Implement component cleanup and lazy loading for better memory management');
    }

    if (metrics.renderTime > finalConfig.maxRenderTime) {
      recommendations.push('Reduce DOM complexity by using virtual scrolling or pagination');
    }

    if (metrics.touchLatency > finalConfig.maxTouchLatency) {
      recommendations.push('Optimize touch event handlers with debouncing and throttling');
    }

    return recommendations;
  }, [metrics, memoryStats, finalConfig]);

  return {
    metrics,
    isOptimized,
    warnings,
    capabilities,
    optimizeComponent,
    cleanup,
    getOptimizationRecommendations,
    startRenderMeasure,
    endRenderMeasure,
    startTouchMeasure,
    endTouchMeasure,
  };
};
