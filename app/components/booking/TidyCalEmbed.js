// src/app/services/page.js
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Counselling Services - Gilt Counselling',
  description: 'Comprehensive counselling services for teens, families, and parents. Individual therapy, family sessions, group therapy, and mental health advocacy.',
}

export default function ServicesPage() {
  const services = [
    {
      id: 'teen-counselling',
      title: 'Individual Teen Counselling',
      description: 'One-on-one sessions tailored to address the unique challenges faced by teenagers.',
      image: '/images/teen-counselling.jpg',
      duration: '50 minutes',
      price: '$120',
      features: [
        'Identity development and self-esteem building',
        'Anxiety and depression management',
        'Social skills and peer relationship guidance',
        'Academic stress and performance anxiety',
        'Family conflict resolution',
        'Coping strategies for life transitions'
      ],
      approach: 'Cognitive Behavioral Therapy (CBT), Dialectical Behavior Therapy (DBT), and Person-Centered approaches tailored to each teen\'s needs.'
    },
    {
      id: 'family-therapy',
      title: 'Family Therapy Sessions',
      description: 'Collaborative sessions to strengthen family bonds and improve communication.',
      image: '/images/family-therapy.jpg',
      duration: '75 minutes',
      price: '$150',
      features: [
        'Improved family communication patterns',
        'Conflict resolution and mediation',
        'Parenting strategy development',
        'Setting healthy boundaries',
        'Understanding family dynamics',
        'Crisis intervention and support'
      ],
      approach: 'Family Systems Therapy, Structural Family Therapy, and Solution-Focused approaches to address whole-family dynamics.'
    },
    {
      id: 'parent-coaching',
      title: 'Parent Coaching & Support',
      description: 'Guidance and support for parents navigating the complexities of raising teenagers.',
      image: '/images/parent-coaching.jpg',
      duration: '60 minutes',
      price: '$100',
      features: [
        'Understanding adolescent development',
        'Effective communication strategies',
        'Setting appropriate boundaries',
        'Managing challenging behaviors',
        'Supporting teen mental health',
        'Building stronger parent-teen relationships'
      ],
      approach: 'Psychoeducational approach combined with practical strategies and emotional support for parents.'
    },
    {
      id: 'group-therapy',
      title: 'Teen Group Therapy',
      description: 'Peer support groups for teenagers facing similar challenges.',
      image: '/images/group-session.jpg',
      duration: '90 minutes',
      price: '$60',
      features: [
        'Peer support and connection',
        'Social skills development',
        'Shared experiences and learning',
        'Reduced isolation and stigma',
        'Leadership and empathy building',
        'Cost-effective therapy option'
      ],
      approach: 'Group process therapy with structured activities and peer support facilitation.'
    }
  ]

  const specialPrograms = [
    {
      title: 'Crisis Intervention',
      description: 'Immediate support for families facing mental health emergencies.',
      availability: '24/7 Emergency Line'
    },
    {
      title: 'School Consultation',
      description: 'Collaboration with schools to support student mental health.',
      availability: 'By Appointment'
    },
    {
      title: 'Community Outreach',
      description: 'Educational workshops and mental health advocacy programs.',
      availability: 'Monthly Programs'
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cream to-white">
        <div className="container-max section-padding">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-deepBlue mb-6">
              Professional Counselling Services
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive mental health support designed specifically for teens, families, 
              and parents navigating life's challenges together.
            </p>
            <Link href="/booking" className="btn-primary">
              Book Your Session
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding">
        <div className="container-max">
          <div className="space-y-16">
            {services.map((service, index) => (
              <div key={service.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center space-x-4 mb-4">
                    <h2 className="font-playfair text-3xl font-bold text-deepBlue">
                      {service.title}
                    </h2>
                    <div className="bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {service.price}
                    </div>
                  </div>
                  
                  <p className="text-lg text-gray-600 mb-6">
                    {service.description}
                  </p>

                  <div className="mb-6">
                    <h3 className="font-semibold text-deepBlue mb-3">What's Included:</h3>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-2 h-2 bg-gold rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-cream p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-deepBlue mb-2">Therapeutic Approach:</h4>
                    <p className="text-sm text-gray-600">{service.approach}</p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                    <span>⏱️ {service.duration}</span>
                    <span>📅 Flexible Scheduling</span>
                    <span>💻 In-Person & Virtual</span>
                  </div>

                  <Link href="/booking" className="btn-primary">
                    Book This Service
                  </Link>
                </div>

                {/* Image */}
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className="relative h-64 lg:h-96 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Programs */}
      <section className="bg-cream section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl font-bold text-deepBlue mb-4">
              Additional Support Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Beyond traditional counselling, we offer specialized programs to support 
              our community's mental health needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialPrograms.map((program, index) => (
              <div key={index} className="card text-center">
                <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-3">
                  {program.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {program.description}
                </p>
                <div className="text-sm text-gold font-semibold">
                  {program.availability}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance & Payment */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-playfair text-3xl font-bold text-deepBlue mb-8 text-center">
              Insurance & Payment Options
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="font-semibold text-deepBlue mb-4">Accepted Insurance</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>✓ Blue Cross Blue Shield</li>
                  <li>✓ Aetna</li>
                  <li>✓ Cigna</li>
                  <li>✓ UnitedHealthcare</li>
                  <li>✓ Most PPO Plans</li>
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                  We'll help verify your coverage and explain your benefits.
                </p>
              </div>

              <div className="card">
                <h3 className="font-semibold text-deepBlue mb-4">Payment Methods</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>✓ Cash & Check</li>
                  <li>✓ Credit & Debit Cards</li>
                  <li>✓ HSA/FSA Accounts</li>
                  <li>✓ Payment Plans Available</li>
                  <li>✓ Sliding Scale for Qualified Families</li>
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                  Financial concerns shouldn't prevent access to mental healthcare.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-deepBlue text-white section-padding">
        <div className="container-max text-center">
          <h2 className="font-playfair text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Choose the service that best fits your needs and take the first step 
            toward positive change for you and your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-primary bg-gold hover:bg-yellow-600">
              Book a Session
            </Link>
            <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-deepBlue">
              Ask Questions First
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}