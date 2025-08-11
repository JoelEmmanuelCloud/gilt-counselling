// app/contact/page.js
import ContactForm from '@/components/forms/ContactForm'
import Image from 'next/image'

export const metadata = {
  title: 'Contact Us - Gilt Counselling',
  description: 'Get in touch with Dr. Ugwu and the Gilt Counselling team. We\'re here to answer your questions and help you get started.',
}

export default function ContactPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cream to-white">
        <div className="container-max section-padding">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-deepBlue mb-6">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-600">
              Have questions about our services? Ready to schedule a consultation? 
              We're here to help you take the first step toward positive change.
            </p>
          </div>
        </div>
      </section>

      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="font-playfair text-2xl font-bold text-deepBlue mb-6">
              Send Us a Message
            </h2>
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Office Info */}
            <div className="bg-cream rounded-xl p-6">
              <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
                Office Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-gold text-xl">📍</span>
                  <div>
                    <p className="font-medium text-deepBlue">Address</p>
                    <p className="text-gray-600">
                      No 88 Woji Road, GRA Phase 2<br />
                      Port Harcourt<br />
                      Rivers State, Nigeria
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-gold text-xl">📞</span>
                  <div>
                    <p className="font-medium text-deepBlue">Phone</p>
                    <a href="tel:+234 803 309 4050" className="text-gray-600 hover:text-gold transition-colors">
                      +234 803 309 4050
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-gold text-xl">✉️</span>
                  <div>
                    <p className="font-medium text-deepBlue">Email</p>
                    <a href="mailto:wecare@giltcounselling.com" className="text-gray-600 hover:text-gold transition-colors">
                      wecare@giltcounselling.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
                Office Hours
              </h3>
              <div className="space-y-2">
                {[
                  { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
                  { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
                  { day: 'Sunday', hours: 'Closed' },
                  { day: 'Emergency Line', hours: '24/7 Available' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-deepBlue font-medium">{item.day}</span>
                    <span className="text-gray-600">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="font-playfair text-xl font-semibold text-red-800 mb-3">
                Crisis Support
              </h3>
              <p className="text-red-700 mb-4">
                If you or someone you know is experiencing a mental health emergency, 
                please contact emergency services immediately and take the to the hospital.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}