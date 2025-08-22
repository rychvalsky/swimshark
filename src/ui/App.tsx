import { NavLink, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="container">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <span className="logo" aria-hidden>
            🦈
          </span>
          <span className="brand-text">SwimShark</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Domov
          </NavLink>
          <NavLink to="/o-nas" className={({ isActive }) => (isActive ? 'active' : '')}>
            O nás
          </NavLink>
          <NavLink to="/lekcie" className={({ isActive }) => (isActive ? 'active' : '')}>
            Plavecké lekcie
          </NavLink>
          <NavLink to="/letny-tabor" className={({ isActive }) => (isActive ? 'active' : '')}>
            Letný tábor
          </NavLink>
          <NavLink to="/kontakt" className={({ isActive }) => (isActive ? 'active' : '')}>
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
