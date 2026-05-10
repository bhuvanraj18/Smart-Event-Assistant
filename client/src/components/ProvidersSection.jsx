import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryMeta, providerData } from '../data/providerData';

const categories = Object.entries(categoryMeta).map(([key, meta]) => ({
  key,
  ...meta,
  vendorCount: providerData[key]?.length || 0,
}));

const ProvidersSection = () => {
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    cards.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="providers" className="section section-cream" ref={sectionRef}>
      <div className="container">
        {/* Section header */}
        <div className="providers-header reveal">
          <div className="section-label">Service Providers</div>
          <h2 className="providers-title">
            Find the Perfect Service
            <br />
            <span className="text-italic">Providers</span> for Your Event
          </h2>
          <p className="providers-subtitle">
            Explore top-rated vendors for every occasion — from weddings to birthdays.
            AI-powered recommendations to match your budget and style.
          </p>
        </div>

        {/* Category grid */}
        <div className="provider-category-grid">
          {categories.map((cat, index) => (
            <article
              key={cat.key}
              className="provider-category-card reveal"
              onClick={() => navigate(`/providers/${cat.key}`)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/providers/${cat.key}`);
                }
              }}
              style={{ '--delay': `${index * 0.08}s` }}
            >
              {/* Background image */}
              <div className="pcc-bg">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                />
              </div>

              {/* Overlay */}
              <div className="pcc-overlay" />

              {/* Content */}
              <div className="pcc-content">
                <span className="pcc-icon">{cat.icon}</span>
                <h3 className="pcc-name">{cat.name}</h3>
                <p className="pcc-tagline">{cat.tagline}</p>
                <div className="pcc-meta">
                  <span className="pcc-count">{cat.vendorCount} Vendors</span>
                </div>
                <button
                  type="button"
                  className="pcc-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/providers/${cat.key}`);
                  }}
                >
                  Explore Providers <ArrowRight size={14} />
                </button>
              </div>

              {/* Corner accent */}
              <div className="pcc-accent" />
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="providers-bottom-cta reveal">
          <p>Can't find what you're looking for?</p>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/providers')}
          >
            View All Categories <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProvidersSection;
