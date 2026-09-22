import { useEffect, useState } from 'react'
import './App.css'
import UserCard from './components/UserCard.tsx'

type User = {
  gender: string
  name: {
    title: string
    first: string
    last: string
  }
  location: {
    street: {
      number: number
      name: string
    }
    city: string
    state: string
    country: string
    postcode: string | number
    coordinates: {
      latitude: string
      longitude: string
    }
    timezone: {
      offset: string
      description: string
    }
  }
  email: string
  login: {
    uuid: string
    username: string
  }
  dob: {
    date: string
    age: number
  }
  registered: {
    date: string
    age: number
  }
  phone: string
  cell: string
  id: number
  picture: {
    large: string
    medium: string
    thumbnail: string
  }
  nat: string
}

function App() {
  const [data, setData] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(50)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')

  useEffect(() => {
    const controller = new AbortController()

    async function loadData() {
      try {
        setLoading(true)
        setError(false)

        const response = await fetch(
          `https://api.freeapi.app/api/v1/public/randomusers?page=${page}&limit=10`,
          {
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const result = await response.json()

        setData(result.data.data)
        setTotalPages(result.data.totalPages)
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return
        }

        console.error(error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    return () => {
      controller.abort()
    }
  }, [page])

  const filteredUsers = data.filter((user) => {
    const fullName =
      `${user.name.first} ${user.name.last}`.toLowerCase()

    const searchValue = search.toLowerCase()

    const matchesSearch =
      fullName.includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue) ||
      user.location.country.toLowerCase().includes(searchValue) ||
      user.login.username.toLowerCase().includes(searchValue)

    const matchesGender =
      genderFilter === 'all' ||
      user.gender.toLowerCase() === genderFilter

    return matchesSearch && matchesGender
  })

  function handlePrevious() {
    if (page > 1) {
      setPage((previousPage) => previousPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleNext() {
    if (page < totalPages) {
      setPage((previousPage) => previousPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleRefresh() {
    setPage((previousPage) => previousPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">

      {/* Background decoration */}
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <header className="topbar">

        <div className="brand">
          <div className="brand-icon">
            👥
          </div>

          <div>
            <h1>People<span>Hub</span></h1>
            <p>Random User Directory</p>
          </div>
        </div>

        <button
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
        >
          <span className={loading ? 'refresh-icon spinning' : 'refresh-icon'}>
            ↻
          </span>

          {loading ? 'Loading...' : 'Refresh'}
        </button>

      </header>

      <main className="main-container">

        <section className="hero-section">

          <div className="hero-content">

            <div className="eyebrow">
              <span className="live-dot"></span>
              LIVE DIRECTORY
            </div>

            <h2>
              Discover people
              <br />
              from <span>around the world.</span>
            </h2>

            <p>
              Explore randomly generated profiles with their
              personal details, location, contact information
              and more.
            </p>

          </div>

          <div className="hero-stat">

            <div className="stat-icon">
              ◉
            </div>

            <div>
              <strong>{loading ? '—' : data.length}</strong>
              <span>Profiles loaded</span>
            </div>

          </div>

        </section>


        <section className="toolbar">

          <div className="search-box">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search by name, email, country or username..."
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


          <div className="filter-group">

            <button
              className={
                genderFilter === 'all'
                  ? 'filter-button active'
                  : 'filter-button'
              }
              onClick={() => setGenderFilter('all')}
            >
              All
            </button>

            <button
              className={
                genderFilter === 'male'
                  ? 'filter-button active male'
                  : 'filter-button'
              }
              onClick={() => setGenderFilter('male')}
            >
              ♂ Male
            </button>

            <button
              className={
                genderFilter === 'female'
                  ? 'filter-button active female'
                  : 'filter-button'
              }
              onClick={() => setGenderFilter('female')}
            >
              ♀ Female
            </button>

          </div>

        </section>


        {loading && (
          <section className="user-grid">

            {Array.from({ length: 10 }).map((_, index) => (
              <div className="skeleton-card" key={index}>

                <div className="skeleton skeleton-image"></div>

                <div className="skeleton-content">

                  <div className="skeleton skeleton-line large"></div>
                  <div className="skeleton skeleton-line medium"></div>
                  <div className="skeleton skeleton-line"></div>
                  <div className="skeleton skeleton-line"></div>
                  <div className="skeleton skeleton-line short"></div>

                </div>

              </div>
            ))}

          </section>
        )}


        {!loading && error && (
          <section className="state-container">

            <div className="state-icon">
              ⚠
            </div>

            <h3>Something went wrong</h3>

            <p>
              We couldn't load the users right now.
              Please try again.
            </p>

            <button
              className="retry-button"
              onClick={() => setPage(page)}
            >
              Try Again
            </button>

          </section>
        )}


        {!loading && !error && filteredUsers.length === 0 && (
          <section className="state-container">

            <div className="state-icon">
              ⌕
            </div>

            <h3>No users found</h3>

            <p>
              Try searching with another name, email,
              username or country.
            </p>

            <button
              className="retry-button"
              onClick={() => {
                setSearch('')
                setGenderFilter('all')
              }}
            >
              Clear Filters
            </button>

          </section>
        )}


        {!loading && !error && filteredUsers.length > 0 && (
          <>

            <div className="results-header">

              <div>
                <span className="results-title">
                  User Profiles
                </span>

                <span className="results-count">
                  {filteredUsers.length} of {data.length}
                </span>
              </div>

              <span className="page-indicator">
                Page {page} / {totalPages}
              </span>

            </div>


            <section className="user-grid">

              {filteredUsers.map((user) => (
                <UserCard
                  key={user.login.uuid}
                  user={user}
                />
              ))}

            </section>


            <div className="pagination">

              <button
                className="page-button"
                onClick={handlePrevious}
                disabled={page === 1}
              >
                ←
                <span>Previous</span>
              </button>


              <div className="page-number">
                <span>Page</span>
                <strong>{page}</strong>
                <span>of {totalPages}</span>
              </div>


              <button
                className="page-button next"
                onClick={handleNext}
                disabled={page === totalPages}
              >
                <span>Next</span>
                →
              </button>

            </div>

          </>
        )}

      </main>


      <footer className="footer">

        <div>
          <strong>PeopleHub</strong>
          <span> · Random User Explorer</span>
        </div>

        <span>
          Built with React + TypeScript
        </span>

      </footer>

    </div>
  )
}

export default App