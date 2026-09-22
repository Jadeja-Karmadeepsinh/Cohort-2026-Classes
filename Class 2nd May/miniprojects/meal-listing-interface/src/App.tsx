import { useEffect, useMemo, useState } from 'react'
import './App.css'
import MealCard, { type Meal } from './components/MealCard'

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
    data: Meal[]
  }
  message: string
  success: boolean
}

const API_URL = 'https://api.freeapi.app/api/v1/public/meals'

function App() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [area, setArea] = useState('All')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadMeals() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_URL}?page=${page}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Unable to fetch meals.')
        }

        const result: ApiResponse = await response.json()

        setMeals(result.data.data)
        setTotalPages(result.data.totalPages)
        setTotalItems(result.data.totalItems)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        console.error(error)
        setError('Something went wrong while loading the recipes.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadMeals()

    return () => {
      controller.abort()
    }
  }, [page, refreshKey])

  const categories = useMemo(() => {
    const values = meals
      .map((meal) => meal.strCategory)
      .filter(Boolean)

    return ['All', ...Array.from(new Set(values))]
  }, [meals])

  const areas = useMemo(() => {
    const values = meals
      .map((meal) => meal.strArea)
      .filter(Boolean)

    return ['All', ...Array.from(new Set(values))]
  }, [meals])

  const filteredMeals = useMemo(() => {
    const query = search.trim().toLowerCase()

    return meals.filter((meal) => {
      const matchesSearch =
        !query ||
        meal.strMeal.toLowerCase().includes(query) ||
        meal.strCategory?.toLowerCase().includes(query) ||
        meal.strArea?.toLowerCase().includes(query) ||
        meal.strTags?.toLowerCase().includes(query) ||
        Array.from({ length: 20 }, (_, index) => {
          const ingredient =
            meal[`strIngredient${index + 1}` as keyof Meal]

          return typeof ingredient === 'string'
            ? ingredient.toLowerCase()
            : ''
        }).some((ingredient) => ingredient.includes(query))

      const matchesCategory =
        category === 'All' || meal.strCategory === category

      const matchesArea =
        area === 'All' || meal.strArea === area

      return matchesSearch && matchesCategory && matchesArea
    })
  }, [meals, search, category, area])

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return
    }

    setPage(nextPage)
    setSearch('')
    setCategory('All')
    setArea('All')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const refreshMeals = () => {
    setRefreshKey((value) => value + 1)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <div className="brand-icon">✦</div>

          <div>
            <div className="brand-name">TABLE &amp; TASTE</div>
            <div className="brand-subtitle">A collection of good food</div>
          </div>
        </div>

        <button
          className="refresh-button"
          onClick={refreshMeals}
          type="button"
        >
          <span>↻</span>
          Refresh recipes
        </button>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <span className="eyebrow">
              THE RECIPE COLLECTION
            </span>

            <h1>
              Good food.
              <br />
              <em>Beautifully</em> made.
            </h1>

            <p>
              Discover recipes from kitchens around the world —
              from comforting classics to dishes you've never
              tried before.
            </p>

            <div className="hero-stats">
              <div className="hero-stat">
                <strong>{totalItems}</strong>
                <span>recipes</span>
              </div>

              <div className="hero-divider" />

              <div className="hero-stat">
                <strong>30</strong>
                <span>pages</span>
              </div>

              <div className="hero-divider" />

              <div className="hero-stat">
                <strong>20</strong>
                <span>ingredients max</span>
              </div>
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-circle hero-circle-one" />
            <div className="hero-circle hero-circle-two" />

            <div className="hero-food-card">
              <span className="hero-food-icon">🍳</span>
              <span>Cook something<br />wonderful today.</span>
            </div>
          </div>
        </section>

        <section className="controls-section">
          <div className="search-wrapper">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search meals, ingredients, cuisines..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch('')}
                type="button"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <span className="filter-label">CATEGORY</span>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">CUISINE</span>

              <select
                value={area}
                onChange={(event) => setArea(event.target.value)}
              >
                {areas.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {(search || category !== 'All' || area !== 'All') && (
              <button
                className="reset-button"
                type="button"
                onClick={() => {
                  setSearch('')
                  setCategory('All')
                  setArea('All')
                }}
              >
                Reset filters
              </button>
            )}
          </div>
        </section>

        <section className="collection-header">
          <div>
            <span className="section-kicker">
              PAGE {page} OF {totalPages}
            </span>

            <h2>Today's recipes</h2>
          </div>

          <div className="result-count">
            Showing <strong>{filteredMeals.length}</strong> of{' '}
            {meals.length} recipes
          </div>
        </section>

        {loading ? (
          <section className="meal-grid">
            {Array.from({ length: 10 }).map((_, index) => (
              <div className="meal-skeleton" key={index}>
                <div className="skeleton-image" />

                <div className="skeleton-content">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line large" />
                  <div className="skeleton-line medium" />
                  <div className="skeleton-line small" />
                </div>
              </div>
            ))}
          </section>
        ) : error ? (
          <section className="state-card error-card">
            <div className="state-icon">!</div>
            <h3>Kitchen trouble.</h3>
            <p>{error}</p>

            <button
              type="button"
              onClick={refreshMeals}
              className="primary-button"
            >
              Try again
            </button>
          </section>
        ) : filteredMeals.length === 0 ? (
          <section className="state-card">
            <div className="state-icon">⌕</div>
            <h3>No recipes found.</h3>
            <p>
              Try another meal name, ingredient, category or
              cuisine.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch('')
                setCategory('All')
                setArea('All')
              }}
              className="primary-button"
            >
              Show all recipes
            </button>
          </section>
        ) : (
          <section className="meal-grid">
            {filteredMeals.map((meal) => (
              <MealCard key={meal.idMeal} meal={meal} />
            ))}
          </section>
        )}

        <nav className="pagination" aria-label="Recipe pagination">
          <button
            type="button"
            className="page-button previous"
            disabled={page === 1 || loading}
            onClick={() => goToPage(page - 1)}
          >
            <span>←</span>
            Previous
          </button>

          <div className="page-indicator">
            <span>Page</span>
            <strong>{page}</strong>
            <span>of {totalPages}</span>
          </div>

          <button
            type="button"
            className="page-button next"
            disabled={page === totalPages || loading}
            onClick={() => goToPage(page + 1)}
          >
            Next
            <span>→</span>
          </button>
        </nav>
      </main>

      <footer className="site-footer">
        <div>
          <strong>TABLE &amp; TASTE</strong>
          <span>Recipes worth sharing.</span>
        </div>

        <span>
          {totalItems} recipes · Page {page} / {totalPages}
        </span>
      </footer>
    </div>
  )
}

export default App