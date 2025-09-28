// Utilities for immersive VR/AR experiences

export interface ImmersiveCapabilities {
  ar: boolean;
  vr: boolean;
  webxr: boolean;
  geolocation: boolean;
  camera: boolean;
  deviceMotion: boolean;
}

export interface ImmersiveExperience {
  id: string;
  title: string;
  description: string;
  type: 'ar' | 'vr' | 'mixed';
  requirements: ('camera' | 'gps' | 'gyroscope' | 'webxr')[];
  educationalLevel: 'elementary' | 'middle' | 'high';
  subjects: string[];
  duration: number; // minutes
  maxUsers: number;
  content: {
    models: string[];
    audio: string[];
    images: string[];
    videos: string[];
  };
}

// Check device capabilities for immersive experiences
export async function checkImmersiveCapabilities(): Promise<ImmersiveCapabilities> {
  const capabilities: ImmersiveCapabilities = {
    ar: false,
    vr: false,
    webxr: false,
    geolocation: false,
    camera: false,
    deviceMotion: false,
  };

  // Check WebXR support
  if ('xr' in navigator) {
    try {
      const xr = navigator.xr as any;
      capabilities.webxr = true;

      if (await xr.isSessionSupported('immersive-ar')) {
        capabilities.ar = true;
      }

      if (await xr.isSessionSupported('immersive-vr')) {
        capabilities.vr = true;
      }
    } catch (error) {
      console.warn('WebXR check failed:', error);
    }
  }

  // Check camera access
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      capabilities.camera = true;
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.warn('Camera access denied or unavailable');
    }
  }

  // Check geolocation
  if ('geolocation' in navigator) {
    capabilities.geolocation = true;
  }

  // Check device motion (gyroscope/accelerometer)
  if ('DeviceMotionEvent' in window) {
    capabilities.deviceMotion = true;
  }

  return capabilities;
}

// Determine the best experience type for the device
export function getBestExperienceType(capabilities: ImmersiveCapabilities): 'ar' | 'vr' | 'fallback' {
  if (capabilities.ar && capabilities.camera) {
    return 'ar';
  }

  if (capabilities.vr || capabilities.deviceMotion) {
    return 'vr';
  }

  return 'fallback';
}

// Generate AR markers for educational content
export interface ARMarker {
  id: string;
  type: 'pattern' | 'barcode' | 'nft' | 'location';
  value: string;
  size: number;
  content: {
    model?: string;
    text?: string;
    image?: string;
    audio?: string;
    quiz?: {
      question: string;
      answers: string[];
      correct: number;
    };
  };
}

export function generateEducationalARMarkers(topic: string, grade: string): ARMarker[] {
  const markers: ARMarker[] = [];

  // Example markers for different educational topics
  if (topic === 'solar-system') {
    markers.push(
      {
        id: 'sun-marker',
        type: 'pattern',
        value: 'sun-pattern',
        size: 1,
        content: {
          model: '/models/sun.glb',
          text: 'El Sol es una estrella que proporciona luz y calor a la Tierra.',
          audio: '/audio/sun-facts.mp3',
          quiz: {
            question: '¿Qué tipo de estrella es el Sol?',
            answers: ['Enana blanca', 'Gigante roja', 'Estrella amarilla', 'Púlsar'],
            correct: 2,
          },
        },
      },
      {
        id: 'earth-marker',
        type: 'pattern',
        value: 'earth-pattern',
        size: 1,
        content: {
          model: '/models/earth.glb',
          text: 'La Tierra es el tercer planeta desde el Sol y el único conocido con vida.',
          audio: '/audio/earth-facts.mp3',
          quiz: {
            question: '¿Cuál es la posición de la Tierra en el sistema solar?',
            answers: ['Segundo', 'Tercero', 'Cuarto', 'Quinto'],
            correct: 1,
          },
        },
      }
    );
  }

  if (topic === 'ancient-civilizations') {
    markers.push(
      {
        id: 'pyramid-marker',
        type: 'pattern',
        value: 'pyramid-pattern',
        size: 1,
        content: {
          model: '/models/pyramid.glb',
          text: 'Las pirámides de Egipto fueron construidas como tumbas para los faraones.',
          quiz: {
            question: '¿Para qué se construyeron las pirámides egipcias?',
            answers: ['Templos', 'Tumbas', 'Observatorios', 'Fortalezas'],
            correct: 1,
          },
        },
      }
    );
  }

  return markers;
}

