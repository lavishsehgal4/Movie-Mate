import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="#" className="footer-logo">Movie<span>Mate</span></a>
          <p className="footer-tagline">Your ultimate destination for booking cinema tickets.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Contact</a>
            <a href="#">Help Center</a>
            <a href="#">Refunds</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 MovieMate. All rights reserved.</p>
      </div>
    </footer>
  )
}
