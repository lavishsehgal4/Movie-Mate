import { useState } from 'react'
import './Hero.css'

const slides = [
  {
    id: 1,
    title: 'GALACTIC GUARDIANS',
    desc: 'A fictional blockbuster film featuring qualified space adventures, finoms aninesors and adventures...',
    img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900&h=400&fit=crop',
  },
  {
    id: 2,
    title: 'NEON LIGHTS',
    desc: 'An electrifying action thriller set in a dystopian city where light is the only weapon...',
    img: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=900&h=400&fit=crop',
  },
  {
    id: 3,
    title: "OCEAN'S GRACE",
    desc: 'A breathtaking underwater adventure that pushes the limits of human endurance...',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&h=400&fit=crop',
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(i => (i === 0 ? slides.length - 1 : i - 1))
  const next = () => setCurrent(i => (i === slides.length - 1 ? 0 : i + 1))

  const slide = slides[current]

  return (
    <div className="hero-wrapper">
      <div className="hero" style={{ backgroundImage: `url(${slide.img})` }}>
        <div className="hero-overlay" />
        <button className="hero-arrow left" onClick={prev} aria-label="Previous">&#8249;</button>
        <div className="hero-content">
          <h1 className="hero-title">{slide.title}</h1>
          <p className="hero-desc">{slide.desc}</p>
          <button className="hero-book-btn">Book Tickets</button>
        </div>
        <button className="hero-arrow right" onClick={next} aria-label="Next">&#8250;</button>
        <div className="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