// VR classroom environments
export interface VRClassroom {
  id: string;
  name: string;
  description: string;
  environment: 'space' | 'underwater' | 'historical' | 'microscopic' | 'abstract';
  capacity: number;
  features: string[];
  assets: {
    skybox: string;
    models: string[];
    sounds: string[];
  };
}

export const VR_CLASSROOMS: VRClassroom[] = [
  {
    id: 'space-station',
    name: 'Estación Espacial',
    description: 'Una estación espacial virtual para explorar el universo.',
    environment: 'space',
    capacity: 30,
    features: ['Gravedad cero', 'Vista de la Tierra', 'Planetas interactivos', 'Telescopio virtual'],
    assets: {
      skybox: '/skyboxes/space.jpg',
      models: ['/models/space-station.glb', '/models/planets.glb'],
      sounds: ['/audio/space-ambient.mp3'],
    },
  },
  {
    id: 'ocean-depths',
    name: 'Profundidades Oceánicas',
    description: 'Explora el fondo del océano y su biodiversidad.',
    environment: 'underwater',
    capacity: 25,
    features: ['Vida marina', 'Corrientes oceánicas', 'Ecosistemas', 'Presión del agua'],
    assets: {
      skybox: '/skyboxes/underwater.jpg',
      models: ['/models/coral-reef.glb', '/models/sea-creatures.glb'],
      sounds: ['/audio/ocean-ambient.mp3'],
    },
  },
  {
    id: 'ancient-rome',
    name: 'Roma Antigua',
    description: 'Camina por las calles de la Roma imperial.',
    environment: 'historical',
    capacity: 20,
    features: ['Coliseo', 'Foro Romano', 'Termas', 'Villas'],
    assets: {
      skybox: '/skyboxes/ancient-rome.jpg',
      models: ['/models/colosseum.glb', '/models/roman-forum.glb'],
      sounds: ['/audio/ancient-rome-ambient.mp3'],
    },
  },
  {
    id: 'cell-interior',
    name: 'Interior Celular',
    description: 'Explora el interior de una célula a nivel microscópico.',
    environment: 'microscopic',
    capacity: 15,
    features: ['Organelos', 'ADN', 'Mitocondrias', 'Núcleo'],
    assets: {
      skybox: '/skyboxes/microscopic.jpg',
      models: ['/models/cell-organelles.glb', '/models/dna.glb'],
      sounds: ['/audio/microscopic-ambient.mp3'],
    },
  },
];

// Performance optimization for immersive experiences
export interface PerformanceSettings {
  renderScale: number;
  textureQuality: 'low' | 'medium' | 'high';
  shadowQuality: 'off' | 'low' | 'medium' | 'high';
  antiAliasing: boolean;
  maxDrawCalls: number;
  targetFrameRate: 60 | 72 | 90 | 120;
}

export function getOptimalPerformanceSettings(device: {
  isMobile: boolean;
  gpu: string;
  ram: number;
  cpu: string;
}): PerformanceSettings {
  if (device.isMobile) {
    return {
      renderScale: 0.8,
      textureQuality: 'medium',
      shadowQuality: 'low',
      antiAliasing: false,
      maxDrawCalls: 500,
      targetFrameRate: 60,
    };
  }

  // Desktop settings based on hardware
  if (device.ram >= 8 && device.gpu.includes('RTX')) {
    return {
      renderScale: 1.0,
      textureQuality: 'high',
      shadowQuality: 'high',
      antiAliasing: true,
      maxDrawCalls: 2000,
      targetFrameRate: 90,
    };
  }

  // Default settings for average hardware
  return {
    renderScale: 0.9,
    textureQuality: 'medium',
    shadowQuality: 'medium',
    antiAliasing: true,
    maxDrawCalls: 1000,
    targetFrameRate: 72,
  };
}

