import type { Cat } from '../App.tsx'

type CatCardProps = {
  cat: Cat
}

type RatingProps = {
  label: string
  value: number
  icon: string
}

type BooleanFactProps = {
  label: string
  value: number
  icon: string
}

function RatingBar({ label, value, icon }: RatingProps) {
  return (
    <div className="rating-item">
      <div className="rating-header">
        <span className="rating-label">
          <span className="rating-icon">{icon}</span>
          {label}
        </span>

        <span className="rating-value">
          {value}/5
        </span>
      </div>

      <div className="rating-bar">
        <div
          className="rating-fill"
          style={{ width: `${(value / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}

function BooleanFact({ label, value, icon }: BooleanFactProps) {
  const isTrue = value === 1

  return (
    <div className={`boolean-fact ${isTrue ? 'is-true' : 'is-false'}`}>
      <span className="boolean-icon">
        {isTrue ? '✓' : '✕'}
      </span>

      <span className="boolean-fact-icon">
        {icon}
      </span>

      <span>{label}</span>
    </div>
  )
}

function CatCard({ cat }: CatCardProps) {
  const temperament = cat.temperament
    .split(',')
    .map((item) => item.trim())

  return (
    <article className="cat-card">

      {/* =========================
          HERO SECTION
      ========================= */}

      <section className="cat-hero">

        <div className="image-wrapper">
          <img
            src={cat.image}
            alt={cat.name}
            className="cat-image"
          />

          <div className="image-badge">
            🐾 Breed #{cat.id}
          </div>
        </div>

        <div className="hero-info">

          <span className="eyebrow">
            ✨ Meet your new feline friend
          </span>

          <h2>{cat.name}</h2>

          {cat.alt_names && (
            <p className="alternative-name">
              Also known as <strong>{cat.alt_names}</strong>
            </p>
          )}

          <div className="location">
            <span>🌍</span>
            <span>{cat.origin}</span>
            <span className="country-code">
              {cat.country_code}
            </span>
          </div>

          <div className="quick-facts">

            <div className="quick-fact">
              <span className="quick-icon">⚖️</span>
              <div>
                <span>Weight</span>
                <strong>{cat.weight.metric} kg</strong>
              </div>
            </div>

            <div className="quick-fact">
              <span className="quick-icon">🎂</span>
              <div>
                <span>Life Span</span>
                <strong>{cat.life_span} years</strong>
              </div>
            </div>

            <div className="quick-fact">
              <span className="quick-icon">🏠</span>
              <div>
                <span>Indoor</span>
                <strong>{cat.indoor === 1 ? 'Yes' : 'No'}</strong>
              </div>
            </div>

          </div>

          <a
            href={cat.wikipedia_url}
            target="_blank"
            rel="noopener noreferrer"
            className="wiki-button"
          >
            <span>📖</span>
            Read more about {cat.name}
            <span>↗</span>
          </a>

        </div>
      </section>

      {/* =========================
          DESCRIPTION
      ========================= */}

      <section className="section description-section">

        <div className="section-heading">
          <span className="section-icon">📜</span>

          <div>
            <h3>About this cat</h3>
            <p>Everything you need to know</p>
          </div>
        </div>

        <p className="description">
          {cat.description}
        </p>

      </section>

      {/* =========================
          TEMPERAMENT
      ========================= */}

      <section className="section">

        <div className="section-heading">
          <span className="section-icon">💖</span>

          <div>
            <h3>Temperament</h3>
            <p>What this cat is like</p>
          </div>
        </div>

        <div className="temperament-tags">
          {temperament.map((trait) => (
            <span
              className="temperament-tag"
              key={trait}
            >
              🐾 {trait}
            </span>
          ))}
        </div>

      </section>

      {/* =========================
          RATINGS
      ========================= */}

      <section className="section">

        <div className="section-heading">
          <span className="section-icon">📊</span>

          <div>
            <h3>Personality & Lifestyle</h3>
            <p>Rated from 1 to 5</p>
          </div>
        </div>

        <div className="ratings-grid">

          <RatingBar
            label="Adaptability"
            value={cat.adaptability}
            icon="🌱"
          />

          <RatingBar
            label="Affection"
            value={cat.affection_level}
            icon="❤️"
          />

          <RatingBar
            label="Child Friendly"
            value={cat.child_friendly}
            icon="👶"
          />

          <RatingBar
            label="Dog Friendly"
            value={cat.dog_friendly}
            icon="🐶"
          />

          <RatingBar
            label="Energy Level"
            value={cat.energy_level}
            icon="⚡"
          />

          <RatingBar
            label="Grooming"
            value={cat.grooming}
            icon="✂️"
          />

          <RatingBar
            label="Health Issues"
            value={cat.health_issues}
            icon="🏥"
          />

          <RatingBar
            label="Intelligence"
            value={cat.intelligence}
            icon="🧠"
          />

          <RatingBar
            label="Shedding"
            value={cat.shedding_level}
            icon="🧹"
          />

          <RatingBar
            label="Social Needs"
            value={cat.social_needs}
            icon="👥"
          />

          <RatingBar
            label="Stranger Friendly"
            value={cat.stranger_friendly}
            icon="👋"
          />

          <RatingBar
            label="Vocalisation"
            value={cat.vocalisation}
            icon="🗣️"
          />

        </div>

      </section>

      {/* =========================
          BREED CHARACTERISTICS
      ========================= */}

      <section className="section">

        <div className="section-heading">
          <span className="section-icon">🧬</span>

          <div>
            <h3>Breed Characteristics</h3>
            <p>Special traits of this breed</p>
          </div>
        </div>

        <div className="boolean-grid">

          <BooleanFact
            label="Indoor Cat"
            value={cat.indoor}
            icon="🏠"
          />

          <BooleanFact
            label="Experimental"
            value={cat.experimental}
            icon="🧪"
          />

          <BooleanFact
            label="Hairless"
            value={cat.hairless}
            icon="🐱"
          />

          <BooleanFact
            label="Natural Breed"
            value={cat.natural}
            icon="🌿"
          />

          <BooleanFact
            label="Rare Breed"
            value={cat.rare}
            icon="💎"
          />

          <BooleanFact
            label="Rex"
            value={cat.rex}
            icon="〰️"
          />

          <BooleanFact
            label="Suppressed Tail"
            value={cat.suppressed_tail}
            icon="🐈"
          />

          <BooleanFact
            label="Short Legs"
            value={cat.short_legs}
            icon="🦵"
          />

          <BooleanFact
            label="Hypoallergenic"
            value={cat.hypoallergenic}
            icon="🌸"
          />

        </div>

      </section>

      {/* =========================
          EXTRA INFORMATION
      ========================= */}

      <section className="section extra-section">

        <div className="section-heading">
          <span className="section-icon">🔎</span>

          <div>
            <h3>More Details</h3>
            <p>Additional breed information</p>
          </div>
        </div>

        <div className="details-grid">

          <div className="detail-box">
            <span>🆔 Breed ID</span>
            <strong>{cat.id}</strong>
          </div>

          <div className="detail-box">
            <span>🌎 Country</span>
            <strong>{cat.country_code}</strong>
          </div>

          <div className="detail-box">
            <span>🏳️ Country Codes</span>
            <strong>{cat.country_codes}</strong>
          </div>

          <div className="detail-box">
            <span>⚖️ Imperial Weight</span>
            <strong>{cat.weight.imperial} lbs</strong>
          </div>

          <div className="detail-box">
            <span>⚖️ Metric Weight</span>
            <strong>{cat.weight.metric} kg</strong>
          </div>

          <div className="detail-box">
            <span>🎂 Life Expectancy</span>
            <strong>{cat.life_span} years</strong>
          </div>

        </div>

      </section>

      {/* =========================
          BOTTOM
      ========================= */}

      <div className="cat-card-bottom">
        <span>🐾</span>
        <span>There are always more cats to discover.</span>
        <span>🐾</span>
      </div>

    </article>
  )
}

export default CatCard