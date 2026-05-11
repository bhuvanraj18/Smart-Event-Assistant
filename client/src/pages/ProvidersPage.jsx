import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ProvidersSection from '../components/ProvidersSection';

const ProvidersPage = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const els = heroRef.current.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 100);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <section ref={heroRef} className="section section-dark" style={{ minHeight: '48vh', paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div className="section-label section-label-light reveal">Service Providers</div>
          <h1 className="reveal" style={{ color: 'var(--text-light)', maxWidth: '760px', marginBottom: '1.25rem' }}>
            Explore premium vendors for every kind of event.
          </h1>
          <p className="reveal" style={{ color: 'var(--text-muted-light)', maxWidth: '620px', fontSize: '1rem', lineHeight: 1.8 }}>
            Browse curated categories, compare trusted vendors, and move from inspiration to booking with less friction.
          </p>
          <a
            href="#providers"
            className="btn btn-light btn-round reveal"
            style={{ marginTop: '2.25rem' }}
          >
            Explore Categories <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <ProvidersSection />
    </>
  );
};

export default ProvidersPage;