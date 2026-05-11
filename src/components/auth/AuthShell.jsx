import { CalendarHeart, ShieldCheck, Sparkles } from 'lucide-react';
import './auth.css';

const floatingDots = [
  { top: '10%', left: '8%', size: '4rem', delay: '0s' },
  { top: '18%', right: '12%', size: '5rem', delay: '1.5s' },
  { bottom: '14%', left: '12%', size: '3.5rem', delay: '0.8s' },
  { bottom: '18%', right: '16%', size: '4.5rem', delay: '2s' },
];

const AuthShell = ({ eyebrow, title, subtitle, children, highlights = [] }) => {
  return (
    <section className="auth-shell">
      <div className="auth-shell-bg" />
      <div className="auth-grid-overlay" />

      {floatingDots.map((dot, index) => (
        <div
          key={index}
          className="auth-orb"
          style={{
            top: dot.top,
            right: dot.right,
            bottom: dot.bottom,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            animationDelay: dot.delay,
          }}
        />
      ))}

      <div className="auth-shell-grid">
        <aside className="auth-aside">
          <div>
            <div className="auth-chip">
              <Sparkles size={14} /> Event Genie Secure Access
            </div>
            <h1 className="auth-aside-title">
              {title}
            </h1>
            <p className="auth-aside-subtitle">
              {subtitle}
            </p>
          </div>

          <div className="auth-highlights-grid">
            {highlights.map((item) => (
              <div key={item.title} className="auth-highlight-card">
                <div className="auth-highlight-icon">
                  {item.icon}
                </div>
                <h3 className="auth-highlight-title">{item.title}</h3>
                <p className="auth-highlight-desc">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="auth-badges-grid">
            <div className="auth-badge auth-badge-dark">
              <ShieldCheck className="auth-badge-icon" size={22} />
              <p className="auth-badge-label auth-badge-label-muted">JWT Protected</p>
              <p className="auth-badge-desc auth-badge-desc-light">Cookies, session persistence, and protected routes.</p>
            </div>
            <div className="auth-badge auth-badge-light">
              <CalendarHeart className="auth-badge-icon" size={22} />
              <p className="auth-badge-label auth-badge-label-dark">Built for Events</p>
              <p className="auth-badge-desc auth-badge-desc-dark">Consistent with the existing Event Genie look and feel.</p>
            </div>
          </div>
        </aside>
        <main className="auth-main">
          <div className="auth-card">
            <div className="auth-card-mobile-header">
              <div className="auth-chip">
                <Sparkles size={14} /> Event Genie Secure Access
              </div>
              <h1 className="auth-mobile-eyebrow">{eyebrow}</h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </section>
  );
};

export default AuthShell;
