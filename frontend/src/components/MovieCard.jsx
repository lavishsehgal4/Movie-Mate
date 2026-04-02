import './MovieCard.css'

export default function MovieCard({ movie, variant = 'default' }) {
  return (
    <div className="movie-card">
      <div className="movie-poster">
        <img src={movie.img} alt={movie.title} loading="lazy" />
        <div className="movie-overlay">
          <button className="book-btn">Book Now</button>
        </div>
        {variant === 'coming' && (
          <div className="release-badge">{movie.releaseDate}</div>
        )}
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="genre-tag">{movie.genre}</span>
          <span className="lang-tag">{movie.lang}</span>
        </div>
        {variant !== 'coming' && (
          <div className="movie-rating">
            <span className="star">★</span>
            <span className="rating-val">{movie.rating}</span>
            <span className="votes">({movie.votes} votes)</span>
          </div>
        )}
      </div>
    </div>
  )
}
