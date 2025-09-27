'use client'

import { useState, useCallback } from 'react'
import { translations } from '@/lib/i18n/translations'

type Language = 'es' | 'en'

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('es')

  const t = useCallback((key: string) => {
    const keys = key.split('.')
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }, [language])

  return { t, language, setLanguage }
}