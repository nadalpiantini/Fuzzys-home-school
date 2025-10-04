'use client';

// Configuración de optimizaciones móviles
export const MOBILE_OPTIMIZATION_CONFIG = {
  // Lazy loading thresholds
  LAZY_LOAD_THRESHOLD: 100, // pixels from viewport
  IMAGE_LAZY_LOAD_THRESHOLD: 200,
  
  // Touch event optimization
  TOUCH_DEBOUNCE_MS: 16, // 60fps
  TOUCH_THROTTLE_MS: 8, // 120fps
  SWIPE_THRESHOLD: 30,
  TAP_THRESHOLD: 10,
  
  // Animation optimization
  REDUCED_MOTION: 'prefers-reduced-motion: reduce',
  HARDWARE_ACCELERATION: 'transform3d(0,0,0)',
  
  // Memory management
  MAX_COMPONENTS_IN_MEMORY: 50,
  CLEANUP_INTERVAL_MS: 30000, // 30 seconds
  
  // Network optimization
  PREFETCH_DISTANCE: 2, // prefetch next 2 components
  CACHE_SIZE: 20, // max cached components
};

// Hook para detectar capacidades del dispositivo
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    isLowEnd: false,
    hasHapticFeedback: false,
    supportsWebGL: false,
    memoryInfo: null as any,
    connection: null as any,
  });

  useEffect(() => {
    const detectCapabilities = () => {
      const newCapabilities = {
        isLowEnd: false,
        hasHapticFeedback: false,
        supportsWebGL: false,
        memoryInfo: null,
        connection: null,
      };

      // Detectar dispositivo de gama baja
      const userAgent = navigator.userAgent.toLowerCase();
      const isLowEndDevice = 
        userAgent.includes('android') && 
        (userAgent.includes('go') || userAgent.includes('lite')) ||
        navigator.hardwareConcurrency <= 2 ||
        (navigator as any).deviceMemory <= 2;

      newCapabilities.isLowEnd = isLowEndDevice;

      // Detectar feedback háptico
      newCapabilities.hasHapticFeedback = 
        'vibrate' in navigator || 
        'navigator' in window && 'vibrate' in navigator;

      // Detectar soporte WebGL
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        newCapabilities.supportsWebGL = !!gl;
      } catch (e) {
        newCapabilities.supportsWebGL = false;
      }

      // Información de memoria (si está disponible)
      if ('memory' in performance) {
        newCapabilities.memoryInfo = (performance as any).memory;
      }

      // Información de conexión
      if ('connection' in navigator) {
        newCapabilities.connection = (navigator as any).connection;
      }

      setCapabilities(newCapabilities);
    };

    detectCapabilities();
    
    // Re-detectar si cambia la conexión
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', detectCapabilities);
      
      return () => {
        connection.removeEventListener('change', detectCapabilities);
      };
    }
  }, []);

  return capabilities;
};

// Hook para optimización de imágenes
export const useImageOptimization = () => {
  const [imageConfig, setImageConfig] = useState({
    quality: 80,
    format: 'webp',
    lazy: true,
    placeholder: 'blur',
  });

  const capabilities = useDeviceCapabilities();

  useEffect(() => {
    if (capabilities.isLowEnd || capabilities.connection?.effectiveType === 'slow-2g') {
      setImageConfig({
        quality: 60,
        format: 'jpeg',
        lazy: true,
        placeholder: 'empty',
      });
    } else if (capabilities.connection?.effectiveType === '4g') {
      setImageConfig({
        quality: 90,
        format: 'webp',
        lazy: false,
        placeholder: 'blur',
      });
    }
  }, [capabilities]);

  return imageConfig;
};

