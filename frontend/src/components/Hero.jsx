import { useState } from 'react'
import Navbar from './Navbar'
import { heroSlides } from '../data/movies'
import './Hero.css'

export default function Hero() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(i => (i === 0 ? heroSlides.length - 1 : i - 1))
  const next = () => setCurrent(i => (i === heroSlides.length - 1 ? 0 : i + 1))

  const slide = heroSlides[current]

  return (
    <section className="hero">
      {/* blurred bg image — contained inside hero via overflow:hidden */}
      <div
        className="hero-bg-img"
        style={{ backgroundImage: `url(${slide.bg})` }}
      />

      {/* overlays */}
      <div className="hero-dark" />
      <div className="hero-gradient" />

      {/* navbar inside hero, no gap */}
      <Navbar />

      {/* text content — left aligned */}
      <div className="hero-body">
        <div className="hero-content">
          <p className="hero-tag">Now Showing</p>
          <h1 className="hero-title">
            Where stories<br />
            <span>come alive.</span><br />
            Feel every moment.
          </h1>
          <p className="hero-sub">
            Discover the latest movies, book tickets and
            experience cinema like never before.
          </p>
          <div className="hero-btns">
            <button className="btn-primary">Book Tickets</button>
            <button className="btn-outline">
              <span className="play-icon">▶</span> Watch Trailer
            </button>
          </div>
        </div>
      </div>

      {/* arrows */}
      <button className="arrow arrow-left" onClick={prev} aria-label="Previous">&#8249;</button>
      <button className="arrow arrow-right" onClick={next} aria-label="Next">&#8250;</button>

      {/* dots */}
      <div className="hero-dots">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
