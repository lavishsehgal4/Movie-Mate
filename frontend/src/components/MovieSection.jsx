import MovieCard from './MovieCard'
import './MovieSection.css'

export default function MovieSection({ title, subtitle, movies, variant }) {
  return (
    <section className="movie-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-sub">{subtitle}</p>}
        </div>
        <a href="#" className="see-all">See All →</a>
      </div>
      <div className="movies-row">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} variant={variant} />
        ))}
      </div>
    </section>
  )
}
