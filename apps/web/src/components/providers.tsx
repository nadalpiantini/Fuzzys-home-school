'use client'

import { ReactNode } from 'react'
import { I18nProvider } from '@/lib/i18n/provider'
import { TRPCProvider } from '@/lib/trpc/provider'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TRPCProvider>
      <I18nProvider>
        {children}
        <Toaster richColors position="top-center" />
      </I18nProvider>
    </TRPCProvider>
  )
}