// Hook para optimización de animaciones
export const useAnimationOptimization = () => {
  const [animationConfig, setAnimationConfig] = useState({
    reducedMotion: false,
    hardwareAcceleration: true,
    frameRate: 60,
  });

  useEffect(() => {
    // Detectar preferencia de movimiento reducido
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setAnimationConfig(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches,
    }));

    const handleChange = (e: MediaQueryListEvent) => {
      setAnimationConfig(prev => ({
        ...prev,
        reducedMotion: e.matches,
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return animationConfig;
};

// Hook para gestión de memoria
export const useMemoryManagement = () => {
  const [memoryStats, setMemoryStats] = useState({
    used: 0,
    total: 0,
    percentage: 0,
  });

  useEffect(() => {
    const updateMemoryStats = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize;
        const total = memory.totalJSHeapSize;
        const percentage = Math.round((used / total) * 100);

        setMemoryStats({ used, total, percentage });
      }
    };

    updateMemoryStats();
    const interval = setInterval(updateMemoryStats, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryStats;
};

// Utilidad para limpiar componentes no utilizados
export const cleanupUnusedComponents = () => {
  // Limpiar event listeners
  const elements = document.querySelectorAll('[data-cleanup]');
  elements.forEach(element => {
    const clone = element.cloneNode(true);
    element.parentNode?.replaceChild(clone, element);
  });

  // Limpiar timeouts e intervals
  const highestTimeoutId = setTimeout(() => {}, 0);
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }

  const highestIntervalId = setInterval(() => {}, 0);
  for (let i = 0; i < highestIntervalId; i++) {
    clearInterval(i);
  }
};

// Utilidad para optimizar scroll
export const optimizeScroll = (element: HTMLElement) => {
  let ticking = false;

  const updateScroll = () => {
    // Optimizar scroll con RAF
    if (!ticking) {
      requestAnimationFrame(() => {
        // Lógica de scroll optimizada
        ticking = false;
      });
      ticking = true;
    }
  };

  element.addEventListener('scroll', updateScroll, { passive: true });
  
  return () => {
    element.removeEventListener('scroll', updateScroll);
  };
};

// Utilidad para preload de componentes críticos
export const preloadCriticalComponents = (components: string[]) => {
  components.forEach(component => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = `/components/${component}.js`;
    document.head.appendChild(link);
  });
};

// Configuración de CSS para optimización móvil
export const MOBILE_CSS_OPTIMIZATIONS = `
  /* Optimizaciones de rendimiento */
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }

  /* Hardware acceleration para elementos animados */
  .animate, .transition, .transform {
    will-change: transform;
    transform: translateZ(0);
  }

  /* Optimización de scroll */
  .scroll-container {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  /* Reducir motion para usuarios sensibles */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Optimización de imágenes */
  img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }

  /* Optimización de fuentes */
  @font-face {
    font-display: swap;
  }
`;

// Hook principal de optimización móvil
export const useMobileOptimization = () => {
  const capabilities = useDeviceCapabilities();
  const imageConfig = useImageOptimization();
  const animationConfig = useAnimationOptimization();
  const memoryStats = useMemoryManagement();

  const optimizeForDevice = useCallback(() => {
    // Aplicar optimizaciones basadas en capacidades
    if (capabilities.isLowEnd) {
      // Reducir calidad de imágenes
      document.documentElement.style.setProperty('--image-quality', '0.6');
      
      // Deshabilitar animaciones complejas
      document.documentElement.classList.add('low-end-device');
    }

    if (capabilities.connection?.effectiveType === 'slow-2g') {
      // Cargar solo contenido crítico
      document.documentElement.classList.add('slow-connection');
    }

    if (animationConfig.reducedMotion) {
      // Reducir todas las animaciones
      document.documentElement.classList.add('reduced-motion');
    }
  }, [capabilities, animationConfig]);

  useEffect(() => {
    optimizeForDevice();
  }, [optimizeForDevice]);

  // Limpiar memoria periódicamente
  useEffect(() => {
    if (memoryStats.percentage > 80) {
      cleanupUnusedComponents();
    }
  }, [memoryStats.percentage]);

  return {
    capabilities,
    imageConfig,
    animationConfig,
    memoryStats,
    optimizeForDevice,
  };
};

import { useState, useEffect, useCallback } from 'react';
