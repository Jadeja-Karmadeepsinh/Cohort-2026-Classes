import { useState } from 'react'

export type Joke = {
  id: number
  content: string
  categories: string[]
}

type JokeCardProps = {
  joke: Joke
  index: number
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
}

function JokeCard({
  joke,
  index,
  isFavorite,
  onToggleFavorite,
}: JokeCardProps) {
  const [copied, setCopied] = useState(false)

  const isExplicit = joke.categories.some(
    (category) =>
      category.toLowerCase() === 'explicit',
  )

  async function copyJoke() {
    try {
      await navigator.clipboard.writeText(joke.content)

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article
      className={`joke-card ${
        isExplicit ? 'explicit-card' : ''
      }`}
    >

      <div className="joke-card-top">

        <div className="joke-index">
          <span>
            {String(index + 1).padStart(2, '0')}
          </span>
          <div />
          <span>
            #{String(joke.id).padStart(4, '0')}
          </span>
        </div>

        <button
          className={`favorite-button ${
            isFavorite ? 'is-favorite' : ''
          }`}
          onClick={() => onToggleFavorite(joke.id)}
          aria-label={
            isFavorite
              ? 'Remove from favorites'
              : 'Add to favorites'
          }
          title={
            isFavorite
              ? 'Remove from favorites'
              : 'Save this joke'
          }
        >
          {isFavorite ? '♥' : '♡'}
        </button>

      </div>

      <div className="joke-content">

        <div className="quote-mark">
          “
        </div>

        <p>{joke.content}</p>

      </div>

      <div className="joke-divider">
        <span />
        <span />
        <span />
      </div>

      <div className="joke-meta">

        <div className="category-tags">

          {joke.categories.length > 0 ? (
            joke.categories.map((category) => (
              <span
                key={category}
                className={
                  category === 'explicit'
                    ? 'tag explicit-tag'
                    : 'tag'
                }
              >
                {category === 'explicit' && '⚠ '}
                {category}
              </span>
            ))
          ) : (
            <span className="tag general-tag">
              general
            </span>
          )}

        </div>

        {isExplicit && (
          <span className="content-warning">
            mature
          </span>
        )}

      </div>

      <div className="joke-actions">

        <button
          className="card-action"
          onClick={copyJoke}
        >
          <span>
            {copied ? '✓' : '▣'}
          </span>

          {copied ? 'Copied' : 'Copy'}
        </button>

        <button
          className={`card-action save-action ${
            isFavorite ? 'saved' : ''
          }`}
          onClick={() =>
            onToggleFavorite(joke.id)
          }
        >
          <span>
            {isFavorite ? '♥' : '♡'}
          </span>

          {isFavorite ? 'Saved' : 'Save'}
        </button>

      </div>

    </article>
  )
}

export default JokeCard