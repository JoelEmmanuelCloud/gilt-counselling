//components/home/TestimonialsSection.js
export default function TestimonialsSection() {
  const testimonials = [
    {
    name: "Sarah M.",
    role: "Parent",
    content:
      "Gilt Counselling supported our family during a challenging time with our teenager. The sessions were compassionate, structured, and made a real difference. We started seeing positive changes within weeks.",
    rating: 5
    },
    {
      name: "Michael T.",
      role: "Teen Client",
      content:
        "I was struggling with anxiety and didn’t know how to talk about it. Gilt Counselling gave me a safe space to be myself. I feel more confident and in control now.",
      rating: 5
    }
    ,
    {
      name: "Jennifer K.",
      role: "Parent",
      content: "The family therapy sessions were transformative. We learned better communication skills and our home environment is so much more peaceful now.",
      rating: 5
    }
  ]

  return (
    <section className="bg-gradient-to-br from-cream to-white">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-deepBlue mb-4">
            What Families Are Saying
          </h2>
          <p className="text-lg text-gray-600">
            Real stories from teens and families who have found healing and growth through our services.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              {/* Stars */}
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-gold text-lg">★</span>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-600 mb-4 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-gold to-yellow-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold text-sm">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-deepBlue">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}