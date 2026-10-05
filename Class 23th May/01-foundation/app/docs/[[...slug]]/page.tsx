import React from 'react'

// @ts-ignore
const SlugPage = async ({params}) => {
  const { slug } = await params;
  return (
    <div>SlugPage: {slug?.join("/")}</div>
  )
}

export default SlugPage