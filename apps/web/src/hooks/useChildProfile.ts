'use client';

import { useState, useEffect } from 'react';

export interface ChildData {
  id?: string;
  name: string;
  age: number;
  favoriteColor: string;
  interests: string[];
  avatar: string;
  isOnboardingComplete: boolean;
}

export function useChildProfile() {
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del niño desde localStorage
    const savedData = localStorage.getItem('childProfile');
    if (savedData) {
      setChildData(JSON.parse(savedData));
    }
    setIsLoading(false);
  }, []);

  const saveChildData = (data: ChildData) => {
    const childDataWithOnboarding = {
      ...data,
      isOnboardingComplete: true,
    };
    setChildData(childDataWithOnboarding);
    localStorage.setItem(
      'childProfile',
      JSON.stringify(childDataWithOnboarding),
    );
  };

  const clearChildData = () => {
    setChildData(null);
    localStorage.removeItem('childProfile');
  };

  const getGreeting = () => {
    if (!childData) return '¡Hola!';

    const hour = new Date().getHours();
    if (hour < 12) return `¡Buenos días, ${childData.name}! 🌅`;
    if (hour < 18) return `¡Buenas tardes, ${childData.name}! ☀️`;
    return `¡Buenas noches, ${childData.name}! 🌙`;
  };

  const getPersonalizedGames = () => {
    if (!childData) return [];

    // Filtrar juegos basados en intereses del usuario
    const allGames = [
      { id: 'math', name: 'Matemáticas Divertidas', interest: 'math' },
      { id: 'science', name: 'Experimentos Científicos', interest: 'science' },
      { id: 'language', name: 'Lenguaje y Literatura', interest: 'language' },
      { id: 'history', name: 'Aventuras Históricas', interest: 'history' },
      { id: 'art', name: 'Arte y Creatividad', interest: 'art' },
      { id: 'music', name: 'Música y Sonidos', interest: 'music' },
      {
        id: 'programming',
        name: 'Programación Visual',
        interest: 'programming',
      },
      { id: 'games', name: 'Juegos Educativos', interest: 'games' },
      { id: 'sports', name: 'Deportes y Actividad', interest: 'sports' },
      { id: 'nature', name: 'Naturaleza y Ecología', interest: 'nature' },
    ];

    return allGames.filter((game) =>
      childData.interests.includes(game.interest),
    );
  };

  const getAgeAppropriateLevel = () => {
    if (!childData) return 'prek-2';

    if (childData.age <= 5) return 'prek-2';
    if (childData.age <= 8) return 'grades-3-5';
    if (childData.age <= 12) return 'grades-6-8';
    if (childData.age <= 18) return 'grades-9-12';
    return 'adult'; // Para usuarios de 18+ años
  };

  return {
    childData,
    isLoading,
    saveChildData,
    clearChildData,
    getGreeting,
    getPersonalizedGames,
    getAgeAppropriateLevel,
  };
}
