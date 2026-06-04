import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/schedule', label: 'Schedule' },
  { to: '/teams', label: 'Teams' },
  { to: '/groups', label: 'Groups & Nations' },
]

export default function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-banner">
          <img
            src="/wc2026-banner.png"
            alt="FIFA World Cup 2026 — USA, Canada, Mexico"
            className="header-banner-img"
          />
          <div className="header-banner-overlay" />
          <div className="header-banner-content">
            <span className="header-banner-badge">FIFA World Cup 2026</span>
            <h1 className="header-banner-title">United 2026</h1>
            <p className="header-banner-sub">June 11 – July 19 · USA · Canada · Mexico</p>
          </div>
        </div>
        <div className="header-inner">
          <NavLink to="/" className="brand">
            <img
              src="/wc2026-banner.png"
              alt=""
              className="brand-logo"
              aria-hidden="true"
            />
            <div className="brand-text">
              <span className="brand-title">World Cup 2026</span>
              <span className="brand-sub">USA · Canada · Mexico</span>
            </div>
          </NavLink>
          <nav className="nav">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <p>FIFA World Cup 2026 · June 11 – July 19 · 48 Nations · 104 Matches</p>
      </footer>
    </div>
  )
}
