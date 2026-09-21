import { useEffect, useState } from 'react'
import './App.css'
import CatCard from './components/CatCard.tsx'

export type Cat = {
  weight: {
    imperial: string
    metric: string
  }
  id: number
  name: string
  temperament: string
  origin: string
  country_codes: string
  country_code: string
  description: string
  life_span: string
  indoor: number
  alt_names: string
  adaptability: number
  affection_level: number
  child_friendly: number
  dog_friendly: number
  energy_level: number
  grooming: number
  health_issues: number
  intelligence: number
  shedding_level: number
  social_needs: number
  stranger_friendly: number
  vocalisation: number
  experimental: number
  hairless: number
  natural: number
  rare: number
  rex: number
  suppressed_tail: number
  short_legs: number
  wikipedia_url: string
  hypoallergenic: number
  image: string
}

function App() {
  const [data, setData] = useState<Cat | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function loadData(signal?: AbortSignal) {
    try {
      setLoading(true)
      setError(false)

      const response = await fetch(
        'https://api.freeapi.app/api/v1/public/cats/cat/random',
        {
          signal,
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch cat')
      }

      const result = await response.json()

      console.log(result.data)

      setData(result.data)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      console.error(error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    loadData(controller.signal)

    return () => {
      controller.abort()
    }
  }, [])

  function handleNewCat() {
    loadData()
  }

  return (
    <main className="app">
      <div className="background-paw paw-one">🐾</div>
      <div className="background-paw paw-two">🐾</div>
      <div className="background-paw paw-three">🐾</div>

      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">🐱</div>

          <div>
            <h1>Cativerse</h1>
            <p>Discover the wonderful world of cats</p>
          </div>
        </div>

        <button
          className="new-cat-button"
          onClick={handleNewCat}
          disabled={loading}
        >
          <span>🎲</span>
          {loading ? 'Finding a cat...' : 'Meet Another Cat'}
        </button>
      </header>

      <section className="content">
        {loading && !data && (
          <div className="loading-screen">
            <div className="cat-loader">🐱</div>
            <h2>Finding your cat...</h2>
            <p>Our little cat is getting ready to meet you.</p>
          </div>
        )}

        {error && !data && (
          <div className="error-screen">
            <div className="error-icon">😿</div>

            <h2>Oh no! The cat escaped.</h2>

            <p>
              We couldn't fetch a cat right now. Try calling them again.
            </p>

            <button
              className="retry-button"
              onClick={handleNewCat}
            >
              🐾 Try Again
            </button>
          </div>
        )}

        {data && (
          <>
            <CatCard cat={data} />

            {loading && (
              <div className="fetching-overlay">
                <div className="small-spinner"></div>
                <span>Finding another cat...</span>
              </div>
            )}
          </>
        )}
      </section>

      <footer className="footer">
        <span>🐾</span>
        <span>Powered by The Cat API</span>
        <span>🐾</span>
      </footer>
    </main>
  )
}

export default App