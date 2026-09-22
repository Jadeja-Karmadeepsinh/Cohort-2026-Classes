import { useEffect, useMemo, useState } from 'react'
import './App.css'
import JokeCard, { type Joke } from './components/JokeCard'

const API_URL = 'https://api.freeapi.app/api/v1/public/randomjokes'

type ApiResponse = {
  statusCode: number
  data: {
    page: number
    limit: number
    totalPages: number
    previousPage: boolean
    nextPage: boolean
    totalItems: number
    currentPageItems: number
    data: Joke[]
  }
  message: string
  success: boolean
}

function App() {
  const [jokes, setJokes] = useState<Joke[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('joke-favorites')

      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [surpriseJoke, setSurpriseJoke] = useState<Joke | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadJokes() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_URL}?page=${page}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const result: ApiResponse = await response.json()

        setJokes(result.data.data)
        setTotalPages(result.data.totalPages)
        setTotalItems(result.data.totalItems)
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return
        }

        setError(
          'The comedy club is having a technical problem. Please try again.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadJokes()

    return () => {
      controller.abort()
    }
  }, [page, reloadKey])

  useEffect(() => {
    localStorage.setItem(
      'joke-favorites',
      JSON.stringify(favorites),
    )
  }, [favorites])

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>()

    jokes.forEach((joke) => {
      joke.categories.forEach((item) => {
        if (item.trim()) {
          uniqueCategories.add(item)
        }
      })
    })

    return ['All', ...Array.from(uniqueCategories)]
  }, [jokes])

  const filteredJokes = useMemo(() => {
    const query = search.trim().toLowerCase()

    return jokes.filter((joke) => {
      const matchesCategory =
        category === 'All' ||
        joke.categories.includes(category)

      if (!matchesCategory) {
        return false
      }

      if (!query) {
        return true
      }

      const searchableText = `
        ${joke.content}
        ${joke.categories.join(' ')}
        ${joke.id}
      `.toLowerCase()

      return searchableText.includes(query)
    })
  }, [jokes, search, category])

  const favoriteCountOnPage = jokes.filter((joke) =>
    favorites.includes(joke.id),
  ).length

  function toggleFavorite(id: number) {
    setFavorites((current) => {
      if (current.includes(id)) {
        return current.filter((favoriteId) => favoriteId !== id)
      }

      return [...current, id]
    })
  }

  function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) {
      return
    }

    setPage(nextPage)
    setSearch('')
    setCategory('All')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function surpriseMe() {
    if (jokes.length === 0) {
      return
    }

    const randomIndex = Math.floor(Math.random() * jokes.length)

    setSurpriseJoke(jokes[randomIndex])
  }

  function closeSurprise() {
    setSurpriseJoke(null)
  }

  function retryRequest() {
    setReloadKey((current) => current + 1)
  }

  return (
    <div className="app-shell">

      <div className="ambient-glow ambient-glow-one" />
      <div className="ambient-glow ambient-glow-two" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <span>✦</span>
          </div>

          <div>
            <div className="brand-name">THE LAUGH ROOM</div>
            <div className="brand-subtitle">
              RANDOM JOKES · NO FILTERS
            </div>
          </div>
        </div>

        <div className="topbar-status">
          <span className="live-dot" />
          LIVE COMEDY FEED
        </div>
      </header>

      <main className="main-content">

        <section className="hero">

          <div className="hero-copy">

            <div className="eyebrow">
              <span className="eyebrow-line" />
              TONIGHT'S MATERIAL
              <span className="eyebrow-line" />
            </div>

            <h1>
              Your daily dose of
              <span> questionable humor.</span>
            </h1>

            <p className="hero-description">
              Grab a seat. Scroll through the room. Find something
              stupid enough to make you laugh.
            </p>

            <div className="hero-actions">

              <button
                className="primary-button"
                onClick={surpriseMe}
                disabled={jokes.length === 0}
              >
                <span className="button-icon">✦</span>
                Surprise me
              </button>

              <div className="hero-note">
                <span>↳</span>
                {totalItems.toLocaleString()} jokes in the room
              </div>

            </div>

          </div>

          <div className="hero-ticket">

            <div className="ticket-top">
              <span>LAUGH PASS</span>
              <span>NO. {String(page).padStart(3, '0')}</span>
            </div>

            <div className="ticket-main">
              <span className="ticket-number">
                {String(jokes.length).padStart(2, '0')}
              </span>

              <div>
                <strong>FRESH JOKES</strong>
                <small>ON THIS PAGE</small>
              </div>
            </div>

            <div className="ticket-divider">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="ticket-bottom">
              <span>
                PAGE {page} / {totalPages}
              </span>

              <span>
                ♥ {favoriteCountOnPage}
              </span>
            </div>

          </div>

        </section>

        <section className="control-panel">

          <div className="search-wrapper">

            <span className="search-icon">⌕</span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search jokes on this page..."
              aria-label="Search jokes"
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

          <div className="category-area">

            <span className="filter-label">
              FILTER
            </span>

            <div className="category-list">

              {categories.map((item) => (
                <button
                  key={item}
                  className={`category-button ${
                    category === item ? 'active' : ''
                  }`}
                  onClick={() => setCategory(item)}
                >
                  {item === 'All' ? 'Everything' : item}
                </button>
              ))}

            </div>

          </div>

        </section>

        <section className="section-heading">

          <div>
            <div className="section-kicker">
              THE MAIN STAGE
            </div>

            <h2>
              {search || category !== 'All'
                ? 'Your filtered lineup'
                : 'Tonight’s lineup'}
            </h2>
          </div>

          <div className="result-count">
            <strong>{filteredJokes.length}</strong>
            <span>SHOWING</span>
          </div>

        </section>

        {loading && (
          <section className="joke-grid">

            {Array.from({ length: 10 }).map((_, index) => (
              <div
                className="joke-skeleton"
                key={index}
              >
                <div className="skeleton-top">
                  <span />
                  <span />
                </div>

                <div className="skeleton-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="skeleton-bottom">
                  <span />
                  <span />
                </div>
              </div>
            ))}

          </section>
        )}

        {!loading && error && (
          <section className="error-state">

            <div className="error-icon">☹</div>

            <div>
              <div className="section-kicker">
                TECHNICAL DIFFICULTIES
              </div>

              <h2>The punchline never arrived.</h2>

              <p>{error}</p>

              <button
                className="primary-button"
                onClick={retryRequest}
              >
                Try again
              </button>
            </div>

          </section>
        )}

        {!loading &&
          !error &&
          filteredJokes.length > 0 && (
            <section className="joke-grid">

              {filteredJokes.map((joke, index) => (
                <JokeCard
                  key={joke.id}
                  joke={joke}
                  index={index}
                  isFavorite={favorites.includes(joke.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}

            </section>
          )}

        {!loading &&
          !error &&
          filteredJokes.length === 0 && (
            <section className="empty-state">

              <div className="empty-face">
                ¯\_(ツ)_/¯
              </div>

              <div>
                <div className="section-kicker">
                  CRICKETS...
                </div>

                <h2>No jokes found.</h2>

                <p>
                  Nothing matched your search. Even the comedian
                  backstage is confused.
                </p>

                <button
                  className="secondary-button"
                  onClick={() => {
                    setSearch('')
                    setCategory('All')
                  }}
                >
                  Reset filters
                </button>
              </div>

            </section>
          )}

        <section className="pagination-section">

          <div className="pagination-copy">
            <span className="section-kicker">
              KEEP SCROLLING
            </span>

            <p>
              Page <strong>{page}</strong> of{' '}
              <strong>{totalPages}</strong>
            </p>
          </div>

          <div className="pagination-controls">

            <button
              className="pagination-button"
              disabled={page === 1 || loading}
              onClick={() => handlePageChange(page - 1)}
            >
              <span>←</span>
              Previous
            </button>

            <div className="page-display">
              <span>{String(page).padStart(2, '0')}</span>
              <small>/ {String(totalPages).padStart(2, '0')}</small>
            </div>

            <button
              className="pagination-button next"
              disabled={page === totalPages || loading}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
              <span>→</span>
            </button>

          </div>

        </section>

      </main>

      <footer className="footer">

        <div className="footer-brand">
          <span>THE LAUGH ROOM</span>
          <small>BUILT FOR BAD JOKES & GOOD MOODS</small>
        </div>

        <div className="footer-center">
          <span className="footer-dot" />
          API CONNECTED
        </div>

        <div className="footer-meta">
          <span>PAGE {page}</span>
          <span>•</span>
          <span>{totalItems.toLocaleString()} JOKES</span>
        </div>

      </footer>

      {surpriseJoke && (
        <div
          className="surprise-overlay"
          onClick={closeSurprise}
        >
          <div
            className="surprise-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={closeSurprise}
              aria-label="Close"
            >
              ×
            </button>

            <div className="modal-stamp">
              RANDOM PICK
            </div>

            <div className="modal-number">
              #{String(surpriseJoke.id).padStart(4, '0')}
            </div>

            <div className="modal-category">
              {surpriseJoke.categories.length > 0
                ? surpriseJoke.categories.map((item) => (
                    <span key={item}>{item}</span>
                  ))
                : 'GENERAL'}
            </div>

            <blockquote>
              “{surpriseJoke.content}”
            </blockquote>

            <div className="modal-footer">
              <span>
                ✦ Selected from this page
              </span>

              <button
                className="secondary-button"
                onClick={() =>
                  toggleFavorite(surpriseJoke.id)
                }
              >
                {favorites.includes(surpriseJoke.id)
                  ? '♥ Saved'
                  : '♡ Save joke'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default App