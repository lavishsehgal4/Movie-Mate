import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <span>🎬</span>
            <span className="logo-text">CineBook</span>
          </div>
          <p className="footer-tagline">
            Your go-to destination for booking movies, events, and live shows across India.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="Instagram">📸</a>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Movies</h4>
            <a href="#">Now Showing</a>
            <a href="#">Coming Soon</a>
            <a href="#">Top Rated</a>
            <a href="#">By Language</a>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <a href="#">Events</a>
            <a href="#">Plays & Theatre</a>
            <a href="#">Sports</a>
            <a href="#">Concerts</a>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">FAQs</a>
            <a href="#">Refund Policy</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 CineBook. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
        </div>
      </div>
    </footer>
  )
}
