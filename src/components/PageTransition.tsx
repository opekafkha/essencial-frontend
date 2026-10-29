import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

/** Animate the view without remounting its forms, queries, or active call. */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation()
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const view = ref.current
    if (!view || typeof view.animate !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const animation = view.animate([
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 240, easing: 'cubic-bezier(.22, 1, .36, 1)' })
    return () => animation.cancel()
  }, [pathname, search])
  return <div ref={ref} className="page-view">{children}</div>
}
