import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import Breadcrumbs from './Breadcrumbs'

export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="container">
        <Breadcrumbs />
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <picture className="logo-wrap">
            <source srcSet="/pictures/logo.png" type="image/png" />
            <img
              src="/pictures/logo.png"
              alt="SwimShark logo"
              className="logo-img"
              onLoad={() => setLogoLoaded(true)}
              onError={() => setLogoLoaded(false)}
            />
          </picture>
          {!logoLoaded && (
            <span className="logo" aria-hidden>
              🦈
            </span>
          )}
          <span className="brand-text">SwimShark</span>
        </div>
        <button
          className="menu-toggle"
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen(v => !v)}
        >
          <span className="menu-bar" aria-hidden></span>
          <span className="menu-bar" aria-hidden></span>
          <span className="menu-bar" aria-hidden></span>
        </button>
        <nav id="site-nav" className={`nav ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setMenuOpen(false)}>
            Domov
          </NavLink>
          <NavLink to="/o-nas" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setMenuOpen(false)}>
            O nás
          </NavLink>
          <NavLink to="/lekcie" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setMenuOpen(false)}>
            Plavecké lekcie
          </NavLink>
          <NavLink to="/letny-tabor" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setMenuOpen(false)}>
            Letný tábor
          </NavLink>
          <NavLink to="/kontakt" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setMenuOpen(false)}>
            Kontakt
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
  <p>© {new Date().getFullYear()} SwimShark – Plavecká škola. Všetky práva vyhradené.</p>
      </div>
    </footer>
  )
}
