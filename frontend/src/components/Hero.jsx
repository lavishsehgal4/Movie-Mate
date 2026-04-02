import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <div className="hero-badge">Now Showing</div>
        <h1 className="hero-title">
          Your City.<br />
          Your Movies.<br />
          <span>Book Instantly.</span>
        </h1>
        <p className="hero-desc">
          Discover the latest blockbusters, indie gems, and live events near you.
          Skip the queue — book your seats in seconds.
        </p>
        <div className="hero-actions">
          <button className="hero-btn-primary">Explore Movies</button>
          <button className="hero-btn-secondary">
            <span className="play-icon">▶</span> Watch Trailer
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat"><span className="stat-num">500+</span><span className="stat-label">Movies</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-num">200+</span><span className="stat-label">Theatres</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Cities</span></div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="poster-stack">
          <div className="poster p1">
            <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop" alt="" />
          </div>
          <div className="poster p2">
            <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&h=300&fit=crop" alt="" />
          </div>
          <div className="poster p3">
            <img src="https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=200&h=300&fit=crop" alt="" />
          </div>
        </div>
      </div>
    </section>
  )
}
