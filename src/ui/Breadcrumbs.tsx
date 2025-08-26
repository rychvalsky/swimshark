import { Link, useLocation } from 'react-router-dom'

const LABELS: Record<string, string> = {
  'o-nas': 'O nás',
  'lekcie': 'Lekcie',
  'letny-tabor': 'Letný tábor',
  'prihlasenie': 'Prihlásenie',
  'kontakt': 'Kontakt',
  'admin': 'Administrácia',
}

export default function Breadcrumbs(){
  const location = useLocation()
  const parts = location.pathname.split('/').filter(Boolean)

  // Do not render on home
  if (parts.length === 0) return null

  const items = parts.map((seg, idx) => {
    const path = '/' + parts.slice(0, idx + 1).join('/')
    const label = LABELS[seg] ?? decodeURIComponent(seg)
    const isLast = idx === parts.length - 1
    return { path, label, isLast }
  })

  return (
    <nav className="breadcrumbs" aria-label="breadcrumbs">
      <Link to="/">Domov</Link>
      {items.map((it, i) => (
        <span key={it.path}>
          <span className="sep">/</span>
          {it.isLast ? (
            <span className="current">{it.label}</span>
          ) : (
            <Link to={it.path}>{it.label}</Link>
          )}
        </span>
      ))}
    </nav>
  )
}
