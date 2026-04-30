import { useState } from 'react'
import { movies } from '../data/movies'
import './MoviesSection.css'

export default function MoviesSection() {
  const [search, setSearch] = useState('')

  const filtered = movies.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section className="movies-section">
      <div className="movies-inner">
        {/* Header */}
        <div className="movies-header">
          <div className="movies-title-wrap">
            <div className="title-accent" />
            <h2 className="movies-title">Movies in Your City</h2>
          </div>
          <div className="movies-controls">
            <div className="search-bar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A0A7B5" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search for movies, cinemas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="upcoming-btn">Upcoming Movies</button>
          </div>
        </div>

        {/* Grid */}
        <div className="movies-grid">
          {filtered.map(movie => (
            <div className="movie-card" key={movie.id}>
              <div className="card-poster">
                <img src={movie.img} alt={movie.title} loading="lazy" />
                <div className="card-overlay">
                  <button className="card-book-btn">Book Now</button>
                </div>
                <div className="card-rating">
                  <span className="star">★</span> {movie.rating}
                </div>
              </div>
              <div className="card-info">
                <h3 className="card-title">{movie.title}</h3>
                <span className="card-genre">{movie.genre}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
