import { Activity, Calculator, PieChart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const BudgetPlanner = () => {
  const [formData, setFormData] = useState({ budget: 5000, eventType: 'Wedding', guestCount: 50 });
  const [currency, setCurrency] = useState('INR'); // 'USD' or 'INR' — default to INR per request
  // Simple fixed exchange rate for now (1 USD = 82 INR). Could be replaced with live rates later.
  const EXCHANGE_RATE_USD_TO_INR = 82;
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Remove entrance/disappearing animation to keep results stable.
  useEffect(() => {
    // Ensure container is visible immediately; no GSAP animation here.
    if (containerRef.current) {
      containerRef.current.style.opacity = 1;
      containerRef.current.style.transform = 'none';
    }
  }, []);

  const formatCurrency = (value, curr) => {
    const v = Number(value) || 0;
    const opts = { style: 'currency', currency: curr === 'USD' ? 'USD' : 'INR', maximumFractionDigits: 0 };
    return new Intl.NumberFormat(curr === 'USD' ? 'en-US' : 'en-IN', opts).format(v);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Convert incoming budget to USD for internal calculations
      const budgetNumeric = Number(formData.budget) || 0;
      const budgetInUSD = currency === 'USD' ? budgetNumeric : budgetNumeric / EXCHANGE_RATE_USD_TO_INR;

      const items = [
        { category: "Venue & Catering", percentage: 40, allocatedAmountUSD: budgetInUSD * 0.40, tips: "Book a restaurant that waives venue fee if you meet F&B minimum." },
        { category: "Photography", percentage: 15, allocatedAmountUSD: budgetInUSD * 0.15, tips: "Hire a talented student or associate photographer." },
        { category: "Decor & Lighting", percentage: 15, allocatedAmountUSD: budgetInUSD * 0.15, tips: "Repurpose ceremonial flowers for the reception." },
        { category: "Entertainment", percentage: 10, allocatedAmountUSD: budgetInUSD * 0.10, tips: "A Spotify playlist with good rented speakers saves money." },
        { category: "Favors & Misc", percentage: 10, allocatedAmountUSD: budgetInUSD * 0.10, tips: "Digital invitations are free and eco-friendly." },
        { category: "Emergency Fund", percentage: 10, allocatedAmountUSD: budgetInUSD * 0.10, tips: "Always keep a 10% buffer for sudden hidden costs." }
      ];

      setBreakdown(items);
      setLoading(false);
    }, 900);
  };

  return (
    <section id="budget" className="section section-dark">
      <div className="container">

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-label section-label-light" style={{ justifyContent: 'center' }}>Budget</div>
          <h2 style={{ color: 'var(--text-light)' }}>Smart Budget<br />Planner</h2>
          <p style={{ color: 'var(--text-muted-light)', marginTop: '1rem', maxWidth: '500px', margin: '1rem auto 0' }}>
            AI-powered budget allocation that optimizes every {currency === 'USD' ? 'dollar' : 'rupee'} of your event spend.
          </p>
        </div>

        <div ref={containerRef} className="budget-grid">

          {/* Input */}
          <div className="card card-dark">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ width: 48, height: 48, background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Calculator size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-light)' }}>AI Allocator</h3>
            </div>

            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <label style={{ color: 'var(--text-muted-light)', fontSize: '0.85rem', fontWeight: 600 }}>Currency</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className={`currency-btn ${currency === 'USD' ? 'active' : ''}`} onClick={() => setCurrency('USD')}>USD</button>
                  <button type="button" className={`currency-btn ${currency === 'INR' ? 'active' : ''}`} onClick={() => setCurrency('INR')}>INR</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted-light)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Budget ({currency === 'USD' ? '$' : '₹'})
                </label>
                <input
                  type="number"
                  className="input-field input-field-dark"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted-light)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Type</label>
                <select className="input-field input-field-dark" value={formData.eventType} onChange={(e) => setFormData({...formData, eventType: e.target.value})}>
                  <option>Wedding</option>
                  <option>Corporate Party</option>
                  <option>Birthday</option>
                  <option>Concert/Show</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted-light)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guest Count</label>
                <input
                  type="number"
                  className="input-field input-field-dark"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({...formData, guestCount: Number(e.target.value)})}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                {loading ? 'Analyzing...' : 'Generate Budget Plan'}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="card card-dark" style={{ minHeight: '460px' }}>
            {!breakdown && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', color: 'var(--text-muted-light)' }}>
                <PieChart size={56} color="rgba(245,240,232,0.1)" style={{ marginBottom: '1rem' }} />
                <p>Enter your details to generate a smart budget breakdown.</p>
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', color: 'var(--accent-gold)' }}>
                <Activity size={40} style={{ animation: 'spin 2s linear infinite' }} />
                <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>AI is crunching the numbers...</p>
              </div>
            )}

            {breakdown && !loading && (
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-dark)', color: 'var(--text-light)' }}>
                  Recommended Allocation
                </h3>
                <div>
                  {breakdown.map((item, idx) => {
                    const usd = item.allocatedAmountUSD;
                    const inr = usd * EXCHANGE_RATE_USD_TO_INR;
                    const primaryCurr = currency === 'USD' ? 'USD' : 'INR';
                    const primaryValue = primaryCurr === 'USD' ? usd : inr;
                    const secondaryCurr = primaryCurr === 'USD' ? 'INR' : 'USD';
                    const secondaryValue = primaryCurr === 'USD' ? inr : usd;

                    return (
                      <div key={idx} className="budget-result-item" style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid var(--border-dark)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'baseline' }}>
                          <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>{item.category}</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-light)', fontSize: '1.02rem' }}>{formatCurrency(primaryValue, primaryCurr)}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted-light)' }}>{formatCurrency(secondaryValue, secondaryCurr)}</div>
                          </div>
                        </div>
                        <div className="budget-bar" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="budget-bar-fill" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted-light)' }}>Tip: {item.tips}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetPlanner;
