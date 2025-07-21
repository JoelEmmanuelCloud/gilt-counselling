// components/home/ServicesPreview.js
import Link from 'next/link'

export default function ServicesPreview() {
  const services = [
    {
      title: "Teen Counselling",
      description: "Individual sessions focused on adolescent challenges, identity development, and emotional regulation.",
      icon: "👥",
      features: ["Identity & Self-Esteem", "Anxiety & Depression", "Social Skills", "Academic Stress"]
    },
    {
      title: "Family Therapy",
      description: "Collaborative sessions to improve communication and strengthen family relationships.",
      icon: "🏠",
      features: ["Communication Skills", "Conflict Resolution", "Parenting Support", "Family Dynamics"]
    },
    {
      title: "Parent Coaching",
      description: "Guidance for parents navigating the complexities of raising teenagers and young adults.",
      icon: "🤝",
      features: ["Parenting Strategies", "Setting Boundaries", "Supporting Mental Health", "Crisis Management"]
    }
  ]

  return (
    <section className="bg-white">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-deepBlue mb-4">
            Comprehensive Counselling Services
          </h2>
          <p className="text-lg text-gray-600">
            Specialized support for teens, families, and parents through evidence-based approaches 
            and compassionate care.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="card group hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">{service.icon}</div>
              
              <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-3 group-hover:text-gold transition-colors">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {service.description}
              </p>

              <ul className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-500 flex items-center">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link 
                href="/services" 
                className="text-gold hover:text-yellow-600 font-medium text-sm transition-colors group-hover:underline"
              >
                Learn More →
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/services" className="btn-primary">
            View All Services
          </Link>
        </div>
      </div>
    </section>
  )
}
