import snipbarIconUrl from '../assets/snipbar-icon.png'

export function SnipBarIcon({ size = 24, className = '' }) {
  return (
    <img
      src={snipbarIconUrl}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{ width: size, height: size }}
      className={['inline-block shrink-0 select-none object-contain', className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

export function SnipBarMenuIcon({ size = 15, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Monochrome macOS menu bar glyph matching SnipBar's 45° interlocking S-ribbon mark */}
      <g transform="rotate(-45 12 12)">
        {/* Upper-left interlocking half */}
        <path
          d="M19.8 7.5V5.6C19.8 4.7 19.1 4.0 18.2 4.0H5.8C4.9 4.0 4.2 4.7 4.2 5.6V12.8C4.2 14.7 5.75 16.25 7.65 16.25C9.55 16.25 11.1 14.7 11.1 12.8V11.2C11.1 8.2 13.5 5.8 16.5 5.8C17.8 5.8 18.9 6.4 19.8 7.5Z"
          fill="currentColor"
        />
        {/* Lower-right interlocking half (exact 180° rotational symmetry) */}
        <path
          d="M4.2 16.5V18.4C4.2 19.3 4.9 20.0 5.8 20.0H18.2C19.1 20.0 19.8 19.3 19.8 18.4V11.2C19.8 9.3 18.25 7.75 16.35 7.75C14.45 7.75 12.9 9.3 12.9 11.2V12.8C12.9 15.8 10.5 18.2 7.5 18.2C6.2 18.2 5.1 17.6 4.2 16.5Z"
          fill="currentColor"
          fillOpacity="0.88"
        />
      </g>
    </svg>
  )
}
