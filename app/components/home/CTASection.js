//components/home/CTASection.js
import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="bg-deepBlue text-white">
      <div className="container-max section-padding">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="font-playfair text-3xl lg:text-4xl font-bold mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Take the first step towards positive change. Book a consultation today and 
            discover how we can support you and your family.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-primary bg-gold hover:bg-yellow-600">
              Book Your First Session
            </Link>
            <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-deepBlue">
              Get In Touch
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-8 pt-8 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-gold">🕒</span>
              <span>Mon-Fri 9AM-6PM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}