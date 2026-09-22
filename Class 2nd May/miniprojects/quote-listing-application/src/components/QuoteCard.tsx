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
  number: number
  isFavorite: boolean
  isCopied: boolean
  onCopy: (quote: Quote) => void
  onToggleFavorite: (id: number) => void
  onFocus: (quote: Quote) => void
  onTagClick: (tag: string) => void
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function QuoteCard({
  quote,
  number,
  isFavorite,
  isCopied,
  onCopy,
  onToggleFavorite,
  onFocus,
  onTagClick,
}: QuoteCardProps) {
  return (
    <article className="quote-entry">
      <div className="quote-entry-top">
        <span className="quote-number">
          {String(number).padStart(2, '0')}
        </span>

        <button
          className={`favorite-button ${
            isFavorite ? 'is-favorite' : ''
          }`}
          onClick={() => onToggleFavorite(quote.id)}
          aria-label={
            isFavorite
              ? 'Remove from favorites'
              : 'Add to favorites'
          }
          title={
            isFavorite
              ? 'Remove favorite'
              : 'Add favorite'
          }
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <button
        className="quote-content-button"
        onClick={() => onFocus(quote)}
        title="Open quote"
      >
        <span className="mini-quote-mark">“</span>

        <p className="quote-content">{quote.content}</p>
      </button>

      <div className="quote-author-row">
        <div className="author-monogram">
          {getInitials(quote.author)}
        </div>

        <div className="author-details">
          <strong>{quote.author}</strong>
          <span>@{quote.authorSlug}</span>
        </div>
      </div>

      <div className="quote-tags">
        {quote.tags.length > 0 ? (
          quote.tags.map((tag) => (
            <button
              key={tag}
              className="quote-tag"
              onClick={() => onTagClick(tag)}
            >
              #{tag}
            </button>
          ))
        ) : (
          <span className="no-tags">No tags</span>
        )}
      </div>

      <div className="quote-meta">
        <span>{quote.length} characters</span>

        <span>
          Added {formatDate(quote.dateAdded)}
        </span>

        <span>
          Updated {formatDate(quote.dateModified)}
        </span>

        <span>ID #{quote.id}</span>
      </div>

      <div className="quote-actions">
        <button
          className="paper-button"
          onClick={() => onCopy(quote)}
        >
          {isCopied ? '✓ Copied' : 'Copy quote'}
        </button>

        <button
          className="focus-button"
          onClick={() => onFocus(quote)}
        >
          Read full quote ↗
        </button>
      </div>
    </article>
  )
}

export default QuoteCard