import ExploreCategories from "@/components/client/ExploreCategories"
import HeroSection from "@/components/client/HeroSection"
import OfferBanner from "@/components/client/OfferBanner"
import TopRatedItems from "@/components/client/TopRatedItems"
import React from 'react'

function Home() {
  return (
    <>
      <HeroSection />
      <ExploreCategories />
      <TopRatedItems />
      <OfferBanner />
    </>
  )
}

export default Home