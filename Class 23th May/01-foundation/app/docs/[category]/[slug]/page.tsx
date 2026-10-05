import React from 'react'

// @ts-ignore
const SlugPage = async ({params}: { params: Promise<{ category: string, slug: string }> }) => {
  const { slug, category } = await params;
  return (
    <div>SlugPage: {category}/{slug}</div>
  )
}

export default SlugPage;