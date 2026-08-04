import { useEffect, useState } from 'react'

const STORAGE_KEY = 'gm-dashboard-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Manages the app's color theme by toggling a `.dark` class on <html>,
 * which every component picks up automatically via the CSS variable
 * overrides in src/index.css. Persists the choice to localStorage and
 * falls back to the OS preference on first load.
 *
 * toggleTheme optionally takes the triggering click event — if the browser
 * supports the View Transitions API, the theme swap animates as a circular
 * reveal expanding from that click point, in either direction. Unsupported
 * browsers just get the instant class swap, smoothed by the global
 * color-fade transition in index.css.
 */
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  // Keeps localStorage in sync. Also handles the class toggle for the
  // no-view-transition path (Firefox/Safari, or reduced-motion users).
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme(event) {
    const next = theme === 'dark' ? 'light' : 'dark'

    const supportsViewTransition =
      typeof document.startViewTransition === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!supportsViewTransition) {
      setTheme(next)
      return
    }

    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? window.innerHeight / 2
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      // Toggle the class synchronously here, inside the callback — not in
      // the useEffect above — so the "new" snapshot the browser captures
      // for the reveal animation reliably reflects the new theme, in both
      // directions. React state is still updated so the icon/localStorage
      // stay in sync; the effect's redundant class toggle afterward is a
      // harmless no-op.
      document.documentElement.classList.toggle('dark', next === 'dark')
      setTheme(next)
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    })
  }

  return { theme, toggleTheme }
}