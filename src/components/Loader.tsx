import './Loader.css'

interface LoaderProps {
  label?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  tone?: 'green' | 'light'
  showLabel?: boolean
  className?: string
}

/** Shared, scoped adaptation of the two groups of seven animated bars. */
export function Loader({ label = 'Cargando…', size = 'md', tone = 'green', showLabel = false, className = '' }: LoaderProps) {
  return (
    <span className={`essencial-loader essencial-loader--${size} essencial-loader--${tone} ${className}`.trim()} role="status" aria-live="polite" aria-atomic="true">
      <span className="essencial-loader__art" aria-hidden="true">
        {[0, 1].map((group) => (
          <span className="essencial-loader__bars" key={group}>
            {Array.from({ length: 7 }, (_, bar) => (
              <span className="essencial-loader__bar" key={bar} style={{ animationDelay: `calc(var(--loader-speed) * ${group === 1 && bar === 0 ? -.501 : -bar * .02 - group * .5})` }} />
            ))}
          </span>
        ))}
      </span>
      <span className={showLabel ? 'essencial-loader__label' : 'essencial-loader__label essencial-loader__label--hidden'}>{label}</span>
    </span>
  )
}
