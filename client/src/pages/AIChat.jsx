import gsap from 'gsap';
import { Bot, Box, Send, Sparkles, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Decoration presets matched by keywords
const DECORATION_MAP = [
  { keywords: ['flower', 'floral', 'rose', 'bouquet', 'centerpiece', 'petal'], image: '/decorations/flower_centerpiece.png', label: 'Flower Centerpiece' },
  { keywords: ['balloon', 'arch', 'party', 'birthday', 'celebration'], image: '/decorations/balloon_arch.png', label: 'Balloon Arch' },
  { keywords: ['light', 'fairy', 'string', 'glow', 'candle', 'lantern', 'lamp'], image: '/decorations/fairy_lights.png', label: 'Fairy Lights' },
  { keywords: ['stage', 'backdrop', 'curtain', 'drape', 'wedding', 'mandap', 'altar'], image: '/decorations/stage_backdrop.png', label: 'Stage Backdrop' },
];

function findDecorationMatch(text) {
  const lower = text.toLowerCase();
  const matches = [];
  for (const dec of DECORATION_MAP) {
    if (dec.keywords.some(k => lower.includes(k))) {
      matches.push(dec);
    }
  }
  return matches.slice(0, 2);
}

const AIChat = ({ onTryInAR }) => {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am your Event Genie Assistant. Ask me about decoration ideas — I can suggest themes and you can preview them live in AR!', decorations: [] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sectionRef = useRef(null);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    // Reveal header elements
    const revealEls = sectionRef.current.querySelectorAll('.reveal');
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 120);
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObs.observe(el));

    // Chat panel entrance
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.fromTo(sectionRef.current?.querySelector('.chat-panel'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(sectionRef.current);
    return () => { observer.disconnect(); revealObs.disconnect(); };
  }, []);

  // Scroll only inside the chat container, not the whole page
  useEffect(() => {
    const container = chatMessagesRef.current;
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage, decorations: [] }]);
    setInput('');
    setLoading(true);

    let responseText = '';
    try {
      console.log('📤 Sending message to backend:', userMessage);
      
      const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      
      if (response.ok && data.reply) {
        console.log('✅ Received AI response from backend:', data.reply);
        responseText = data.reply;
      } else {
        console.error('❌ Unexpected backend response:', data);
        responseText = data.error || data.reply || "Sorry, I couldn't generate a response. Please try again.";
      }
    } catch (error) {
      console.error('❌ Chat API error:', error);
      responseText = "Sorry, I couldn't connect to the AI service. Please check if the backend is running.";
    }

    const decorations = findDecorationMatch(responseText + ' ' + userMessage);
    setMessages(prev => [...prev, { role: 'model', text: responseText, decorations }]);
    setLoading(false);
  };

  const getMockResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('wedding')) {
      return "For a stunning wedding, I recommend:\n\n**Floral Centerpieces** — Elegant rose and peony arrangements for each table with eucalyptus accents.\n\n**Stage Backdrop** — A draped fabric backdrop with cascading flowers and warm fairy lights creating a romantic atmosphere.\n\n**Fairy String Lights** — Warm LED lights draped overhead for a magical canopy effect.\n\nWant to preview any of these in your venue using AR?";
    } else if (q.includes('birthday') || q.includes('party')) {
      return "Here are some amazing birthday decoration ideas:\n\n**Balloon Arch** — A stunning arch with pastel pink, gold, and white balloons at the entrance.\n\n**Fairy Lights** — Warm string lights around the party area for a cozy glow.\n\n**Flower Centerpieces** — Fresh flower arrangements on each table.\n\nYou can preview these decorations live in your space using our AR feature!";
    } else if (q.includes('corporate') || q.includes('conference')) {
      return "For a professional corporate event:\n\n**Stage Backdrop** — Clean, elegant backdrop with company branding and subtle lighting.\n\n**Floral Arrangements** — Minimalist flower centerpieces for networking tables.\n\n**Ambient Lighting** — Warm fairy lights for breakout areas to create a welcoming atmosphere.\n\nTry previewing these in AR to see how they fit your venue!";
    } else if (q.includes('decoration') || q.includes('decor') || q.includes('theme') || q.includes('idea')) {
      return "I'd love to help with decoration ideas! Here are some popular options:\n\n**Flower Centerpieces** — Beautiful floral arrangements that suit any event.\n\n**Balloon Arches** — Perfect for entrances and photo spots.\n\n**Fairy Lights** — Create a magical ambiance with warm string lights.\n\n**Stage Backdrops** — Elegant draped backdrops for the main area.\n\nClick 'Try in AR' on any suggestion to see it live in your venue!";
    }
    return "I can help you plan the perfect event! Try asking me about:\n\n• **Wedding decorations** — floral themes, backdrops, lighting\n• **Birthday party** — balloon arches, table setups\n• **Corporate events** — stage design, professional decor\n\nJust describe your event and I'll suggest decorations you can preview in AR!";
  };

  return (
    <section id="ai-chat" className="section section-cream" ref={sectionRef}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-label reveal" style={{ justifyContent: 'center' }}>AI Planner</div>
          <h2 className="reveal">Your Intelligent<br />Event Copilot</h2>
          <p className="reveal" style={{ color: 'var(--text-muted)', marginTop: '1rem', maxWidth: '500px', margin: '1rem auto 0' }}>
            Ask for decoration ideas — then preview them live in AR.
          </p>
        </div>

        <div className="chat-panel" style={{ background: 'var(--bg-dark)', borderColor: 'var(--border-dark)' }}>
          {/* Header */}
          <div className="chat-header" style={{ background: 'var(--bg-dark-soft)', borderColor: 'var(--border-dark)' }}>
            <div className="chat-header-icon" style={{ background: 'var(--accent-gold)' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-serif)', marginBottom: '0.1rem', color: 'var(--text-light)' }}>Event Copilot</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-light)' }}>Powered by Gemini AI</p>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages" ref={chatMessagesRef} style={{ background: 'var(--bg-dark)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: msg.role === 'user' ? 'var(--bg-dark)' : 'var(--accent-gold)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {msg.role === 'user' ? <User size={15} color="#f5f0e8" /> : <Bot size={15} color="#fff" />}
                  </div>
                  <div className={msg.role === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-bot'} style={msg.role === 'model' ? { background: 'var(--bg-dark-soft)', border: '1px solid var(--border-dark)', color: 'var(--text-light)' } : {}}>
                    <p>{msg.text}</p>

                    {msg.decorations && msg.decorations.length > 0 && (
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {msg.decorations.map((dec, di) => (
                          <div key={di} className="chat-deco-card">
                            <img src={dec.image} alt={dec.label} />
                            <div className="deco-info">
                              <p className="deco-label">{dec.label}</p>
                              <button onClick={() => onTryInAR && onTryInAR(dec.image)} className="chat-deco-btn">
                                <Box size={11} /> Try in AR
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={15} color="#fff" />
                </div>
                <div className="chat-bubble chat-bubble-bot" style={{ background: 'var(--bg-dark-soft)', border: '1px solid var(--border-dark)', color: 'var(--text-light)' }}>
                  <span style={{ color: 'var(--text-muted-light)' }}>Thinking...</span>
                </div>
              </div>
            )}

          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="chat-input-bar" style={{ background: 'var(--bg-dark-soft)', borderColor: 'var(--border-dark)' }}>
            <input
              type="text"
              className="input-field input-field-dark"
              placeholder="Ask about wedding decorations, birthday themes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" style={{ background: 'var(--accent-gold)' }} disabled={loading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AIChat;
