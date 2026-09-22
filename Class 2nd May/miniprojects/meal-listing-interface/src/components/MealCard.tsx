export type Meal = {
  idMeal: string
  strMeal: string
  strDrinkAlternate: string | null
  strCategory: string
  strArea: string
  strInstructions: string
  strMealThumb: string
  strTags: string | null
  strYoutube: string | null
  strSource: string | null
  strImageSource: string | null
  strCreativeCommonsConfirmed: string | null
  dateModified: string | null
  id: number

  strIngredient1: string | null
  strIngredient2: string | null
  strIngredient3: string | null
  strIngredient4: string | null
  strIngredient5: string | null
  strIngredient6: string | null
  strIngredient7: string | null
  strIngredient8: string | null
  strIngredient9: string | null
  strIngredient10: string | null
  strIngredient11: string | null
  strIngredient12: string | null
  strIngredient13: string | null
  strIngredient14: string | null
  strIngredient15: string | null
  strIngredient16: string | null
  strIngredient17: string | null
  strIngredient18: string | null
  strIngredient19: string | null
  strIngredient20: string | null

  strMeasure1: string | null
  strMeasure2: string | null
  strMeasure3: string | null
  strMeasure4: string | null
  strMeasure5: string | null
  strMeasure6: string | null
  strMeasure7: string | null
  strMeasure8: string | null
  strMeasure9: string | null
  strMeasure10: string | null
  strMeasure11: string | null
  strMeasure12: string | null
  strMeasure13: string | null
  strMeasure14: string | null
  strMeasure15: string | null
  strMeasure16: string | null
  strMeasure17: string | null
  strMeasure18: string | null
  strMeasure19: string | null
  strMeasure20: string | null
}

type MealCardProps = {
  meal: Meal
}

function MealCard({ meal }: MealCardProps) {
  const ingredients = Array.from({ length: 20 }, (_, index) => {
    const ingredient =
      meal[`strIngredient${index + 1}` as keyof Meal]

    const measure =
      meal[`strMeasure${index + 1}` as keyof Meal]

    if (
      typeof ingredient !== 'string' ||
      !ingredient.trim()
    ) {
      return null
    }

    return {
      name: ingredient.trim(),
      measure:
        typeof measure === 'string'
          ? measure.trim()
          : '',
    }
  }).filter(
    (
      item,
    ): item is { name: string; measure: string } =>
      item !== null,
  )

  const instructions = meal.strInstructions
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((step) => step.trim())
    .filter(Boolean)

  const tags =
    meal.strTags
      ?.split(',')
      .map((tag) => tag.trim())
      .filter(Boolean) ?? []

  return (
    <article className="meal-card">
      <div className="meal-image-wrapper">
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="meal-image"
          loading="lazy"
        />

        <div className="image-overlay" />

        <div className="meal-badges">
          <span className="category-badge">
            {meal.strCategory}
          </span>

          <span className="area-badge">
            {meal.strArea}
          </span>
        </div>

        <span className="meal-number">
          #{meal.idMeal}
        </span>
      </div>

      <div className="meal-body">
        <div className="meal-heading">
          <div>
            <span className="recipe-label">
              {meal.strArea} CUISINE
            </span>

            <h3>{meal.strMeal}</h3>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="tag-list">
            {tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        <div className="meal-meta">
          <div className="meta-item">
            <span className="meta-icon">◉</span>

            <div>
              <small>Category</small>
              <strong>{meal.strCategory}</strong>
            </div>
          </div>

          <div className="meta-item">
            <span className="meta-icon">⌖</span>

            <div>
              <small>Origin</small>
              <strong>{meal.strArea}</strong>
            </div>
          </div>
        </div>

        <div className="ingredients-section">
          <div className="subsection-heading">
            <div>
              <span className="subsection-kicker">
                WHAT YOU NEED
              </span>
              <h4>Ingredients</h4>
            </div>

            <span className="ingredient-count">
              {ingredients.length} items
            </span>
          </div>

          <div className="ingredients-list">
            {ingredients.map((ingredient, index) => (
              <div
                className="ingredient-item"
                key={`${ingredient.name}-${index}`}
              >
                <span className="ingredient-dot">
                  {index + 1}
                </span>

                <span className="ingredient-name">
                  {ingredient.name}
                </span>

                {ingredient.measure && (
                  <span className="ingredient-measure">
                    {ingredient.measure}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="instructions-section">
          <div className="subsection-heading">
            <div>
              <span className="subsection-kicker">
                FROM PREP TO PLATE
              </span>
              <h4>Method</h4>
            </div>

            <span className="step-count">
              {instructions.length} steps
            </span>
          </div>

          <div className="instructions-list">
            {instructions.map((instruction, index) => (
              <div
                className="instruction-step"
                key={`${instruction.slice(0, 20)}-${index}`}
              >
                <span className="step-number">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <p>{instruction}</p>
              </div>
            ))}
          </div>
        </div>

        {meal.strDrinkAlternate && (
          <div className="drink-note">
            <span>🥂</span>

            <div>
              <small>PAIRING</small>
              <strong>{meal.strDrinkAlternate}</strong>
            </div>
          </div>
        )}

        <div className="meal-actions">
          {meal.strYoutube && (
            <a
              href={meal.strYoutube}
              target="_blank"
              rel="noopener noreferrer"
              className="action-button youtube-button"
            >
              <span className="youtube-icon">▶</span>
              Watch recipe
            </a>
          )}

          {meal.strSource && (
            <a
              href={meal.strSource}
              target="_blank"
              rel="noopener noreferrer"
              className="action-button source-button"
            >
              <span>↗</span>
              Original recipe
            </a>
          )}
        </div>

        <div className="meal-footer">
          <span>
            Recipe ID <strong>{meal.idMeal}</strong>
          </span>

          {meal.dateModified && (
            <span>
              Updated{' '}
              {new Date(
                meal.dateModified,
              ).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default MealCard