// Safety and comfort guidelines for VR/AR
export interface ComfortSettings {
  motionSickness: 'low' | 'medium' | 'high';
  vignetting: boolean;
  snapTurning: boolean;
  teleportation: boolean;
  maxSessionTime: number; // minutes
}

export function getComfortSettings(userProfile: {
  age: number;
  vrExperience: 'none' | 'beginner' | 'experienced';
  motionSensitivity: 'low' | 'medium' | 'high';
}): ComfortSettings {
  const baseSettings: ComfortSettings = {
    motionSickness: userProfile.motionSensitivity,
    vignetting: true,
    snapTurning: true,
    teleportation: true,
    maxSessionTime: 30,
  };

  // Adjust for age
  if (userProfile.age < 13) {
    baseSettings.maxSessionTime = 15;
    baseSettings.vignetting = true;
  } else if (userProfile.age < 18) {
    baseSettings.maxSessionTime = 20;
  }

  // Adjust for experience
  if (userProfile.vrExperience === 'experienced') {
    baseSettings.snapTurning = false;
    baseSettings.vignetting = false;
    baseSettings.maxSessionTime = 45;
  }

  return baseSettings;
}

// Educational assessment in immersive environments
export interface ImmersiveAssessment {
  type: 'observation' | 'interaction' | 'creation' | 'collaboration';
  criteria: string[];
  rubric: {
    level: number;
    description: string;
    indicators: string[];
  }[];
}

export function generateImmersiveAssessment(
  subject: string,
  activity: string
): ImmersiveAssessment {
  const assessments = {
    'space-exploration': {
      type: 'observation' as const,
      criteria: [
        'Identificación de planetas',
        'Comprensión de escalas espaciales',
        'Reconocimiento de características astronómicas',
      ],
      rubric: [
        {
          level: 1,
          description: 'Reconocimiento básico',
          indicators: ['Identifica algunos planetas', 'Muestra curiosidad'],
        },
        {
          level: 2,
          description: 'Comprensión aplicada',
          indicators: ['Compara tamaños planetarios', 'Explica características'],
        },
        {
          level: 3,
          description: 'Análisis avanzado',
          indicators: ['Relaciona conceptos', 'Hace predicciones'],
        },
      ],
    },
    'historical-exploration': {
      type: 'interaction' as const,
      criteria: [
        'Navegación en entorno histórico',
        'Comprensión del contexto temporal',
        'Interacción con elementos históricos',
      ],
      rubric: [
        {
          level: 1,
          description: 'Exploración básica',
          indicators: ['Navega por el entorno', 'Reconoce elementos históricos'],
        },
        {
          level: 2,
          description: 'Comprensión contextual',
          indicators: ['Relaciona objetos con época', 'Explica importancia histórica'],
        },
        {
          level: 3,
          description: 'Análisis crítico',
          indicators: ['Compara con presente', 'Evalúa impacto histórico'],
        },
      ],
    },
  };

  const key = `${subject}-${activity}` as keyof typeof assessments;
  return assessments[key] || assessments['space-exploration'];
}

// Accessibility features for immersive experiences
export interface AccessibilityFeatures {
  audioDescriptions: boolean;
  subtitles: boolean;
  colorBlindSupport: boolean;
  motorImpairmentSupport: boolean;
  cognitiveSupport: boolean;
  simplifiedUI: boolean;
}

export function getAccessibilityFeatures(needs: string[]): AccessibilityFeatures {
  const features: AccessibilityFeatures = {
    audioDescriptions: false,
    subtitles: false,
    colorBlindSupport: false,
    motorImpairmentSupport: false,
    cognitiveSupport: false,
    simplifiedUI: false,
  };

  needs.forEach(need => {
    switch (need) {
      case 'visual':
        features.audioDescriptions = true;
        features.subtitles = true;
        break;
      case 'hearing':
        features.subtitles = true;
        break;
      case 'color-blind':
        features.colorBlindSupport = true;
        break;
      case 'motor':
        features.motorImpairmentSupport = true;
        features.simplifiedUI = true;
        break;
      case 'cognitive':
        features.cognitiveSupport = true;
        features.simplifiedUI = true;
        break;
    }
  });

  return features;
}