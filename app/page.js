// app/page.js
import HeroSection from './components/home/HeroSection'
import ServicesPreview from './components/home/ServicesPreview'
import TestimonialsSection from './components/home/TestimonialsSection'
import CTASection from './components/home/CTASection'

export default function HomePage() {
  
  return (
    <div>
      <HeroSection />
      <ServicesPreview />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}