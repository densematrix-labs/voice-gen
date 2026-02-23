import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">🎤</span>
            <span className="logo-text">Voice Gen</span>
          </Link>
          
          <nav className="nav">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/pricing" 
              className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}
            >
              {t('nav.pricing')}
            </Link>
          </nav>
          
          <div className="header-actions">
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      
      <main className="main">
        {children}
      </main>
      
      <footer className="footer">
        <div className="container footer-content">
          <p className="footer-text">
            © 2026 Voice Gen — {t('footer.tagline')}
          </p>
          <div className="footer-links">
            <a href="/terms" className="footer-link">{t('footer.terms')}</a>
            <a href="/privacy" className="footer-link">{t('footer.privacy')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
