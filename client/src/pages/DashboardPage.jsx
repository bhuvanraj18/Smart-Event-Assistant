import { CalendarDays, LogOut, Sparkles, UserCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('You have been logged out.');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error('Unable to log out right now.');
    }
  };

  const cards = [
    {
      icon: <UserCircle2 size={22} />,
      title: 'Profile',
      desc: user?.email || 'Connected account',
    },
    {
      icon: <Sparkles size={22} />,
      title: 'Planning tools',
      desc: 'AI chat, budget planning, and AR previews are ready to use.',
    },
    {
      icon: <CalendarDays size={22} />,
      title: 'Created',
      desc: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently joined',
    },
  ];

  return (
    <section className="section section-cream" style={{ minHeight: 'calc(100vh - 92px)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div className="section-label" style={{ marginBottom: '1rem' }}>Dashboard</div>
            <h1 style={{ maxWidth: '48rem', fontSize: 'clamp(2.4rem, 6vw, 4.8rem)', color: 'var(--text-dark)' }}>
              Welcome back, {user?.name || 'planner'}.
            </h1>
            <p style={{ marginTop: '1rem', maxWidth: '40rem', fontSize: '1rem', lineHeight: 2, color: 'var(--text-muted)' }}>
              Your secure Event Genie session is active. Continue planning, revisit your saved ideas, and jump back into the tools that shape your next event.
            </p>
          </div>
          <button className="btn btn-primary btn-round" onClick={handleLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Info Cards */}
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {cards.map((card) => (
            <div key={card.title} className="card">
              <div style={{ marginBottom: '1rem', display: 'flex', width: '3rem', height: '3rem', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-light)' }}>
                {card.icon}
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-dark)' }}>{card.title}</h3>
              <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div style={{ marginTop: '2rem', display: 'grid', gap: '1.5rem', gridTemplateColumns: '1.2fr 0.8fr' }}>
          <div className="card card-dark">
            <div className="section-label section-label-light">Next Steps</div>
            <h2 style={{ color: 'var(--text-light)' }}>Continue building your event plan.</h2>
            <p style={{ marginTop: '1rem', maxWidth: '40rem', color: 'var(--text-muted-light)' }}>
              Open the homepage to access AI planning, budget allocations, providers, and the AR decoration preview.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <button className="btn btn-light btn-round" onClick={() => navigate('/')}>
                Open Home
              </button>
              <button className="btn btn-outline btn-round" style={{ borderColor: 'rgba(245,240,232,0.4)', color: 'var(--text-light)' }} onClick={() => navigate('/providers')}>
                Browse Providers
              </button>
            </div>
          </div>
          <div className="card">
            <div className="section-label">Security</div>
            <p style={{ color: 'var(--text-muted)' }}>
              Your session is stored in an HTTP-only cookie and protected through the `/api/auth/me` route guard. This keeps the JWT out of browser JavaScript while maintaining persistence across refreshes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
