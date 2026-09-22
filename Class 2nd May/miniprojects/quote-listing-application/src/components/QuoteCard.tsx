export type Quote = {
  author: string
  content: string
  tags: string[]
  authorSlug: string
  length: number
  dateAdded: string
  dateModified: string
  id: number
}

type QuoteCardProps = {
  quote: Quote
  index: number
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
  onCopy: (quote: Quote) => void
}

function formatDate(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function getReadingTime(length: number) {
  if (length < 70) {
    return 'Quick read'
  }

  if (length < 110) {
    return 'Short read'
  }

  return 'Long read'
}

function QuoteCard({
  quote,
  index,
  isFavorite,
  onToggleFavorite,
  onCopy,
}: QuoteCardProps) {
  return (
    <article className="quote-card">

      {/* =====================================
          CARD HEADER
      ====================================== */}

      <div className="quote-card-header">

        <div className="quote-number">
          <span>
            {String(index + 1).padStart(2, '0')}
          </span>

          <i />

          <span>
            ID {quote.id}
          </span>
        </div>


        <button
          className={`favorite-button ${
            isFavorite
              ? 'favorite-active'
              : ''
          }`}
          onClick={() =>
            onToggleFavorite(quote.id)
          }
          aria-label={
            isFavorite
              ? 'Remove quote from favorites'
              : 'Save quote to favorites'
          }
          title={
            isFavorite
              ? 'Remove from favorites'
              : 'Save quote'
          }
        >
          {isFavorite ? '♥' : '♡'}
        </button>

      </div>


      {/* =====================================
          QUOTE
      ====================================== */}

      <div className="quote-body">

        <div className="quote-symbol">
          “
        </div>

        <p>
          {quote.content}
        </p>

      </div>


      {/* =====================================
          AUTHOR
      ====================================== */}

      <div className="quote-author">

        <div className="author-avatar">
          {quote.author.charAt(0)}
        </div>

        <div className="author-information">

          <strong>
            {quote.author}
          </strong>

          <span>
            @{quote.authorSlug}
          </span>

        </div>

      </div>


      {/* =====================================
          TAGS
      ====================================== */}

      <div className="quote-tags">

        {quote.tags.length > 0 ? (
          quote.tags.map((tag) => (
            <span
              key={tag}
              className="quote-tag"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="untagged">
            UNTAGGED
          </span>
        )}

      </div>


      {/* =====================================
          METADATA
      ====================================== */}

      <div className="quote-information">

        <div className="information-item">

          <span>LENGTH</span>

          <strong>
            {quote.length} chars
          </strong>

        </div>


        <div className="information-item">

          <span>READ</span>

          <strong>
            {getReadingTime(
              quote.length,
            )}
          </strong>

        </div>


        <div className="information-item">

          <span>ADDED</span>

          <strong>
            {formatDate(
              quote.dateAdded,
            )}
          </strong>

        </div>


        <div className="information-item">

          <span>UPDATED</span>

          <strong>
            {formatDate(
              quote.dateModified,
            )}
          </strong>

        </div>

      </div>


      {/* =====================================
          ACTIONS
      ====================================== */}

      <div className="quote-actions">

        <button
          className="quote-action"
          onClick={() =>
            onCopy(quote)
          }
        >
          <span>▣</span>
          Copy
        </button>

        <button
          className={`quote-action ${
            isFavorite
              ? 'action-favorite'
              : ''
          }`}
          onClick={() =>
            onToggleFavorite(
              quote.id,
            )
          }
        >
          <span>
            {isFavorite
              ? '♥'
              : '♡'}
          </span>

          {isFavorite
            ? 'Saved'
            : 'Save'}
        </button>

      </div>

    </article>
  )
}

export default QuoteCard