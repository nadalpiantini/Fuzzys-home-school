'use client'

import { ReactNode } from 'react'

// Simplified TRPC provider for now - will be expanded when implementing backend
export function TRPCProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}