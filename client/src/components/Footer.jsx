import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const footerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!footerRef.current) return;
    const els = footerRef.current.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(el => obs.observe(el));
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer" ref={footerRef}>
      <div className="container">
        <div className="footer-grid reveal">
          <div>
            <div className="footer-brand">EVENT GENIE</div>
            <p className="footer-desc">
              AI-powered event planning platform with smart chatbot, intelligent budget allocation, and live AR decoration preview.
            </p>
          </div>
          <div>
            <h4 className="footer-heading">Platform</h4>
            <span className="footer-link" onClick={() => scrollTo('ai-chat')}>AI Planner</span>
            <span className="footer-link" onClick={() => scrollTo('budget')}>Budget Tool</span>
            <span className="footer-link" onClick={() => scrollTo('ar-preview')}>AR Preview</span>
            <span className="footer-link" onClick={() => scrollTo('providers')}>Service Providers</span>
          </div>
          <div>
            <h4 className="footer-heading">Events</h4>
            <span className="footer-link" onClick={() => navigate('/providers/wedding')}>Weddings</span>
            <span className="footer-link" onClick={() => navigate('/providers/corporate')}>Corporate</span>
            <span className="footer-link" onClick={() => navigate('/providers/birthday')}>Birthdays</span>
            <span className="footer-link" onClick={() => navigate('/providers/party')}>Parties</span>
          </div>
          <div>
            <h4 className="footer-heading">Company</h4>
            <span className="footer-link" onClick={() => scrollTo('about')}>About Us</span>
            <span className="footer-link">Contact</span>
            <span className="footer-link">Privacy Policy</span>
            <span className="footer-link">Terms of Service</span>
          </div>
        </div>
        <div className="footer-bottom reveal">
          <p>© 2026 Event Genie. All rights reserved.</p>
          <p>Crafted with AI & Augmented Reality</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
