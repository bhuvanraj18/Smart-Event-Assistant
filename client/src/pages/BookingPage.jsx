import gsap from 'gsap';
import {
  ArrowRight, Calendar, CheckCircle, ChevronDown, Clock, DollarSign,
  HeadphonesIcon, Heart, Loader2, Mail, MapPin, MessageSquare, Phone, Send,
  Shield, Sparkles, Star, Upload, Users, X
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { launchConfetti } from '../utils/confetti';

/* ─── Animated Counter Hook ─── */
const useAnimatedCounter = (target, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    if (!startOnView || !ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const isNum = /^\d+$/.test(target.replace(/[^\d]/g, ''));
        if (!isNum) { setCount(target); return; }
        const num = parseInt(target.replace(/[^\d]/g, ''), 10);
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          setCount(Math.round(num * p));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration, startOnView]);
  return { count, ref };
};

/* ─── Toast Component ─── */
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`bk-toast bk-toast-${type}`}>
      <CheckCircle size={18} />
      <span>{message}</span>
      <button className="bk-toast-close" onClick={onClose}><X size={14} /></button>
    </div>
  );
};

/* ─── static data ─── */
const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Concert', 'Festival', 'Private Party'];
const BUDGET_RANGES = ['$1,000 – $5,000', '$5,000 – $15,000', '$15,000 – $50,000', '$50,000 – $100,000', '$100,000+'];
const STAGES = ['Booking Submitted', 'Team Review', 'Planning Started', 'Vendors Confirmed', 'Final Approval', 'Event Ready'];
const STATUS_LIST = ['Pending', 'Accepted', 'In Planning', 'Vendor Assigned', 'Confirmed', 'Event Ready'];

const TESTIMONIALS = [
  { name: 'Sarah Mitchell', event: 'Wedding', text: 'Event Genie turned our dream wedding into reality. The AI planning tools saved us months of stress and the AR preview was magical!' },
  { name: 'James Chen', event: 'Corporate', text: 'We booked our annual gala through Event Genie. The vendor matching was spot-on and the budget planner kept us perfectly on track.' },
  { name: 'Priya Sharma', event: 'Birthday', text: 'My daughter\'s sweet sixteen was absolutely perfect. The team\'s attention to detail and creative suggestions blew us away!' },
];

const FAQS = [
  { q: 'How far in advance should I book?', a: 'We recommend booking at least 3-6 months in advance for large events like weddings, and 1-2 months for smaller gatherings. However, we can accommodate rush requests depending on availability.' },
  { q: 'Can I modify my booking after submission?', a: 'Absolutely! You can modify your booking details anytime before the "Vendors Confirmed" stage. Simply contact our support team or update through your dashboard.' },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit cards, bank transfers, and digital wallets. Payment plans are available for events over $10,000.' },
  { q: 'Is my deposit refundable?', a: 'Yes, deposits are fully refundable up to 30 days before the event date. After that, a partial refund may apply depending on vendor commitments.' },
  { q: 'Do you provide on-site event coordination?', a: 'Yes! Every booking includes a dedicated event coordinator who will be present on-site to ensure everything runs smoothly.' },
  { q: 'Can I use the AR preview tool before booking?', a: 'Of course! The AR decoration preview is available to all users. Head to our homepage to try it out before making any commitments.' },
];

const WHY_US = [
  { icon: <HeadphonesIcon size={26} />, num: '24/7', label: 'Dedicated Support', desc: 'Round-the-clock assistance for all your event planning needs.' },
  { icon: <Heart size={26} />, num: '500+', label: 'Events Planned', desc: 'Hundreds of successful events delivered with perfection.' },
  { icon: <Users size={26} />, num: '100+', label: 'Verified Vendors', desc: 'Curated network of top-rated service providers.' },
  { icon: <Star size={26} />, num: '98%', label: 'Satisfaction Rate', desc: 'Our clients love the results we deliver every time.' },
];

/* ─── Map vendor category to event type ─── */
const categoryToEventType = {
  'Wedding': 'Wedding',
  'Birthday': 'Birthday',
  'Corporate Events': 'Corporate',
  'Parties & Gatherings': 'Private Party',
  'College & Fest Events': 'Festival',
  'Baby Shower': 'Private Party',
  'Religious Events': 'Private Party',
};

