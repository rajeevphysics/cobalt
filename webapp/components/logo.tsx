export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1" />
        <ellipse cx="16" cy="16" rx="14" ry="6" stroke="currentColor" strokeWidth="1" />
        <ellipse cx="16" cy="16" rx="6" ry="14" stroke="currentColor" strokeWidth="1" />
        <line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1" />
        <line x1="16" y1="2" x2="16" y2="30" stroke="currentColor" strokeWidth="1" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
      </svg>
    </div>
  )
}
