import { HomeEditorPreviewSection } from '../components/home/home-editor-preview-section'
import { HomeHero } from '../components/home/home-hero'
import { HomeTrendsSection } from '../components/home/home-trends-section'

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeTrendsSection />
      <HomeEditorPreviewSection />
    </>
  )
}
