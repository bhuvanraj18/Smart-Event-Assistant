import { ArrowRight } from 'lucide-react';
import ProvidersSection from '../components/ProvidersSection';

const ProvidersPage = () => {
  return (
    <>
      <section className="section section-dark" style={{ minHeight: '48vh', paddingTop: '8rem', paddingBottom: '4rem' }}>
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