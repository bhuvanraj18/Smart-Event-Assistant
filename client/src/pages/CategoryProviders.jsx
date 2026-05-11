import { ArrowLeft, Search, SlidersHorizontal, Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryMeta, filterTypes, providerData } from '../data/providerData';

const CategoryProviders = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const pageRef = useRef(null);

  const meta = categoryMeta[category];
  const allVendors = useMemo(() => providerData[category] || [], [category]);

  const goHome = () => {
    // Navigate back to the homepage and request scrolling to the providers section.
    navigate('/', { replace: true, state: { scrollTarget: 'providers' } });
  };

  // Filter + search + sort
  const filteredVendors = useMemo(() => {
    let result = [...allVendors];

    // Type filter
    if (activeFilter !== 'All') {
      result = result.filter((v) => v.type === activeFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        result.sort((a, b) => a.priceNum - b.priceNum);
        break;
      case 'price-high':
        result.sort((a, b) => b.priceNum - a.priceNum);
        break;
      case 'popular':
      default:
        result.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return result;
  }, [allVendors, activeFilter, searchQuery, sortBy]);

  // Available filter types for this category
  const availableFilters = useMemo(() => {
    const types = new Set(allVendors.map((v) => v.type));
    return filterTypes.filter((f) => f === 'All' || types.has(f));
  }, [allVendors]);

  // Scroll-reveal
  useEffect(() => {
    if (!pageRef.current) return;
    const els = pageRef.current.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [filteredVendors]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);

  if (!meta) {
    return (
      <div className="provider-page" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <h2>Category not found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          The category you're looking for doesn't exist.
        </p>
        <button type="button" className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={goHome}>
          Back to Providers
        </button>
      </div>
    );
  }

  // AI recommendation - pick top rated vendor
  const topPick = allVendors.reduce((best, v) => (v.rating > (best?.rating || 0) ? v : best), null);

  return (
    <div className="provider-page" ref={pageRef}>
      {/* ─── Hero Banner ─── */}
      <div className="pp-hero">
        <div className="pp-hero-bg">
          <img src={meta.image} alt={meta.name} />
        </div>
        <div className="pp-hero-overlay" />
        <div className="pp-hero-content">
          <button type="button" className="pp-back-btn reveal" onClick={goHome}>
            <ArrowLeft size={16} />
            <span>Back to Providers</span>
          </button>
          <div className="pp-hero-text reveal">
            <span className="pp-hero-icon">{meta.icon}</span>
            <h1 className="pp-hero-title">{meta.name}</h1>
            <p className="pp-hero-subtitle">{meta.subtitle}</p>
            <div className="pp-hero-stats">
              <span>{allVendors.length} Vendors</span>
              <span className="pp-dot">·</span>
              <span>{new Set(allVendors.map((v) => v.type)).size} Categories</span>
              <span className="pp-dot">·</span>
              <span>AI Recommended</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* ─── AI Banner ─── */}
        {topPick && (
          <div className="ai-banner reveal">
            <div className="ai-banner-icon">
              <Sparkles size={18} />
            </div>
            <div className="ai-banner-text">
              <strong>AI Pick:</strong> We recommend <em>{topPick.name}</em> — rated {topPick.rating} stars with{' '}
              {topPick.reviews} reviews. Perfect for your budget!
            </div>
          </div>
        )}

        {/* ─── Toolbar ─── */}
        <div className="pp-toolbar reveal">
          <div className="pp-search">
            <Search size={16} className="pp-search-icon" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pp-search-input"
            />
          </div>
          <div className="pp-sort">
            <SlidersHorizontal size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pp-sort-select"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* ─── Filter Tabs ─── */}
        <div className="filter-tabs reveal">
          {availableFilters.map((type) => (
            <button
              key={type}
              className={`filter-tab ${activeFilter === type ? 'active' : ''}`}
              onClick={() => setActiveFilter(type)}
            >
              {type}
              {type !== 'All' && (
                <span className="filter-tab-count">
                  {allVendors.filter((v) => v.type === type).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Results count ─── */}
        <div className="pp-results-bar reveal">
          <p>
            Showing <strong>{filteredVendors.length}</strong> of {allVendors.length} vendors
            {activeFilter !== 'All' && (
              <span>
                {' '}
                in <em>{activeFilter}</em>
              </span>
            )}
          </p>
        </div>

        {/* ─── Vendor Grid ─── */}
        {filteredVendors.length > 0 ? (
          <div className="vendor-grid">
            {filteredVendors.map((vendor, i) => (
              <div
                key={vendor.id}
                className="vendor-card reveal"
                style={{ '--delay': `${i * 0.06}s` }}
              >
                {/* Vendor image placeholder */}
                <div className="vc-image">
                  <div
                    className="vc-image-gradient"
                    style={{
                      background: `linear-gradient(135deg, 
                        hsl(${(i * 47 + 20) % 360}, 25%, 25%), 
                        hsl(${(i * 47 + 60) % 360}, 30%, 18%))`,
                    }}
                  >
                    <span className="vc-image-letter">{vendor.name.charAt(0)}</span>
                  </div>
                  <div className="vc-type-badge">{vendor.type}</div>
                </div>

                {/* Vendor info */}
                <div className="vc-body">
                  <h3 className="vc-name">{vendor.name}</h3>

                  <div className="vc-rating">
                    <Star size={13} fill="var(--accent-gold)" stroke="var(--accent-gold)" />
                    <span className="vc-rating-num">{vendor.rating}</span>
                    <span className="vc-rating-reviews">({vendor.reviews} reviews)</span>
                  </div>

                  <p className="vc-desc">{vendor.description}</p>

                  <div className="vc-tags">
                    {vendor.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="vendor-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="vc-footer">
                    <div className="vc-price">
                      <span className="vc-price-label">Starting at</span>
                      <span className="vc-price-value">{vendor.price}</span>
                    </div>
                    <button
                      className="vc-book-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/booking', {
                          state: {
                            vendor: {
                              id: vendor.id,
                              name: vendor.name,
                              type: vendor.type,
                              price: vendor.price,
                              rating: vendor.rating,
                              category: meta.name,
                            },
                          },
                        });
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pp-empty">
            <p>No vendors found matching your criteria.</p>
            <button
              className="btn btn-outline"
              onClick={() => {
                setActiveFilter('All');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* ─── Bottom navigation ─── */}
        <div className="pp-bottom-nav reveal">
          <h3>Explore Other Categories</h3>
          <div className="pp-other-categories">
            {Object.entries(categoryMeta)
              .filter(([key]) => key !== category)
              .slice(0, 4)
              .map(([key, m]) => (
                <button
                  key={key}
                  className="pp-other-cat-btn"
                  onClick={() => navigate(`/providers/${key}`)}
                >
                  <span className="pp-other-cat-icon">{m.icon}</span>
                  <span>{m.name}</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProviders;
