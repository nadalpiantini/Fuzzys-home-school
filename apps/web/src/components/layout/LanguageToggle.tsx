'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LanguageToggleProps {
  language: 'es' | 'en';
  onToggle: () => void;
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{language.toUpperCase()}</span>
    </Button>
  );
}
