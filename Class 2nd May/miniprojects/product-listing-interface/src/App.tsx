import { useEffect, useMemo, useState } from 'react'
import './App.css'
import ProductCard from './components/ProductCard'

export interface Product {
  id: number
  title: string
  description: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  category: string
  thumbnail: string
  images: string[]
}

type SortOption =
  | 'featured'
  | 'price-low'
  | 'price-high'
  | 'rating'
  | 'discount'

const API_URL = 'https://api.freeapi.app/api/v1/public/randomproducts'

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [brand, setBrand] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('featured')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('shoply-wishlist')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('shoply-wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_URL}?page=${page}&limit=10`,
          {
            signal: controller.signal,
          },
        )

        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }

        const result = await response.json()

        setProducts(result.data.data)
        setTotalPages(result.data.totalPages)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        setError(
          'We couldn’t load the collection. Please check your connection and try again.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadProducts()

    return () => {
      controller.abort()
    }
  }, [page])

  const categories = useMemo(() => {
    const values = products.map((product) => product.category)
    return ['all', ...Array.from(new Set(values))]
  }, [products])

  const brands = useMemo(() => {
    const values = products.map((product) => product.brand)
    return ['all', ...Array.from(new Set(values))]
  }, [products])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim()

    const result = products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.title.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch) ||
        product.brand.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch)

      const matchesCategory =
        category === 'all' || product.category === category

      const matchesBrand = brand === 'all' || product.brand === brand

      return matchesSearch && matchesCategory && matchesBrand
    })

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return getDiscountedPrice(a) - getDiscountedPrice(b)

        case 'price-high':
          return getDiscountedPrice(b) - getDiscountedPrice(a)

        case 'rating':
          return b.rating - a.rating

        case 'discount':
          return b.discountPercentage - a.discountPercentage

        default:
          return a.id - b.id
      }
    })
  }, [products, search, category, brand, sortBy])

  function toggleWishlist(id: number) {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  function openProduct(product: Product) {
    setSelectedProduct(product)
    setSelectedImage(product.thumbnail)
    document.body.style.overflow = 'hidden'
  }

  function closeProduct() {
    setSelectedProduct(null)
    document.body.style.overflow = ''
  }

  function clearFilters() {
    setSearch('')
    setCategory('all')
    setBrand('all')
    setSortBy('featured')
  }

  function changePage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return
    }

    setPage(nextPage)
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div className="storefront">
      {/* ================= HEADER ================= */}

      <header className="site-header">
        <div className="header-inner">
          <a className="brand-logo" href="#" aria-label="Shoply home">
            <span className="brand-mark">S</span>
            <span className="brand-name">SHOPLY</span>
          </a>

          <div className="header-tagline">
            Curated things. Better choices.
          </div>

          <div className="header-actions">
            <button
              className="wishlist-header-button"
              onClick={() => {
                setSearch('')
                setCategory('all')
                setBrand('all')
              }}
              type="button"
            >
              <span className="heart-icon">♡</span>
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="wishlist-count">{wishlist.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">THE EVERYDAY EDIT</span>

          <h1>
            Things you’ll
            <br />
            <em>actually</em> want.
          </h1>

          <p>
            Discover phones, laptops, tech and everyday essentials —
            handpicked from our constantly changing collection.
          </p>

          <div className="hero-stats">
            <div>
              <strong>100</strong>
              <span>Products</span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>10</strong>
              <span>Pages</span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>4.3+</strong>
              <span>Avg. rating</span>
            </div>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-circle hero-circle-one" />
          <div className="hero-circle hero-circle-two" />

          <div className="floating-product-card card-back">
            <span>01</span>
            <div className="floating-image">
              {products[1]?.thumbnail && (
                <img src={products[1].thumbnail} alt="" />
              )}
            </div>
          </div>

          <div className="floating-product-card card-front">
            <span>NEW ARRIVAL</span>

            <div className="floating-image large">
              {products[0]?.thumbnail && (
                <img src={products[0].thumbnail} alt="" />
              )}
            </div>

            <strong>{products[0]?.brand || 'SHOPLY'}</strong>
            <small>{products[0]?.title || 'Curated products'}</small>
          </div>

          <div className="hero-sticker">
            <span>GOOD</span>
            <strong>STUFF</strong>
            <span>ONLY</span>
          </div>
        </div>
      </section>

      {/* ================= TOOLBAR ================= */}

      <section className="catalog-section">
        <div className="catalog-heading">
          <div>
            <span className="eyebrow">THE COLLECTION</span>
            <h2>Shop the edit</h2>
          </div>

          <div className="collection-meta">
            <span className="live-dot" />
            <span>
              {loading
                ? 'Updating collection'
                : `${filteredProducts.length} products on this page`}
            </span>
          </div>
        </div>

        {/* SEARCH */}

        <div className="search-row">
          <div className="search-box">
            <span className="search-symbol">⌕</span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, brands or categories..."
              aria-label="Search products"
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch('')}
                type="button"
              >
                ×
              </button>
            )}
          </div>

          <button
            className="mobile-filter-button"
            type="button"
            onClick={() => setMobileFiltersOpen((current) => !current)}
          >
            <span>☷</span>
            Filters
          </button>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as SortOption)
            }
            aria-label="Sort products"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating: Highest</option>
            <option value="discount">Discount: Highest</option>
          </select>
        </div>

        {/* FILTERS */}

        <div
          className={`filter-panel ${
            mobileFiltersOpen ? 'filter-panel-open' : ''
          }`}
        >
          <div className="filter-group">
            <span className="filter-label">Category</span>

            <div className="filter-pills">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-pill ${
                    category === item ? 'active' : ''
                  }`}
                  onClick={() => setCategory(item)}
                >
                  {item === 'all'
                    ? 'All products'
                    : formatLabel(item)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Brand</span>

            <div className="filter-pills">
              {brands.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-pill ${
                    brand === item ? 'active' : ''
                  }`}
                  onClick={() => setBrand(item)}
                >
                  {item === 'all'
                    ? 'All brands'
                    : formatLabel(item)}
                </button>
              ))}
            </div>
          </div>

          {(search ||
            category !== 'all' ||
            brand !== 'all' ||
            sortBy !== 'featured') && (
            <button
              className="clear-filters"
              type="button"
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* ================= PRODUCT GRID ================= */}

        {error ? (
          <div className="state-box error-box">
            <div className="state-icon">!</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setError('')
                setPage((current) => current)
              }}
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="product-grid">
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="state-box">
            <div className="state-icon">⌕</div>
            <h3>No products found</h3>
            <p>
              Nothing matches your current filters. Try searching for
              something else.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={clearFilters}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlist.includes(product.id)}
                onWishlist={toggleWishlist}
                onOpen={openProduct}
              />
            ))}
          </div>
        )}

        {/* ================= PAGINATION ================= */}

        {!loading && !error && (
          <div className="pagination-area">
            <button
              type="button"
              className="pagination-arrow"
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
            >
              ←
            </button>

            <div className="pagination-pages">
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1,
              ).map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={`page-number ${
                    page === pageNumber ? 'active' : ''
                  }`}
                  onClick={() => changePage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="pagination-arrow"
              disabled={page === totalPages}
              onClick={() => changePage(page + 1)}
            >
              →
            </button>
          </div>
        )}
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark">S</span>
          <strong>SHOPLY</strong>
        </div>

        <p>
          A little corner of the internet for things worth buying.
        </p>

        <span className="footer-note">BUILT WITH REACT + TYPESCRIPT</span>
      </footer>

      {/* ================= PRODUCT MODAL ================= */}

      {selectedProduct && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeProduct()
            }
          }}
        >
          <div className="product-modal">
            <button
              className="modal-close"
              type="button"
              onClick={closeProduct}
              aria-label="Close product"
            >
              ×
            </button>

            <div className="modal-gallery">
              <div className="modal-main-image">
                <img
                  src={selectedImage || selectedProduct.thumbnail}
                  alt={selectedProduct.title}
                />
              </div>

              <div className="modal-thumbnails">
                {[selectedProduct.thumbnail, ...selectedProduct.images]
                  .filter(
                    (image, index, array) =>
                      array.indexOf(image) === index,
                  )
                  .map((image) => (
                    <button
                      type="button"
                      key={image}
                      className={
                        selectedImage === image ? 'selected' : ''
                      }
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt=""
                      />
                    </button>
                  ))}
              </div>
            </div>

            <div className="modal-content">
              <div className="modal-topline">
                <span>{formatLabel(selectedProduct.category)}</span>

                <span>#{selectedProduct.id}</span>
              </div>

              <h2>{selectedProduct.title}</h2>

              <p className="modal-description">
                {selectedProduct.description}
              </p>

              <div className="modal-rating">
                <span className="stars">
                  {renderStars(selectedProduct.rating)}
                </span>

                <strong>{selectedProduct.rating.toFixed(2)}</strong>

                <span>customer rating</span>
              </div>

              <div className="modal-price">
                <strong>
                  ${getDiscountedPrice(selectedProduct).toFixed(2)}
                </strong>

                <del>${selectedProduct.price.toFixed(2)}</del>

                <span>
                  {Math.round(selectedProduct.discountPercentage)}%
                  OFF
                </span>
              </div>

              <div className="modal-info-grid">
                <div>
                  <span>BRAND</span>
                  <strong>{selectedProduct.brand}</strong>
                </div>

                <div>
                  <span>STOCK</span>
                  <strong>{selectedProduct.stock} units</strong>
                </div>

                <div>
                  <span>CATEGORY</span>
                  <strong>{selectedProduct.category}</strong>
                </div>

                <div>
                  <span>SKU</span>
                  <strong>SHOP-{selectedProduct.id}</strong>
                </div>
              </div>

              <button
                className={`modal-wishlist ${
                  wishlist.includes(selectedProduct.id)
                    ? 'saved'
                    : ''
                }`}
                type="button"
                onClick={() => toggleWishlist(selectedProduct.id)}
              >
                {wishlist.includes(selectedProduct.id)
                  ? '♥ Saved to wishlist'
                  : '♡ Add to wishlist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getDiscountedPrice(product: Product) {
  return product.price * (1 - product.discountPercentage / 100)
}

function formatLabel(value: string) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function renderStars(rating: number) {
  const rounded = Math.round(rating)

  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded)
}

function ProductSkeleton() {
  return (
    <article className="product-card skeleton-card">
      <div className="skeleton skeleton-image" />

      <div className="skeleton-body">
        <div className="skeleton skeleton-small" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-title short" />
        <div className="skeleton skeleton-description" />
        <div className="skeleton skeleton-price" />
      </div>
    </article>
  )
}

export default App