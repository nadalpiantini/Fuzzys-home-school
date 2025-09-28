'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Star,
  Smile,
  BookOpen,
  Gamepad2,
  Palette,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (childData: ChildData) => void;
}

interface ChildData {
  name: string;
  age: number;
  favoriteColor: string;
  interests: string[];
  avatar: string;
  isOnboardingComplete: boolean;
}

const ageOptions = [
  { value: 3, label: '3 años', emoji: '👶' },
  { value: 4, label: '4 años', emoji: '🧒' },
  { value: 5, label: '5 años', emoji: '👧' },
  { value: 6, label: '6 años', emoji: '👦' },
  { value: 7, label: '7 años', emoji: '👧' },
  { value: 8, label: '8 años', emoji: '👦' },
  { value: 9, label: '9 años', emoji: '👧' },
  { value: 10, label: '10 años', emoji: '👦' },
  { value: 11, label: '11 años', emoji: '👧' },
  { value: 12, label: '12 años', emoji: '👦' },
  { value: 13, label: '13 años', emoji: '👧' },
  { value: 14, label: '14 años', emoji: '👦' },
  { value: 15, label: '15 años', emoji: '👧' },
  { value: 16, label: '16 años', emoji: '👦' },
  { value: 17, label: '17 años', emoji: '👧' },
  { value: 18, label: '18+ años', emoji: '👨‍🎓' },
];

const colorOptions = [
  { value: 'pink', label: 'Rosa', emoji: '🌸', color: 'bg-pink-500' },
  { value: 'blue', label: 'Azul', emoji: '💙', color: 'bg-blue-500' },
  { value: 'green', label: 'Verde', emoji: '💚', color: 'bg-green-500' },
  { value: 'purple', label: 'Morado', emoji: '💜', color: 'bg-purple-500' },
  { value: 'yellow', label: 'Amarillo', emoji: '💛', color: 'bg-yellow-500' },
  { value: 'orange', label: 'Naranja', emoji: '🧡', color: 'bg-orange-500' },
];

const interestOptions = [
  { value: 'math', label: 'Matemáticas', emoji: '🧮' },
  { value: 'science', label: 'Ciencias', emoji: '🔬' },
  { value: 'language', label: 'Lenguaje', emoji: '📚' },
  { value: 'history', label: 'Historia', emoji: '🏛️' },
  { value: 'art', label: 'Arte', emoji: '🎨' },
  { value: 'music', label: 'Música', emoji: '🎵' },
  { value: 'programming', label: 'Programación', emoji: '💻' },
  { value: 'games', label: 'Juegos', emoji: '🎮' },
  { value: 'sports', label: 'Deportes', emoji: '⚽' },
  { value: 'nature', label: 'Naturaleza', emoji: '🌱' },
];

const avatarOptions = [
  { value: 'cat', emoji: '🐱', label: 'Gatito' },
  { value: 'dog', emoji: '🐶', label: 'Perrito' },
  { value: 'bunny', emoji: '🐰', label: 'Conejito' },
  { value: 'bear', emoji: '🐻', label: 'Osito' },
  { value: 'bird', emoji: '🐦', label: 'Pajarito' },
  { value: 'butterfly', emoji: '🦋', label: 'Mariposa' },
];

export default function ChildOnboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [childData, setChildData] = useState<Partial<ChildData>>({});

  const updateData = (field: keyof ChildData, value: any) => {
    setChildData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      onComplete({
        ...(childData as ChildData),
        isOnboardingComplete: true,
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-3xl font-bold text-pink-600">
              ¡Hola! Bienvenido/a
            </h2>
            <p className="text-lg text-gray-600">
              Vamos a conocernos mejor para crear tu experiencia de aprendizaje
              perfecta
            </p>
            <div className="bg-pink-50 rounded-2xl p-6">
              <p className="text-pink-700 font-medium">¿Cómo te llamas?</p>
              <input
                type="text"
                placeholder="Escribe tu nombre aquí..."
                className="w-full mt-4 p-4 text-lg border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none"
                value={childData.name || ''}
                onChange={(e) => updateData('name', e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎂</div>
            <h2 className="text-3xl font-bold text-blue-600">
              ¿Cuántos años tienes?
            </h2>
            <p className="text-lg text-gray-600">
              Esto nos ayuda a personalizar tu experiencia de aprendizaje
            </p>
            <div className="grid grid-cols-4 gap-3 max-h-80 overflow-y-auto">
              {ageOptions.map((age) => (
                <button
                  key={age.value}
                  onClick={() => updateData('age', age.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    childData.age === age.value
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{age.emoji}</div>
                  <div className="font-semibold text-blue-600 text-sm">
                    {age.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-3xl font-bold text-purple-600">
              ¿Cuál es tu color favorito?
            </h2>
            <p className="text-lg text-gray-600">
              Vamos a decorar tu mundo con tu color preferido
            </p>
            <div className="grid grid-cols-3 gap-4">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateData('favoriteColor', color.value)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    childData.favoriteColor === color.value
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{color.emoji}</div>
                  <div className="font-semibold text-purple-600">
                    {color.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">⭐</div>
            <h2 className="text-3xl font-bold text-green-600">
              ¿Qué materias te interesan?
            </h2>
            <p className="text-lg text-gray-600">
              Selecciona las que más te gusten (puedes elegir varias)
            </p>
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest.value}
                  onClick={() => {
                    const currentInterests = childData.interests || [];
                    const newInterests = currentInterests.includes(
                      interest.value,
                    )
                      ? currentInterests.filter((i) => i !== interest.value)
                      : [...currentInterests, interest.value];
                    updateData('interests', newInterests);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    childData.interests?.includes(interest.value)
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{interest.emoji}</div>
                  <div className="font-semibold text-green-600 text-sm">
                    {interest.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="text-3xl font-bold text-orange-600">
              ¡Elige tu avatar!
            </h2>
            <p className="text-lg text-gray-600">
              Esta será tu representación en la plataforma
            </p>
            <div className="grid grid-cols-3 gap-4">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar.value}
                  onClick={() => updateData('avatar', avatar.value)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    childData.avatar === avatar.value
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{avatar.emoji}</div>
                  <div className="font-semibold text-orange-600 text-sm">
                    {avatar.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl font-bold text-pink-600">
              🎓 Fuzzy's Home School
            </h1>
          </div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-3 h-3 rounded-full ${
                  stepNum <= step ? 'bg-pink-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {renderStep()}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6"
            >
              Atrás
            </Button>
            <Button
              onClick={nextStep}
              disabled={
                (step === 1 && !childData.name) ||
                (step === 2 && !childData.age) ||
                (step === 3 && !childData.favoriteColor) ||
                (step === 4 &&
                  (!childData.interests || childData.interests.length === 0)) ||
                (step === 5 && !childData.avatar)
              }
              className="bg-pink-500 hover:bg-pink-600 px-6"
            >
              {step === 5 ? '¡Empezar!' : 'Siguiente'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
