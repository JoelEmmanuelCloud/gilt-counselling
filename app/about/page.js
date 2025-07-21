//app/about/page.js
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'About Dr. Ugwu - Gilt Counselling',
  description: 'Learn about Dr. Ugwu\'s experience, qualifications, and approach to counselling teens, youth, and families.',
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cream to-white">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-deepBlue mb-6">
                Meet Dr. Ugwu
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                A passionate advocate for teen mental health with over 5 years of experience 
                helping families navigate the complexities of adolescent development.
              </p>
              <Link href="/booking" className="btn-primary">
                Schedule Consultation
              </Link>
            </div>
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/about-dr-ugwu.jpg"
                alt="Dr. Ugwu, Licensed Counsellor"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-playfair text-3xl font-bold text-deepBlue mb-8 text-center">
              Professional Background
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                Dr. Ugwu is a licensed professional counsellor specializing in adolescent and family therapy. 
                With a deep commitment to creating safe, nurturing environments for healing and growth, 
                she has dedicated her career to supporting teens, young adults, and their families through 
                life's most challenging transitions.
              </p>
              
              <p>
                Her approach combines evidence-based therapeutic techniques with cultural sensitivity and 
                genuine compassion. Dr. Ugwu believes that every individual has the capacity for positive 
                change when provided with the right support, tools, and understanding.
              </p>

              <p>
                Beyond individual and family counselling, Dr. Ugwu is actively involved in mental health 
                advocacy, working to reduce stigma and improve access to quality mental health services 
                for underserved communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Qualifications & Experience */}
      <section className="bg-cream section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Education */}
            <div>
              <h3 className="font-playfair text-2xl font-bold text-deepBlue mb-6">
                Education & Certifications
              </h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Ph.D. in Clinical Psychology",
                    institution: "University of Excellence",
                    year: "2018"
                  },
                  {
                    title: "M.A. in Counselling Psychology",
                    institution: "Graduate School of Mental Health",
                    year: "2015"
                  },
                  {
                    title: "Licensed Professional Counsellor (LPC)",
                    institution: "State Licensing Board",
                    year: "2019"
                  },
                  {
                    title: "Adolescent Therapy Specialist Certification",
                    institution: "Teen Mental Health Institute",
                    year: "2020"
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-deepBlue">{item.title}</h4>
                    <p className="text-gray-600">{item.institution}</p>
                    <p className="text-sm text-gold">{item.year}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div>
              <h3 className="font-playfair text-2xl font-bold text-deepBlue mb-6">
                Areas of Expertise
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Adolescent Development",
                  "Family Systems Therapy",
                  "Anxiety & Depression",
                  "Parent-Teen Relationships",
                  "Identity & Self-Esteem",
                  "Social Skills Development",
                  "Academic Stress Management",
                  "Crisis Intervention",
                  "Group Therapy",
                  "Mental Health Advocacy"
                ].map((specialty, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-gold rounded-full mr-3"></span>
                      <span className="text-deepBlue font-medium">{specialty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-playfair text-3xl font-bold text-deepBlue mb-8">
              Treatment Philosophy
            </h2>
            
            <blockquote className="text-xl italic text-gray-600 mb-8 leading-relaxed">
              "Every young person deserves to be heard, understood, and supported in their journey 
              toward emotional wellness. My role is to provide a safe space where teens and families 
              can explore their challenges, discover their strengths, and build resilience for the future."
            </blockquote>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                {
                  title: "Compassionate Care",
                  description: "Creating a warm, non-judgmental environment where clients feel safe to be vulnerable and authentic."
                },
                {
                  title: "Evidence-Based Practice",
                  description: "Utilizing proven therapeutic techniques tailored to each individual's unique needs and circumstances."
                },
                {
                  title: "Holistic Approach",
                  description: "Considering all aspects of a person's life - family, school, social, and cultural factors."
                }
              ].map((principle, index) => (
                <div key={index} className="card text-center">
                  <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-3">
                    {principle.title}
                  </h3>
                  <p className="text-gray-600">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Personal Touch Section */}
      <section className="bg-cream section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-playfair text-3xl font-bold text-deepBlue mb-8 text-center">
              A Personal Note from Dr. Ugwu
            </h2>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="text-lg leading-relaxed mb-6">
                  "My journey into counselling began with a deep desire to make a meaningful difference 
                  in the lives of young people and their families. Having witnessed firsthand the 
                  transformative power of compassionate, evidence-based therapy, I am committed to 
                  providing a sanctuary where healing can flourish."
                </p>
                
                <p className="leading-relaxed mb-6">
                  I understand that reaching out for help can feel overwhelming, especially for teenagers 
                  who may be experiencing these feelings for the first time. That's why I've made it my 
                  mission to create an environment where authenticity is welcomed, growth is celebrated, 
                  and every individual feels valued for who they are.
                </p>

                <p className="leading-relaxed">
                  When I'm not in session with clients, you can find me reading the latest research in 
                  adolescent psychology, spending time with my own family, or advocating for mental 
                  health awareness in our community. I believe that staying connected to both the 
                  scientific advances in our field and the human experiences that unite us all makes 
                  me a better therapist and person.
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-xl">DU</span>
                  </div>
                  <div>
                    <p className="font-semibold text-deepBlue">Dr. Ugwu</p>
                    <p className="text-sm text-gray-600">Licensed Professional Counsellor</p>
                    <p className="text-sm text-gold">Adolescent & Family Therapy Specialist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Memberships */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-playfair text-3xl font-bold text-deepBlue mb-8">
              Professional Memberships & Affiliations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  organization: "American Counseling Association",
                  abbreviation: "ACA",
                  status: "Active Member"
                },
                {
                  organization: "International Association for Marriage and Family Counselors",
                  abbreviation: "IAMFC",
                  status: "Professional Member"
                },
                {
                  organization: "Association for Specialists in Group Work",
                  abbreviation: "ASGW",
                  status: "Active Member"
                },
                {
                  organization: "American Association for Marriage and Family Therapy",
                  abbreviation: "AAMFT",
                  status: "Clinical Member"
                },
                {
                  organization: "National Association of Social Workers",
                  abbreviation: "NASW",
                  status: "Professional Member"
                },
                {
                  organization: "Teen Mental Health Collective",
                  abbreviation: "TMHC",
                  status: "Board Member"
                }
              ].map((membership, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-semibold text-deepBlue mb-2">{membership.abbreviation}</h4>
                  <p className="text-sm text-gray-600 mb-2">{membership.organization}</p>
                  <span className="inline-block px-2 py-1 bg-gold bg-opacity-10 text-gold text-xs rounded-full">
                    {membership.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-deepBlue text-white section-padding">
        <div className="container-max text-center">
          <h2 className="font-playfair text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Take the first step toward positive change. Schedule a consultation 
            to learn how we can support you and your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-primary bg-gold hover:bg-yellow-600">
              Book Consultation
            </Link>
            <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-deepBlue">
              Ask Questions
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}