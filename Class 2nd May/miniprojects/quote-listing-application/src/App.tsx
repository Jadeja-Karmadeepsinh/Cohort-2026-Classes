import { useEffect, useMemo, useState } from 'react'
import './App.css'
import QuoteCard, { type Quote } from './components/QuoteCard'

const API_URL =
  'https://api.freeapi.app/api/v1/public/quotes'

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
    data: Quote[]
  }
  message: string
  success: boolean
}

function App() {
  const [quotes, setQuotes] = useState<Quote[]>([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('All')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [reloadKey, setReloadKey] = useState(0)

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('quote-favorites')

      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [randomQuote, setRandomQuote] =
    useState<Quote | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadQuotes() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_URL}?page=${page}`,
          {
            signal: controller.signal,
          },
        )

        if (!response.ok) {
          throw new Error(
            `Request failed with status ${response.status}`,
          )
        }

        const result: ApiResponse =
          await response.json()

        setQuotes(result.data.data)
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
          'The archive could not be reached. Please try again.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadQuotes()

    return () => {
      controller.abort()
    }
  }, [page, reloadKey])

  useEffect(() => {
    localStorage.setItem(
      'quote-favorites',
      JSON.stringify(favorites),
    )
  }, [favorites])

  const tags = useMemo(() => {
    const tagSet = new Set<string>()

    quotes.forEach((quote) => {
      quote.tags.forEach((tag) => {
        if (tag.trim()) {
          tagSet.add(tag)
        }
      })
    })

    return ['All', ...Array.from(tagSet)]
  }, [quotes])

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLowerCase()

    return quotes.filter((quote) => {
      const matchesTag =
        selectedTag === 'All' ||
        quote.tags.includes(selectedTag)

      if (!matchesTag) {
        return false
      }

      if (!query) {
        return true
      }

      const searchableText = `
        ${quote.content}
        ${quote.author}
        ${quote.authorSlug}
        ${quote.tags.join(' ')}
        ${quote.id}
      `.toLowerCase()

      return searchableText.includes(query)
    })
  }, [quotes, search, selectedTag])

  const favoriteCountOnPage = quotes.filter(
    (quote) => favorites.includes(quote.id),
  ).length

  const authorCount = useMemo(() => {
    return new Set(
      quotes.map((quote) => quote.author),
    ).size
  }, [quotes])

  function toggleFavorite(id: number) {
    setFavorites((current) => {
      if (current.includes(id)) {
        return current.filter(
          (favoriteId) => favoriteId !== id,
        )
      }

      return [...current, id]
    })
  }

  async function copyQuote(quote: Quote) {
    try {
      await navigator.clipboard.writeText(
        `"${quote.content}" — ${quote.author}`,
      )
    } catch {
      // Clipboard may be unavailable in some browsers.
    }
  }

  function surpriseMe() {
    if (quotes.length === 0) {
      return
    }

    const randomIndex = Math.floor(
      Math.random() * quotes.length,
    )

    setRandomQuote(quotes[randomIndex])
  }

  function handlePageChange(nextPage: number) {
    if (
      nextPage < 1 ||
      nextPage > totalPages
    ) {
      return
    }

    setPage(nextPage)

    setSearch('')
    setSelectedTag('All')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function retryRequest() {
    setReloadKey((current) => current + 1)
  }

  function resetFilters() {
    setSearch('')
    setSelectedTag('All')
  }

  return (
    <div className="archive-app">

      {/* Decorative background */}
      <div className="paper-grain" />

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="site-header">

        <div className="header-inner">

          <div className="brand">

            <div className="brand-emblem">
              <span>Q</span>
            </div>

            <div className="brand-copy">
              <strong>THE QUOTATION</strong>

              <span>
                DIGITAL READING ARCHIVE
              </span>
            </div>

          </div>

          <div className="header-right">

            <div className="archive-status">
              <span className="status-dot" />
              ARCHIVE ONLINE
            </div>

            <div className="header-page">
              VOL. 01 / {String(page).padStart(2, '0')}
            </div>

          </div>

        </div>

      </header>


      <main className="main-content">

        {/* =====================================
            HERO
        ====================================== */}

        <section className="hero">

          <div className="hero-main">

            <div className="hero-label">
              <span />
              A COLLECTION OF THOUGHTS
              <span />
            </div>

            <h1>
              Words worth
              <em> keeping.</em>
            </h1>

            <p className="hero-intro">
              A quiet corner of the internet for ideas,
              observations, and sentences that deserve a
              second read.
            </p>

            <div className="hero-controls">

              <button
                className="random-button"
                onClick={surpriseMe}
                disabled={quotes.length === 0}
              >
                <span className="random-symbol">
                  ✦
                </span>

                Open a random page
              </button>

              <span className="hero-hint">
                You never know what you'll find.
              </span>

            </div>

          </div>


          <aside className="archive-card">

            <div className="archive-card-top">
              <span>THE ARCHIVE</span>

              <span>
                EST. 2023
              </span>
            </div>

            <div className="archive-number">
              {totalItems.toLocaleString()}
            </div>

            <div className="archive-title">
              QUOTATIONS
            </div>

            <div className="archive-rule">
              <span />
              <span />
              <span />
            </div>

            <div className="archive-details">

              <div>
                <small>THIS PAGE</small>
                <strong>
                  {quotes.length}
                </strong>
              </div>

              <div>
                <small>AUTHORS</small>
                <strong>
                  {authorCount}
                </strong>
              </div>

              <div>
                <small>SAVED</small>
                <strong>
                  {favoriteCountOnPage}
                </strong>
              </div>

            </div>

          </aside>

        </section>


        {/* =====================================
            SEARCH + FILTERS
        ====================================== */}

        <section className="toolbar">

          <div className="search-box">

            <span className="search-symbol">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search an author, idea, tag..."
              aria-label="Search quotes"
            />

            {search && (
              <button
                className="clear-button"
                onClick={() =>
                  setSearch('')
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>


          <div className="tag-filter">

            <span className="filter-title">
              EXPLORE BY THEME
            </span>

            <div className="tag-list">

              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`filter-tag ${
                    selectedTag === tag
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() =>
                    setSelectedTag(tag)
                  }
                >
                  {tag === 'All'
                    ? 'All quotes'
                    : tag}
                </button>
              ))}

            </div>

          </div>

        </section>


        {/* =====================================
            SECTION HEADING
        ====================================== */}

        <section className="collection-heading">

          <div>

            <div className="small-label">
              THE COLLECTION
            </div>

            <h2>
              {search ||
              selectedTag !== 'All'
                ? 'Selected passages'
                : 'Today’s reading'}
            </h2>

          </div>

          <div className="collection-meta">

            <div className="meta-line">
              <span>PAGE</span>
              <strong>
                {String(page).padStart(2, '0')}
              </strong>
              <span>
                / {String(totalPages).padStart(2, '0')}
              </span>
            </div>

            <div className="vertical-rule" />

            <div className="meta-line">
              <span>SHOWING</span>
              <strong>
                {filteredQuotes.length}
              </strong>
            </div>

          </div>

        </section>


        {/* =====================================
            LOADING
        ====================================== */}

        {loading && (
          <section className="quote-grid">

            {Array.from({ length: 10 }).map(
              (_, index) => (
                <div
                  className="quote-skeleton"
                  key={index}
                >
                  <div className="skeleton-number" />

                  <div className="skeleton-content">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="skeleton-author">
                    <span />
                    <span />
                  </div>
                </div>
              ),
            )}

          </section>
        )}


        {/* =====================================
            ERROR
        ====================================== */}

        {!loading && error && (
          <section className="state-card">

            <div className="state-symbol">
              —
            </div>

            <div>
              <div className="small-label">
                ARCHIVE ERROR
              </div>

              <h2>
                This page could not be opened.
              </h2>

              <p>{error}</p>

              <button
                className="random-button"
                onClick={retryRequest}
              >
                Try again
              </button>
            </div>

          </section>
        )}


        {/* =====================================
            QUOTES
        ====================================== */}

        {!loading &&
          !error &&
          filteredQuotes.length > 0 && (
            <section className="quote-grid">

              {filteredQuotes.map(
                (quote, index) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    index={index}
                    isFavorite={favorites.includes(
                      quote.id,
                    )}
                    onToggleFavorite={
                      toggleFavorite
                    }
                    onCopy={copyQuote}
                  />
                ),
              )}

            </section>
          )}


        {/* =====================================
            EMPTY
        ====================================== */}

        {!loading &&
          !error &&
          filteredQuotes.length === 0 && (
            <section className="state-card">

              <div className="state-symbol">
                ∅
              </div>

              <div>

                <div className="small-label">
                  NO RESULTS
                </div>

                <h2>
                  Nothing matches your search.
                </h2>

                <p>
                  Try another author, keyword,
                  or theme.
                </p>

                <button
                  className="secondary-button"
                  onClick={resetFilters}
                >
                  Clear filters
                </button>

              </div>

            </section>
          )}


        {/* =====================================
            PAGINATION
        ====================================== */}

        <section className="pagination">

          <div className="pagination-info">

            <span className="small-label">
              CONTINUE READING
            </span>

            <p>
              Archive page{' '}
              <strong>{page}</strong> of{' '}
              <strong>{totalPages}</strong>
            </p>

          </div>


          <div className="pagination-controls">

            <button
              className="page-button"
              disabled={
                page === 1 || loading
              }
              onClick={() =>
                handlePageChange(page - 1)
              }
            >
              <span>←</span>
              Previous
            </button>


            <div className="page-number">

              <strong>
                {String(page).padStart(
                  2,
                  '0',
                )}
              </strong>

              <span>
                / {String(totalPages).padStart(
                  2,
                  '0',
                )}
              </span>

            </div>


            <button
              className="page-button next"
              disabled={
                page === totalPages ||
                loading
              }
              onClick={() =>
                handlePageChange(page + 1)
              }
            >
              Next
              <span>→</span>
            </button>

          </div>

        </section>

      </main>


      {/* =====================================
          FOOTER
      ====================================== */}

      <footer className="site-footer">

        <div className="footer-inner">

          <div className="footer-brand">
            THE QUOTATION
          </div>

          <div className="footer-motto">
            <span>“</span>
            Read slowly. Think deeply.
            <span>”</span>
          </div>

          <div className="footer-stats">
            {totalItems.toLocaleString()} ENTRIES
            <span>·</span>
            {totalPages} PAGES
          </div>

        </div>

      </footer>


      {/* =====================================
          RANDOM QUOTE MODAL
      ====================================== */}

      {randomQuote && (
        <div
          className="quote-modal-overlay"
          onClick={() =>
            setRandomQuote(null)
          }
        >

          <div
            className="quote-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setRandomQuote(null)
              }
              aria-label="Close quote"
            >
              ×
            </button>


            <div className="modal-top">

              <span>
                RANDOMLY SELECTED
              </span>

              <span>
                #{String(randomQuote.id).padStart(
                  4,
                  '0',
                )}
              </span>

            </div>


            <div className="modal-quote-mark">
              “
            </div>


            <blockquote>
              {randomQuote.content}
            </blockquote>


            <div className="modal-author">

              <span className="author-line" />

              <div>
                <strong>
                  {randomQuote.author}
                </strong>

                <small>
                  @{randomQuote.authorSlug}
                </small>
              </div>

            </div>


            <div className="modal-actions">

              <button
                className="modal-action"
                onClick={() =>
                  copyQuote(randomQuote)
                }
              >
                ▣ &nbsp; Copy quote
              </button>

              <button
                className={`modal-action ${
                  favorites.includes(
                    randomQuote.id,
                  )
                    ? 'modal-saved'
                    : ''
                }`}
                onClick={() =>
                  toggleFavorite(
                    randomQuote.id,
                  )
                }
              >
                {favorites.includes(
                  randomQuote.id,
                )
                  ? '♥ Saved'
                  : '♡ Save quote'}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default App