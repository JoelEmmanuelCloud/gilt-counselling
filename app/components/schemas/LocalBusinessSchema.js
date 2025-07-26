// components/schemas/LocalBusinessSchema.js
export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://giltcounselling.com",
    "name": "Gilt Counselling",
    "description": "Professional counselling services for teens, youth, and families",
    "url": "https://giltcounselling.com",
    "telephone": "+234 803 309 4050",
    "email": "support@giltcounselling.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "88 Woji Road, GRA Phase 2",
      "addressLocality": "Your City",
      "addressRegion": "Port Harcourt",
      "postalCode": "500272",
      "addressCountry": "Nigeria"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.7128",
      "longitude": "-74.0060"
    },
    "openingHours": [
      "Mo-Fr 09:00-18:00",
      "Sa 10:00-16:00"
    ],
    "priceRange": "$100-$150",
    "image": "https://giltcounselling.com/images/logo.png"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}