/* ─── Component ─── */
const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const vendor = location.state?.vendor || null;
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '',
    eventType: vendor ? (categoryToEventType[vendor.category] || '') : '',
    eventDate: '',
    eventLocation: '', expectedGuests: '', budgetRange: '', notes: '',
    themePreference: '', inspirationImage: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [currentStage, setCurrentStage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState(-1);
  const [progressPercent, setProgressPercent] = useState(0);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  /* Hero GSAP animation */
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo('.bk-hero-title', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' })
      .fromTo('.bk-hero-sub', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .fromTo('.bk-hero-cta', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.3');
  }, []);

  /* Scroll-triggered reveals */
  useEffect(() => {
    const els = document.querySelectorAll('.bk-reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 100);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [isSubmitted]);

  /* Testimonial auto-rotate */
  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  /* Progress animation after submit */
  useEffect(() => {
    if (!isSubmitted) return;
    const target = Math.round(((currentStage + 1) / STAGES.length) * 100);
    let current = 0;
    const step = () => {
      current += 1;
      if (current <= target) { setProgressPercent(current); requestAnimationFrame(step); }
    };
    requestAnimationFrame(step);
    // Simulate stage progression
    const timers = STAGES.map((_, i) => {
      if (i <= currentStage) return null;
      return setTimeout(() => setCurrentStage(i), (i - currentStage) * 3000);
    });
    return () => timers.forEach(t => t && clearTimeout(t));
  }, [isSubmitted]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Valid email required';
    if (!/^\+?[\d\s-]{7,15}$/.test(formData.phone)) errs.phone = 'Valid phone required';
    if (!formData.eventType) errs.eventType = 'Select an event type';
    if (!formData.eventDate) errs.eventDate = 'Select a date';
    if (!formData.eventLocation.trim()) errs.eventLocation = 'Location is required';
    if (!formData.expectedGuests || formData.expectedGuests < 1) errs.expectedGuests = 'Enter guest count';
    if (!formData.budgetRange) errs.budgetRange = 'Select a budget range';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const id = 'EG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      setBookingId(id);
      setIsSubmitted(true);
      setIsLoading(false);
      setShowModal(true);
      addToast('Booking submitted successfully!', 'success');
      setTimeout(() => launchConfetti(document.body), 400);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1800);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const estimatedDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  /* ─── RENDER ─── */
  return (
    <>
      {/* ══════ TOAST NOTIFICATIONS ══════ */}
      <div className="bk-toast-container">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>
      {/* ══════ SUCCESS MODAL ══════ */}
      {showModal && (
        <div className="bk-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="bk-modal" onClick={e => e.stopPropagation()}>
            <button className="bk-modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            <div className="bk-modal-icon"><CheckCircle size={48} /></div>
            <h3>Booking Confirmed!</h3>
            <p className="bk-modal-id">Booking ID: <strong>{bookingId}</strong></p>
            <p className="bk-modal-msg">Your event booking has been successfully submitted. Our team will review it and get back to you within 24 hours.</p>
            <button className="btn btn-primary btn-round" onClick={() => setShowModal(false)}>View Status <ArrowRight size={14} /></button>
          </div>
        </div>
      )}

      {/* ══════ HERO ══════ */}
      <section className="bk-hero" ref={heroRef}>
        <div className="bk-hero-bg">
          <div className="bk-blob bk-blob-1" />
          <div className="bk-blob bk-blob-2" />
          <div className="bk-blob bk-blob-3" />
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bk-particle" style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`, animationDuration: `${4 + Math.random() * 6}s`,
              width: `${2 + Math.random() * 4}px`, height: `${2 + Math.random() * 4}px`,
            }} />
          ))}
        </div>
        <div className="bk-hero-content">
          <div className="section-label section-label-light bk-hero-cta">✦ Premium Event Booking</div>
          <h1 className="bk-hero-title">Plan Your Dream<br />Event With Event Genie</h1>
          <p className="bk-hero-sub">From intimate gatherings to grand celebrations — let our AI-powered platform handle every detail while you focus on creating unforgettable memories.</p>
          <button className="btn btn-light btn-round bk-hero-cta" onClick={scrollToForm}>
            {isSubmitted ? 'View Booking Status' : 'Start Booking'} <ArrowRight size={16} />
          </button>
        </div>
        <div className="scroll-cue" onClick={scrollToForm}><span>Scroll</span><ChevronDown size={18} /></div>
      </section>

      {/* ══════ FORM OR STATUS ══════ */}
      <section ref={formRef} className="section section-cream" style={{ paddingTop: '6rem' }}>
        <div className="container">
          {!isSubmitted ? (
            <>
              <div className="section-label bk-reveal">Book Your Event</div>
              <h2 className="bk-reveal" style={{ marginBottom: '1rem', maxWidth: 600 }}>Tell us about your vision.</h2>
              <p className="bk-reveal" style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: 550 }}>Fill in the details below and our team will craft the perfect event experience for you.</p>

              {/* ── Selected Vendor Banner ── */}
              {vendor && (
                <div className="bk-vendor-banner bk-reveal">
                  <div className="bk-vendor-banner-icon">
                    <Sparkles size={22} />
                  </div>
                  <div className="bk-vendor-banner-info">
                    <span className="bk-vendor-banner-label">Selected Vendor</span>
                    <strong className="bk-vendor-banner-name">{vendor.name}</strong>
                    <div className="bk-vendor-banner-meta">
                      <span>{vendor.type}</span>
                      <span className="bk-vendor-banner-dot">·</span>
                      <span>{vendor.category}</span>
                      <span className="bk-vendor-banner-dot">·</span>
                      <span>Starting at {vendor.price}</span>
                      {vendor.rating && (
                        <>
                          <span className="bk-vendor-banner-dot">·</span>
                          <span><Star size={12} fill="var(--accent-gold)" stroke="var(--accent-gold)" /> {vendor.rating}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── No Vendor — Prompt to select ── */}
              {!vendor && (
                <div className="bk-select-vendor-prompt bk-reveal">
                  <div className="bk-select-vendor-left">
                    <div className="bk-select-vendor-icon">
                      <Users size={22} />
                    </div>
                    <div>
                      <strong className="bk-select-vendor-title">No vendor selected yet</strong>
                      <p className="bk-select-vendor-desc">Browse our curated vendors to find the perfect match for your event, or continue without one.</p>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-round" style={{ whiteSpace: 'nowrap' }} onClick={() => navigate('/providers')}>
                    Browse Providers <ArrowRight size={14} />
                  </button>
                </div>
              )}

              <form className="bk-form-card bk-reveal" onSubmit={handleSubmit} noValidate>
                <div className="bk-form-grid">
                  {/* Full Name */}
                  <div className="bk-field">
                    <input name="fullName" value={formData.fullName} onChange={handleChange} className="bk-input" placeholder=" " required />
                    <label className="bk-label">Full Name</label>
                    {errors.fullName && <span className="bk-error">{errors.fullName}</span>}
                  </div>
                  {/* Email */}
                  <div className="bk-field">
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className="bk-input" placeholder=" " required />
                    <label className="bk-label"><Mail size={14} /> Email Address</label>
                    {errors.email && <span className="bk-error">{errors.email}</span>}
                  </div>
                  {/* Phone */}
                  <div className="bk-field">
                    <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="bk-input" placeholder=" " required />
                    <label className="bk-label"><Phone size={14} /> Phone Number</label>
                    {errors.phone && <span className="bk-error">{errors.phone}</span>}
                  </div>
                  {/* Event Type */}
                  <div className="bk-field">
                    <select name="eventType" value={formData.eventType} onChange={handleChange} className="bk-input bk-select" required>
                      <option value="" disabled>Select Event Type</option>
                      {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <label className="bk-label bk-label-select"><Sparkles size={14} /> Event Type</label>
                    {errors.eventType && <span className="bk-error">{errors.eventType}</span>}
                  </div>
                  {/* Date */}
                  <div className="bk-field">
                    <input name="eventDate" type="date" value={formData.eventDate} onChange={handleChange} className="bk-input" placeholder=" " required />
                    <label className="bk-label bk-label-select"><Calendar size={14} /> Event Date</label>
                    {errors.eventDate && <span className="bk-error">{errors.eventDate}</span>}
                  </div>
                  {/* Location */}
                  <div className="bk-field">
                    <input name="eventLocation" value={formData.eventLocation} onChange={handleChange} className="bk-input" placeholder=" " required />
                    <label className="bk-label"><MapPin size={14} /> Event Location</label>
                    {errors.eventLocation && <span className="bk-error">{errors.eventLocation}</span>}
                  </div>
                  {/* Guests */}
                  <div className="bk-field">
                    <input name="expectedGuests" type="number" min="1" value={formData.expectedGuests} onChange={handleChange} className="bk-input" placeholder=" " required />
                    <label className="bk-label"><Users size={14} /> Expected Guests</label>
                    {errors.expectedGuests && <span className="bk-error">{errors.expectedGuests}</span>}
                  </div>
                  {/* Budget */}
                  <div className="bk-field">
                    <select name="budgetRange" value={formData.budgetRange} onChange={handleChange} className="bk-input bk-select" required>
                      <option value="" disabled>Select Budget Range</option>
                      {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <label className="bk-label bk-label-select"><DollarSign size={14} /> Budget Range</label>
                    {errors.budgetRange && <span className="bk-error">{errors.budgetRange}</span>}
                  </div>
                  {/* Theme */}
                  <div className="bk-field bk-field-full">
                    <input name="themePreference" value={formData.themePreference} onChange={handleChange} className="bk-input" placeholder=" " />
                    <label className="bk-label">Theme Preference (e.g., Rustic, Modern, Bohemian)</label>
                  </div>
                  {/* Notes */}
                  <div className="bk-field bk-field-full">
                    <textarea name="notes" value={formData.notes} onChange={handleChange} className="bk-input bk-textarea" placeholder=" " rows={4} />
                    <label className="bk-label"><MessageSquare size={14} /> Special Requirements / Notes</label>
                  </div>
                  {/* Upload */}
                  <div className="bk-field bk-field-full">
                    <label className="bk-upload-area">
                      <Upload size={24} />
                      <span>{formData.inspirationImage ? formData.inspirationImage.name : 'Upload Inspiration Image (optional)'}</span>
                      <input name="inspirationImage" type="file" accept="image/*" onChange={handleChange} hidden />
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-round bk-submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  ) : (
                    <>Submit Booking <Send size={16} /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ══════ BOOKING STATUS DASHBOARD ══════ */
            <>
              <div className="section-label bk-reveal">Booking Status</div>
              <h2 className="bk-reveal" style={{ marginBottom: '0.75rem' }}>Your booking is in progress.</h2>
              <p className="bk-reveal" style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Booking ID: <strong style={{ color: 'var(--accent-gold)' }}>{bookingId}</strong></p>

              {/* Status Cards */}
              <div className="bk-status-grid bk-reveal">
                {STATUS_LIST.map((s, i) => (
                  <div key={s} className={`bk-status-card ${i <= currentStage ? 'active' : ''} ${i === currentStage ? 'current' : ''}`}>
                    <div className="bk-status-icon">{i <= currentStage ? <CheckCircle size={20} /> : <Clock size={20} />}</div>
                    <span className="bk-status-name">{s}</span>
                  </div>
                ))}
              </div>

              {/* Progress Tracker */}
              <div className="bk-progress-section bk-reveal">
                <h3 style={{ marginBottom: '2rem' }}>Event Progress Tracker</h3>
                <div className="bk-progress-bar-wrap">
                  <div className="bk-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="bk-progress-steps">
                  {STAGES.map((stage, i) => (
                    <div key={stage} className={`bk-progress-step ${i <= currentStage ? 'done' : ''} ${i === currentStage ? 'active' : ''}`}>
                      <div className="bk-step-dot">{i + 1}</div>
                      <span className="bk-step-label">{stage}</span>
                    </div>
                  ))}
                </div>
                <p className="bk-progress-pct">{progressPercent}% Complete</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Estimated completion: <strong>{estimatedDate()}</strong></p>
              </div>

              {/* Summary Card */}
              <div className="bk-summary-card bk-reveal">
                <h3 style={{ marginBottom: '1.5rem' }}>Booking Summary</h3>
                <div className="bk-summary-grid">
                  {[
                    { label: 'Event Type', value: formData.eventType, icon: <Sparkles size={16} /> },
                    { label: 'Budget', value: formData.budgetRange, icon: <DollarSign size={16} /> },
                    { label: 'Date', value: formData.eventDate, icon: <Calendar size={16} /> },
                    { label: 'Venue', value: formData.eventLocation, icon: <MapPin size={16} /> },
                    { label: 'Guests', value: formData.expectedGuests, icon: <Users size={16} /> },
                    { label: 'Status', value: STATUS_LIST[currentStage], icon: <CheckCircle size={16} /> },
                    { label: 'Payment', value: 'Pending', icon: <DollarSign size={16} /> },
                  ].map(item => (
                    <div key={item.label} className="bk-summary-item">
                      <div className="bk-summary-icon">{item.icon}</div>
                      <div><span className="bk-summary-label">{item.label}</span><span className="bk-summary-value">{item.value || '—'}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══════ WHY BOOK WITH US ══════ */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-label section-label-light bk-reveal">Why Event Genie</div>
          <h2 className="bk-reveal" style={{ color: 'var(--text-light)', marginBottom: '4rem', maxWidth: 550 }}>Trusted by hundreds of happy clients.</h2>
          <div className="bk-why-grid">
            {WHY_US.map((item, i) => (
              <WhyCard key={i} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      <section className="section section-warm">
        <div className="container">
          <div className="section-label bk-reveal">Client Stories</div>
          <h2 className="bk-reveal" style={{ marginBottom: '3rem', maxWidth: 600 }}>What our clients say.</h2>
          <div className="bk-testimonial-slider bk-reveal">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`bk-testimonial ${i === activeTestimonial ? 'active' : ''}`}>
                <div className="bk-quote-mark">"</div>
                <p className="bk-quote-text">{t.text}</p>
                <div className="bk-quote-author">
                  <strong>{t.name}</strong>
                  <span>{t.event} Event</span>
                </div>
              </div>
            ))}
            <div className="bk-testimonial-dots">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} className={`bk-dot ${i === activeTestimonial ? 'active' : ''}`} onClick={() => setActiveTestimonial(i)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section className="section section-cream">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="section-label bk-reveal">FAQ</div>
          <h2 className="bk-reveal" style={{ marginBottom: '3rem' }}>Frequently asked questions.</h2>
          <div className="bk-faq-list">
            {FAQS.map((faq, i) => (
              <div key={i} className={`bk-faq-item bk-reveal ${activeFaq === i ? 'open' : ''}`} onClick={() => setActiveFaq(activeFaq === i ? -1 : i)}>
                <div className="bk-faq-q">
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className="bk-faq-chevron" />
                </div>
                <div className="bk-faq-a"><p>{faq.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CONTACT SUPPORT ══════ */}
      <section className="section section-dark">
        <div className="container">
          <div className="bk-contact-grid">
            <div className="bk-reveal">
              <div className="section-label section-label-light">Support</div>
              <h2 style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Need help?<br />We're here for you.</h2>
              <div className="bk-contact-info">
                <div className="bk-contact-row"><Mail size={18} /> <span>support@eventgenie.com</span></div>
                <div className="bk-contact-row"><Phone size={18} /> <span>+1 (555) 123-4567</span></div>
                <div className="bk-contact-row"><Clock size={18} /> <span>24/7 Customer Support</span></div>
                <div className="bk-contact-row"><Shield size={18} /> <span>100% Secure & Confidential</span></div>
              </div>
            </div>
            <div className="bk-contact-form-card bk-reveal">
              <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>Quick Message</h4>
              <input className="input-field input-field-dark" placeholder="Your Name" style={{ marginBottom: '1rem' }} />
              <input className="input-field input-field-dark" placeholder="Your Email" style={{ marginBottom: '1rem' }} />
              <textarea className="input-field input-field-dark" placeholder="How can we help?" rows={4} style={{ marginBottom: '1.5rem', resize: 'vertical' }} />
              <button className="btn btn-light btn-round">Send Message <Send size={14} /></button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

/* ─── Animated Why Card Sub-component ─── */
const WhyCard = ({ item }) => {
  const { count, ref } = useAnimatedCounter(item.num, 1500);
  const isNumeric = /^\d+/.test(item.num);
  const suffix = item.num.replace(/[\d,]/g, '');
  return (
    <div ref={ref} className="bk-why-card bk-reveal">
      <div className="bk-why-icon">{item.icon}</div>
      <div className="bk-why-num">{isNumeric ? `${count}${suffix}` : item.num}</div>
      <h4 className="bk-why-label">{item.label}</h4>
      <p className="bk-why-desc">{item.desc}</p>
    </div>
  );
};

export default BookingPage;
