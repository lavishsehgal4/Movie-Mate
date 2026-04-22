import './MovieCard.css'

export default function MovieCard({ movie, variant = 'now' }) {
  return (
    <div className="mcard">
      <div className="mcard-poster">
        <img src={movie.img} alt={movie.title} loading="lazy" />
        {variant === 'now' && (
          <div className="mcard-rating">
            <span className="star">★</span> {movie.rating}
          </div>
        )}
        {variant === 'upcoming' && (
          <div className="mcard-release">{movie.releaseLabel}</div>
        )}
      </div>
      <div className="mcard-body">
        <h3 className="mcard-title">{movie.title}</h3>
        <p className="mcard-genre">{movie.genre}</p>
        {variant === 'now' && (
          <button className={`mcard-btn ${movie.id === 1 ? 'primary' : ''}`}>
            Quick Book
          </button>
        )}
        {variant === 'upcoming' && (
          <button className="mcard-btn trailer">Watch Trailer</button>
        )}
      </div>
    </div>
  )
}
