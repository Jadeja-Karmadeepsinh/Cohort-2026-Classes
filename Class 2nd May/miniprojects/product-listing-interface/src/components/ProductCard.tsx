import type { Product } from '../App'

interface ProductCardProps {
  product: Product
  isWishlisted: boolean
  onWishlist: (id: number) => void
  onOpen: (product: Product) => void
}

function ProductCard({
  product,
  isWishlisted,
  onWishlist,
  onOpen,
}: ProductCardProps) {
  const discountedPrice =
    product.price * (1 - product.discountPercentage / 100)

  const stockStatus =
    product.stock <= 10
      ? 'low'
      : product.stock <= 30
        ? 'medium'
        : 'high'

  return (
    <article className="product-card">
      {/* IMAGE */}

      <div
        className="product-image-area"
        onClick={() => onOpen(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            onOpen(product)
          }
        }}
      >
        <div className="product-badge">
          {Math.round(product.discountPercentage)}% OFF
        </div>

        <button
          className={`wishlist-button ${
            isWishlisted ? 'active' : ''
          }`}
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onWishlist(product.id)
          }}
          aria-label={
            isWishlisted
              ? `Remove ${product.title} from wishlist`
              : `Add ${product.title} to wishlist`
          }
        >
          {isWishlisted ? '♥' : '♡'}
        </button>

        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
        />

        <div className="quick-view">
          <span>Quick view</span>
          <span>↗</span>
        </div>
      </div>

      {/* CONTENT */}

      <div className="product-content">
        <div className="product-brand-row">
          <span className="product-brand">
            {product.brand}
          </span>

          <span className="product-category">
            {formatLabel(product.category)}
          </span>
        </div>

        <button
          className="product-title"
          type="button"
          onClick={() => onOpen(product)}
        >
          {product.title}
        </button>

        <p className="product-description">
          {product.description}
        </p>

        {/* RATING */}

        <div className="rating-row">
          <span className="stars">
            {renderStars(product.rating)}
          </span>

          <strong>{product.rating.toFixed(2)}</strong>

          <span className="rating-label">rating</span>
        </div>

        {/* PRICE */}

        <div className="price-row">
          <div className="price-group">
            <strong>${discountedPrice.toFixed(2)}</strong>

            <del>${product.price.toFixed(2)}</del>
          </div>

          <span className="save-amount">
            Save $
            {(
              product.price - discountedPrice
            ).toFixed(2)}
          </span>
        </div>

        {/* STOCK */}

        <div className="stock-row">
          <div className={`stock-dot ${stockStatus}`} />

          <span>
            {product.stock <= 10
              ? `Only ${product.stock} left`
              : `${product.stock} in stock`}
          </span>

          <span className="product-id">
            #{String(product.id).padStart(3, '0')}
          </span>
        </div>
      </div>
    </article>
  )
}

function renderStars(rating: number) {
  const rounded = Math.round(rating)

  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded)
}

function formatLabel(value: string) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default ProductCard