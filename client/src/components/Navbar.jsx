import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { name: 'Providers', href: '#providers' },
  { name: 'Planner', href: '#ai-chat' },
  { name: 'Budget', href: '#budget' },
  { name: 'AR Preview', href: '#ar-preview' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);

    if (isHomePage) {
      const sectionIds = ['hero', 'ai-chat', 'budget', 'ar-preview', 'providers'];
      const observers = [];
      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const obs = new IntersectionObserver(
          ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
          { threshold: 0.3 }
        );
        obs.observe(el);
        observers.push(obs);
      });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        observers.forEach(o => o.disconnect());
      };
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const handleClick = (href) => {
    setMobileOpen(false);

    if (isHomePage) {
      // On homepage — smooth scroll
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // On other pages — navigate home and pass the desired section
      const targetId = href?.startsWith('#') ? href.slice(1) : href;
      navigate('/', { state: { scrollTarget: targetId } });
    }
  };

  const handleBrandClick = () => {
    setMobileOpen(false);
    if (isHomePage) {
      document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleLogout = async () => {
    setMobileOpen(false);
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Provider pages have hero banners too — keep transparent until scrolled
  const isProviderPage = location.pathname.startsWith('/providers');
  const hasHero = isHomePage || isProviderPage;
  const navClass = `navbar ${scrolled ? 'scrolled' : hasHero ? 'on-dark' : 'scrolled'}`;

  return (
    <nav className={navClass}>
      <div className="container" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '2.5rem' }}>

        <a
          href="#hero"
          onClick={(e) => { e.preventDefault(); handleBrandClick(); }}
          className="nav-brand"
        >
          EVENT GENIE
        </a>

        {/* Desktop */}
        <div id="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginLeft: 'auto' }}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleClick(link.href); }}
              className={`nav-link ${activeSection === link.href.slice(1) ? 'active' : ''}`}
            >
              {link.name}
            </a>
          ))}
          {!loading && (user ? (
            <>
              <button
                className="btn btn-outline btn-round"
                style={{ padding: '0.6rem 1.35rem', fontSize: '0.75rem' }}
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button
                className="btn btn-primary btn-round"
                style={{ padding: '0.6rem 1.35rem', fontSize: '0.75rem' }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-primary btn-round"
                style={{ padding: '0.6rem 1.35rem', fontSize: '0.75rem' }}
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="btn btn-primary btn-round"
                style={{ padding: '0.6rem 1.35rem', fontSize: '0.75rem' }}
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            </>
          ))}
          <button
            className="btn btn-primary btn-round"
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.75rem' }}
            onClick={() => handleClick('#ai-chat')}
          >
            Get Started
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          id="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'none' }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, width: '100%',
          background: 'rgba(233,220,200,0.98)', backdropFilter: 'blur(20px)',
          padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem',
          borderBottom: '1px solid var(--border-light)'
        }}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleClick(link.href); }}
              className={`nav-link ${activeSection === link.href.slice(1) ? 'active' : ''}`}
            >
              {link.name}
            </a>
          ))}
          {!loading && (user ? (
            <>
              <button className="btn btn-outline btn-round" onClick={() => navigate('/dashboard')}>Dashboard</button>
              <button className="btn btn-primary btn-round" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary btn-round" onClick={() => navigate('/login')}>Login</button>
              <button className="btn btn-primary btn-round" onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
