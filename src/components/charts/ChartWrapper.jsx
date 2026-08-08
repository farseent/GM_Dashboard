import { ResponsiveContainer } from 'recharts'
import { memo, useEffect, useRef, useState } from 'react'

function ChartWrapper({
  title,
  subtitle,
  actions,
  height = 280,
  children,
}) {
  const containerRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect() // animate only once
        }
      },
      {
        threshold: 0.25, // 25% visible
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-border-subtle bg-surface-raised p-5"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-fg">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-fg-subtle">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      <div className={`transition-all duration-700 ${
          visible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6'
        }`}
      >
        {visible ? (
          <ResponsiveContainer width="100%" height={height}>
            {children}
          </ResponsiveContainer>
        ) : (
          <div
            style={{ height }}
            className="animate-pulse rounded-md bg-brand-800/8"
          />
        )}
      </div>
    </div>
  )
}

export default memo(ChartWrapper)