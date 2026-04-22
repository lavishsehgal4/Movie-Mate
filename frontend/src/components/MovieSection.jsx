import MovieCard from './MovieCard'
import './MovieSection.css'

export default function MovieSection({ title, movies, variant }) {
  return (
    <section className="msection">
      <div className="msection-inner">
        <div className="msection-header">
          <h2 className="msection-title">{title}</h2>
          <div className="msection-arrows">
            <button aria-label="Previous">&#8249;</button>
            <button aria-label="Next">&#8250;</button>
          </div>
        </div>
        <div className="msection-row">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} variant={variant} />
          ))}
        </div>
      </div>
    </section>
  )
}
