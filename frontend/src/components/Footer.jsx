import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col brand">
          <h4>Cinemark</h4>
          <p>Get the most out of every visit. Cinemas, classics are on Cinemark.</p>
          <p>Foundation</p>
          <p>News</p>
        </div>
        <div className="footer-col">
          <h4>Movies</h4>
          <a href="#">Cinemark tickets</a>
          <a href="#">Cinemas</a>
          <a href="#">Offers</a>
          <a href="#">News</a>
        </div>
        <div className="footer-col">
          <h4>Profile</h4>
          <a href="#">Cinemark tickets</a>
          <a href="#">Offers</a>
          <a href="#">News</a>
        </div>
        <div className="footer-col newsletter">
          <h4>Newsletter</h4>
          <p>Receive our latest news, enter your email, letter and newsletter to join newsletter</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter email" />
            <button>Sign up</button>
          </div>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Copyright © 2022 Cinemark Pro</p>
        <div className="footer-bottom-links">
          <a href="#">Expats / beta</a>
        </div>
      </div>
    </footer>
  )
}
