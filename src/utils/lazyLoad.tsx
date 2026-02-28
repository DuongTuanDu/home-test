// utils/lazyLoad.tsx
import { lazy, Suspense } from 'react'
import type { ComponentType } from 'react'

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

export const lazyLoad = (
  importFunc: () => Promise<{ default: ComponentType<any> }>
) => {
  const LazyComponent = lazy(importFunc)
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent />
    </Suspense>
  )
}