import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import QuoteCard, { type Quote } from './components/QuoteCard'

type SortOption = 'default' | 'shortest' | 'longest' | 'author'

type ApiResponse = {
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
}

const API_URL = 'https://api.freeapi.app/api/v1/public/quotes'

const QUOTES_PER_PHYSICAL_PAGE = 3
const QUOTES_PER_SPREAD = 6

function App() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [bookPage, setBookPage] = useState(1)
  const [totalPages, setTotalPages] = useState(50)
  const [totalItems, setTotalItems] = useState(300)

  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('all')
  const [selectedTag, setSelectedTag] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('quote-book-favorites')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [focusedQuote, setFocusedQuote] = useState<Quote | null>(null)

  const [turning, setTurning] = useState<'next' | 'previous' | null>(
    null,
  )

  const [pageCache, setPageCache] = useState<Record<number, Quote[]>>({})

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    localStorage.setItem(
      'quote-book-favorites',
      JSON.stringify(favorites),
    )
  }, [favorites])

  async function fetchPage(page: number) {
    const response = await fetch(
      `${API_URL}?page=${page}&limit=${QUOTES_PER_SPREAD}`,
    )

    if (!response.ok) {
      throw new Error('Unable to open this page of the book.')
    }

    const result: ApiResponse = await response.json()

    return result.data
  }

  useEffect(() => {
    const controller = new AbortController()

    async function loadInitialPage() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_URL}?page=1&limit=${QUOTES_PER_SPREAD}`,
          {
            signal: controller.signal,
          },
        )

        if (!response.ok) {
          throw new Error('Unable to load the quote book.')
        }

        const result: ApiResponse = await response.json()

        setQuotes(result.data.data)
        setBookPage(result.data.page)
        setTotalPages(result.data.totalPages)
        setTotalItems(result.data.totalItems)

        setPageCache({
          1: result.data.data,
        })
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }

        setError('The book could not be opened. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadInitialPage()

    return () => {
      controller.abort()
    }
  }, [])

  const authors = useMemo(() => {
    return [...new Set(quotes.map((quote) => quote.author))]
  }, [quotes])

  const tags = useMemo(() => {
    return [...new Set(quotes.flatMap((quote) => quote.tags))].sort()
  }, [quotes])

  const filteredQuotes = useMemo(() => {
    let result = [...quotes]

    const searchTerm = search.trim().toLowerCase()

    if (searchTerm) {
      result = result.filter(
        (quote) =>
          quote.content.toLowerCase().includes(searchTerm) ||
          quote.author.toLowerCase().includes(searchTerm) ||
          quote.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm),
          ),
      )
    }

    if (selectedAuthor !== 'all') {
      result = result.filter(
        (quote) => quote.author === selectedAuthor,
      )
    }

    if (selectedTag !== 'all') {
      result = result.filter((quote) =>
        quote.tags.includes(selectedTag),
      )
    }

    if (favoritesOnly) {
      result = result.filter((quote) =>
        favorites.includes(quote.id),
      )
    }

    if (sortBy === 'shortest') {
      result.sort((a, b) => a.length - b.length)
    }

    if (sortBy === 'longest') {
      result.sort((a, b) => b.length - a.length)
    }

    if (sortBy === 'author') {
      result.sort((a, b) => a.author.localeCompare(b.author))
    }

    return result
  }, [
    quotes,
    search,
    selectedAuthor,
    selectedTag,
    sortBy,
    favoritesOnly,
    favorites,
  ])

  const leftPageQuotes = filteredQuotes.slice(
    0,
    QUOTES_PER_PHYSICAL_PAGE,
  )

  const rightPageQuotes = filteredQuotes.slice(
    QUOTES_PER_PHYSICAL_PAGE,
    QUOTES_PER_SPREAD,
  )

  const hasFilters =
    search !== '' ||
    selectedAuthor !== 'all' ||
    selectedTag !== 'all' ||
    sortBy !== 'default' ||
    favoritesOnly

  function clearFilters() {
    setSearch('')
    setSelectedAuthor('all')
    setSelectedTag('all')
    setSortBy('default')
    setFavoritesOnly(false)
  }

  function toggleFavorite(id: number) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id],
    )
  }

  async function copyQuote(quote: Quote) {
    try {
      await navigator.clipboard.writeText(
        `"${quote.content}" — ${quote.author}`,
      )

      setCopiedId(quote.id)

      window.setTimeout(() => {
        setCopiedId(null)
      }, 1800)
    } catch {
      setError('Could not copy the quote.')
    }
  }

  function handleTagClick(tag: string) {
    setSelectedTag(tag)
    setSearch('')
    setSelectedAuthor('all')
  }

  async function changePage(direction: 'next' | 'previous') {
    const targetPage =
      direction === 'next' ? bookPage + 1 : bookPage - 1

    if (
      targetPage < 1 ||
      targetPage > totalPages ||
      pageLoading
    ) {
      return
    }

    try {
      setPageLoading(true)
      setError('')

      let targetQuotes = pageCache[targetPage]

      if (!targetQuotes) {
        const pageData = await fetchPage(targetPage)

        targetQuotes = pageData.data

        setTotalPages(pageData.totalPages)
        setTotalItems(pageData.totalItems)

        setPageCache((current) => ({
          ...current,
          [targetPage]: targetQuotes!,
        }))
      }

      setQuotes(targetQuotes)
      setBookPage(targetPage)

      setSearch('')
      setSelectedAuthor('all')
      setSelectedTag('all')
      setSortBy('default')
      setFavoritesOnly(false)

      setTurning(direction)

      window.setTimeout(() => {
        setTurning(null)
      }, 900)

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } catch {
      setError('This page could not be opened. Please try again.')
    } finally {
      setPageLoading(false)
    }
  }

  function handleTouchStart(
    event: React.TouchEvent<HTMLDivElement>,
  ) {
    touchStartX.current = event.changedTouches[0].clientX
    touchStartY.current = event.changedTouches[0].clientY
  }

  function handleTouchEnd(
    event: React.TouchEvent<HTMLDivElement>,
  ) {
    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return
    }

    const endX = event.changedTouches[0].clientX
    const endY = event.changedTouches[0].clientY

    const differenceX = endX - touchStartX.current
    const differenceY = endY - touchStartY.current

    touchStartX.current = null
    touchStartY.current = null

    if (Math.abs(differenceX) < 70) {
      return
    }

    if (Math.abs(differenceX) < Math.abs(differenceY)) {
      return
    }

    if (differenceX < 0) {
      changePage('next')
    } else {
      changePage('previous')
    }
  }

  function goToPage(page: number) {
    if (
      page === bookPage ||
      page < 1 ||
      page > totalPages ||
      pageLoading
    ) {
      return
    }

    const direction =
      page > bookPage ? 'next' : 'previous'

    async function jump() {
      try {
        setPageLoading(true)
        setError('')

        let targetQuotes = pageCache[page]

        if (!targetQuotes) {
          const pageData = await fetchPage(page)

          targetQuotes = pageData.data

          setPageCache((current) => ({
            ...current,
            [page]: targetQuotes!,
          }))
        }

        setQuotes(targetQuotes)
        setBookPage(page)

        setSearch('')
        setSelectedAuthor('all')
        setSelectedTag('all')
        setSortBy('default')
        setFavoritesOnly(false)

        setTurning(direction)

        window.setTimeout(() => {
          setTurning(null)
        }, 900)

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      } catch {
        setError('Could not jump to that chapter.')
      } finally {
        setPageLoading(false)
      }
    }

    jump()
  }

  function getPageNumbers() {
    const pages: (number | 'dots')[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }

      return pages
    }

    pages.push(1)

    if (bookPage > 3) {
      pages.push('dots')
    }

    for (
      let i = Math.max(2, bookPage - 1);
      i <= Math.min(totalPages - 1, bookPage + 1);
      i++
    ) {
      pages.push(i)
    }

    if (bookPage < totalPages - 2) {
      pages.push('dots')
    }

    pages.push(totalPages)

    return pages
  }

  /*
    These are the visible page edges.

    The important idea:
    - At page 1 there is NO stack on the left.
    - As we move forward, the left stack grows.
    - As we approach the final page, the right stack shrinks.
    - At the final page there is NO stack on the right.

    We don't print all 50 pages because a real physical book
    compresses many pages into a visible thickness.
  */
  function getStackCount(side: 'left' | 'right') {
    const percentage =
      side === 'left'
        ? (bookPage - 1) / Math.max(totalPages - 1, 1)
        : (totalPages - bookPage) /
          Math.max(totalPages - 1, 1)

    if (percentage <= 0) {
      return 0
    }

    if (percentage < 0.15) {
      return 3
    }

    if (percentage < 0.3) {
      return 5
    }

    if (percentage < 0.5) {
      return 7
    }

    if (percentage < 0.7) {
      return 9
    }

    return 11
  }

  function renderPageStack(side: 'left' | 'right') {
    const count = getStackCount(side)

    if (count === 0) {
      return null
    }

    return (
      <div className={`page-stack ${side}-stack`}>
        {Array.from({ length: count }).map((_, index) => (
          <span
            key={index}
            style={{
              '--stack-index': index,
            } as React.CSSProperties}
          />
        ))}
      </div>
    )
  }

  function retry() {
    window.location.reload()
  }

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loading-book">
          <div className="loading-cover">
            <span>THE</span>
            <strong>QUOTE</strong>
            <span>BOOK</span>
          </div>
        </div>

        <p>Opening the library...</p>
      </main>
    )
  }

  if (error && quotes.length === 0) {
    return (
      <main className="error-screen">
        <div className="error-paper">
          <span className="error-icon">!</span>

          <p className="eyebrow">THE LIBRARY IS CLOSED</p>

          <h1>We couldn't open the book.</h1>

          <p>{error}</p>

          <button className="primary-button" onClick={retry}>
            Try again
          </button>
        </div>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <div className="brand-mark">Q</div>

          <div>
            <strong>THE QUOTE BOOK</strong>
            <span>WORDS WORTH KEEPING</span>
          </div>
        </div>

        <div className="header-stats">
          <div>
            <strong>{totalItems}</strong>
            <span>QUOTES</span>
          </div>

          <div className="header-divider" />

          <div>
            <strong>{totalPages}</strong>
            <span>PAGES</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="intro-section">
          <div>
            <p className="eyebrow">
              A SMALL LIBRARY OF BIG IDEAS
            </p>

            <h1>
              Turn the page.
              <br />
              <em>Find a thought worth keeping.</em>
            </h1>

            <p className="intro-copy">
              A collection of memorable words, observations and
              ideas from voices that have something to say.
            </p>
          </div>

          <div className="book-status">
            <span>YOU ARE READING</span>

            <strong>
              {bookPage === 1
                ? 'THE BEGINNING'
                : bookPage === totalPages
                  ? 'THE END'
                  : 'THE COLLECTION'}
            </strong>
          </div>
        </section>

        <section className="library-toolbar">
          <div className="search-wrapper">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Find a quote, author or idea..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch('')}
              >
                ×
              </button>
            )}
          </div>

          <select
            value={selectedAuthor}
            onChange={(event) =>
              setSelectedAuthor(event.target.value)
            }
          >
            <option value="all">All authors</option>

            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>

          <select
            value={selectedTag}
            onChange={(event) =>
              setSelectedTag(event.target.value)
            }
          >
            <option value="all">All subjects</option>

            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as SortOption)
            }
          >
            <option value="default">Original order</option>
            <option value="shortest">Shortest first</option>
            <option value="longest">Longest first</option>
            <option value="author">Author A–Z</option>
          </select>

          <button
            className={`favorites-filter ${
              favoritesOnly ? 'active' : ''
            }`}
            onClick={() =>
              setFavoritesOnly((current) => !current)
            }
          >
            {favoritesOnly ? '★' : '☆'} Favorites
          </button>

          {hasFilters && (
            <button className="reset-filter" onClick={clearFilters}>
              Clear
            </button>
          )}
        </section>

        {error && (
          <div className="small-error">
            <span>{error}</span>

            <button onClick={() => setError('')}>
              Dismiss
            </button>
          </div>
        )}

        <section
          className="book-stage"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="book-shadow" />

          <div
            className={`book ${
              bookPage === 1 ? 'at-first-page' : ''
            } ${
              bookPage === totalPages ? 'at-last-page' : ''
            }`}
          >
            {renderPageStack('left')}

            <div className="book-cover-edge" />

            <div className="book-pages">
              <div className="paper-page left-page">
                <div className="page-header">
                  <span>THE QUOTE BOOK</span>
                  <span>COLLECTION</span>
                </div>

                <div className="page-content">
                  {leftPageQuotes.length > 0 ? (
                    leftPageQuotes.map((quote, index) => (
                      <QuoteCard
                        key={quote.id}
                        quote={quote}
                        number={index + 1}
                        isFavorite={favorites.includes(quote.id)}
                        isCopied={copiedId === quote.id}
                        onCopy={copyQuote}
                        onToggleFavorite={toggleFavorite}
                        onFocus={setFocusedQuote}
                        onTagClick={handleTagClick}
                      />
                    ))
                  ) : (
                    <div className="empty-page">
                      <span>⌕</span>
                      <strong>No words found.</strong>
                      <p>
                        This page has nothing matching your search.
                      </p>

                      <button
                        className="paper-button"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>

                <div className="page-footer">
                  <span>✦</span>
                  <span>
                    {(bookPage - 1) * QUOTES_PER_SPREAD + 1}
                  </span>
                </div>
              </div>

              <div className="paper-page right-page">
                <div className="page-header">
                  <span>WORDS &amp; WISDOM</span>

                  <span>
                    {bookPage === totalPages
                      ? 'THE END'
                      : 'CONTINUED'}
                  </span>
                </div>

                <div className="page-content">
                  {rightPageQuotes.length > 0 ? (
                    rightPageQuotes.map((quote, index) => (
                      <QuoteCard
                        key={quote.id}
                        quote={quote}
                        number={index + 4}
                        isFavorite={favorites.includes(quote.id)}
                        isCopied={copiedId === quote.id}
                        onCopy={copyQuote}
                        onToggleFavorite={toggleFavorite}
                        onFocus={setFocusedQuote}
                        onTagClick={handleTagClick}
                      />
                    ))
                  ) : (
                    <div className="empty-page">
                      <span>✦</span>
                      <strong>The final thought.</strong>
                      <p>
                        There are no more quotes on this spread.
                      </p>
                    </div>
                  )}
                </div>

                <div className="page-footer">
                  <span>
                    {bookPage === totalPages
                      ? 'THE END'
                      : 'TURN THE PAGE'}
                  </span>

                  <span>
                    {Math.min(
                      bookPage * QUOTES_PER_SPREAD,
                      totalItems,
                    )}
                  </span>
                </div>
              </div>

              {turning && (
                <div
                  className={`turning-page ${
                    turning === 'next'
                      ? 'turning-next'
                      : 'turning-previous'
                  }`}
                >
                  <div className="turning-page-front">
                    <span className="turning-label">
                      THE QUOTE BOOK
                    </span>

                    <strong>
                      {turning === 'next'
                        ? bookPage - 1
                        : bookPage + 1}
                    </strong>

                    <span>TURNING THE PAGE</span>
                  </div>

                  <div className="turning-page-back">
                    <span>THE QUOTE BOOK</span>
                  </div>
                </div>
              )}
            </div>

            {renderPageStack('right')}
          </div>
        </section>

        <section className="book-controls">
          <button
            className="page-control previous"
            onClick={() => changePage('previous')}
            disabled={bookPage === 1 || pageLoading}
          >
            <span>←</span>

            <div>
              <small>PREVIOUS</small>
              <strong>
                {bookPage === 1
                  ? 'Beginning of book'
                  : 'Turn back'}
              </strong>
            </div>
          </button>

          <div className="page-indicator">
            <span>THE BOOK</span>

            <div className="page-numbers">
              {getPageNumbers().map((page, index) =>
                page === 'dots' ? (
                  <span
                    className="dots"
                    key={`dots-${index}`}
                  >
                    ···
                  </span>
                ) : (
                  <button
                    key={page}
                    className={
                      page === bookPage
                        ? 'current-page'
                        : ''
                    }
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <small>
              {pageLoading
                ? 'Turning the pages...'
                : bookPage === 1
                  ? 'The first spread'
                  : bookPage === totalPages
                    ? 'The final spread'
                    : 'Keep reading'}
            </small>
          </div>

          <button
            className="page-control next"
            onClick={() => changePage('next')}
            disabled={
              bookPage === totalPages || pageLoading
            }
          >
            <div>
              <small>NEXT</small>

              <strong>
                {bookPage === totalPages
                  ? 'End of book'
                  : 'Turn the page'}
              </strong>
            </div>

            <span>→</span>
          </button>
        </section>

        <section className="closing-note">
          <span className="ornament">✦</span>

          <p>
            “Some books are to be tasted, others to be swallowed,
            and some few to be chewed and digested.”
          </p>

          <small>— FRANCIS BACON</small>
        </section>
      </main>

      {focusedQuote && (
        <div
          className="quote-modal-overlay"
          onClick={() => setFocusedQuote(null)}
        >
          <div
            className="quote-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setFocusedQuote(null)}
              aria-label="Close"
            >
              ×
            </button>

            <span className="modal-kicker">
              QUOTE #{focusedQuote.id}
            </span>

            <div className="modal-quote-mark">“</div>

            <blockquote>{focusedQuote.content}</blockquote>

            <div className="modal-author">
              <div className="author-monogram">
                {focusedQuote.author
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div>
                <strong>{focusedQuote.author}</strong>
                <span>@{focusedQuote.authorSlug}</span>
              </div>
            </div>

            <div className="modal-tags">
              {focusedQuote.tags.length > 0 ? (
                focusedQuote.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))
              ) : (
                <span>No tags</span>
              )}
            </div>

            <div className="modal-details">
              <div>
                <span>LENGTH</span>
                <strong>
                  {focusedQuote.length} characters
                </strong>
              </div>

              <div>
                <span>ADDED</span>
                <strong>{focusedQuote.dateAdded}</strong>
              </div>

              <div>
                <span>MODIFIED</span>
                <strong>{focusedQuote.dateModified}</strong>
              </div>

              <div>
                <span>DATABASE ID</span>
                <strong>#{focusedQuote.id}</strong>
              </div>
            </div>

            <button
              className="modal-copy"
              onClick={() => copyQuote(focusedQuote)}
            >
              {copiedId === focusedQuote.id
                ? '✓ Quote copied'
                : 'Copy this quote'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App