import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const AboutPage = () => {
  return (
    <>
      <div>page</div>
      <Link href={{
        pathname: '/contact',
        query: { name: "test" }
      }} transitionTypes={["fade"]} target="_blank">Contact</Link>

      {/* if we want to use image from other urls with hostname in url we need to configure next.config.ts */}

      {/* <Image 
        src="https://chaicode.com/assets/white-1-CYshgcRl.webp" 
        width={500}
        height={500}
        placeholder="blur"
        alt="Picture of the author"
      /> */}
    </>
  )
}

export default AboutPage