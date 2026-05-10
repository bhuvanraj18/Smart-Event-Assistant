import gsap from 'gsap';
import { ArrowRight, ChevronDown, DollarSign, Eye, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ProvidersSection from '../components/ProvidersSection';

const Home = () => {
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Hero animations
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo('.hero-title', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' })
      .fromTo('.hero-subtitle', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .fromTo('.hero-cta-group', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.3')
      .fromTo('.scroll-cue', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.1');

    // Scroll-triggered reveals
    const observeReveal = (ref) => {
      if (!ref.current) return;
      const els = ref.current.querySelectorAll('.reveal');
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('visible'), i * 120);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 });
      els.forEach(el => obs.observe(el));
    };

    observeReveal(aboutRef);
    observeReveal(featuresRef);
    observeReveal(stepsRef);
    observeReveal(ctaRef);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ============ HERO ============ */}
      <section id="hero" ref={heroRef} className="hero-section">
        <div className="hero-bg">
          <img src="/hero-bg.png" alt="Elegant event venue" loading="eager" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            Plan Unforgettable<br />Events With AI
          </h1>
          <p className="hero-subtitle">
            Smart budget planning, AI-powered recommendations, and live AR decoration preview — all in one platform.
          </p>
          <div className="hero-cta-group" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => scrollTo('ai-chat')} className="btn btn-light btn-round">
              Start Planning <ArrowRight size={16} />
            </button>
            <button onClick={() => scrollTo('ar-preview')} className="btn btn-outline btn-round" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
              Explore AR Preview
            </button>
          </div>
        </div>
        <div className="scroll-cue" onClick={() => scrollTo('about')}>
          <span>Scroll</span>
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" ref={aboutRef} className="section section-cream">
        <div className="container">
          <div className="about-grid">
            <div>
              <div className="section-label reveal">About Us</div>
              <p className="about-quote reveal">
                "Just like in every great event, the magic is in the details."
              </p>
              <p className="reveal" style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1rem', maxWidth: '480px' }}>
                Event Genie brings together artificial intelligence and immersive AR technology to transform how you plan, visualize, and execute events. From intimate gatherings to grand celebrations — we handle the complexity so you can focus on the magic.
              </p>
              <button onClick={() => scrollTo('ai-chat')} className="btn btn-primary reveal" style={{ marginTop: '2rem' }}>
                Learn More <ArrowRight size={14} />
              </button>
            </div>
            <div className="reveal">
              <img src="/about-bg.png" alt="Elegant event details" className="about-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" ref={featuresRef} className="section section-warm" style={{ alignItems: 'stretch' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="section-label reveal">What We Offer</div>
          <h2 className="reveal" style={{ marginBottom: '3.5rem', maxWidth: '600px' }}>
            Everything you need, intelligently connected.
          </h2>
          <div className="features-grid">
            {[
              {
                num: '01',
                title: 'AI Event Planner',
                desc: 'Get instant personalized ideas, themes, and vendor recommendations using Gemini-powered intelligence. Just describe your vision.',
                icon: <Sparkles size={22} />,
                action: () => scrollTo('ai-chat'),
              },
              {
                num: '02',
                title: 'Smart Budget',
                desc: 'Dynamically allocate your event budget with AI-driven insights. Optimize every dollar and avoid hidden expenses.',
                icon: <DollarSign size={22} />,
                action: () => scrollTo('budget'),
              },
              {
                num: '03',
                title: 'Live AR Preview',
                desc: 'Visualize flower arrangements, tablescapes, and lighting instantly in your actual venue space using augmented reality.',
                icon: <Eye size={22} />,
                action: () => scrollTo('ar-preview'),
              },
            ].map((f, i) => (
              <div key={i} className="feature-card reveal" onClick={f.action}>
                <div className="feature-num">{f.num}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <div style={{ marginTop: '1.5rem' }}>{f.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROVIDERS ============ */}
      <ProvidersSection />

      {/* ============ HOW IT WORKS ============ */}
      <section ref={stepsRef} className="section section-dark">
        <div className="container">
          <div className="section-label section-label-light reveal">How It Works</div>
          <h2 className="reveal" style={{ color: 'var(--text-light)', marginBottom: '4rem', maxWidth: '550px' }}>
            Three steps to your dream event.
          </h2>
          <div className="steps-grid">
            <div className="step-item reveal">
              <h3 className="step-title">Describe Your Vision</h3>
              <p className="step-desc">Tell our AI chatbot about your event — the type, theme, guest count, and any specific ideas you have in mind.</p>
            </div>
            <div className="step-item reveal">
              <h3 className="step-title">AI Plans Everything</h3>
              <p className="step-desc">Our intelligent engine creates a tailored budget breakdown, suggests decorations, and recommends the perfect vendors.</p>
            </div>
            <div className="step-item reveal">
              <h3 className="step-title">Preview in AR</h3>
              <p className="step-desc">See exactly how decorations will look in your actual venue using augmented reality before making any commitment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section ref={ctaRef} style={{ position: 'relative', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '6rem 0', background: '#0f1118' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img src="/cta-bg.png" alt="Dream event" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} loading="lazy" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,17,24,0.4) 0%, rgba(15,17,24,0.65) 100%)' }} />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="cta-banner" style={{ opacity: 1 }}>
            <h2 style={{ color: 'white' }}>Ready to plan your<br />dream event?</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>Let our AI handle the details while you focus on creating memories that last a lifetime.</p>
            <button onClick={() => scrollTo('ai-chat')} className="btn btn-light btn-round">
              Start Planning Now <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
