// components/home/HeroSection.js
import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-cream to-white">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <h1 className="font-playfair text-4xl lg:text-5xl xl:text-6xl font-bold text-deepBlue leading-tight">
              Empowering Teens & Families Through 
              <span className="text-gold"> Compassionate Counselling</span>
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Dr. Ugwu provides professional counselling services specializing in 
              adolescent development, family dynamics, and mental health advocacy. 
              Creating safe spaces for growth and healing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/booking" className="btn-primary text-center">
                Book Your Session
              </Link>
              <Link href="/about" className="btn-secondary text-center">
                Meet Dr. Ugwu
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gold">5+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold">200+</div>
                <div className="text-sm text-gray-600">Families Helped</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold">98%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/hero-counselling.jpg"
                alt="Professional counselling session with teens and families"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
              <div className="text-sm text-gray-600">Available</div>
              <div className="text-lg font-semibold text-deepBlue">Mon-Fri</div>
              <div className="text-sm text-gold">9AM - 6PM</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}