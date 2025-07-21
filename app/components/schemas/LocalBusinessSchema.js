// components/schemas/LocalBusinessSchema.js
export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://giltcounselling.com",
    "name": "Gilt Counselling",
    "description": "Professional counselling services for teens, youth, and families",
    "url": "https://giltcounselling.com",
    "telephone": "+1-123-456-7890",
    "email": "support@giltcounselling.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Wellness Drive, Suite 200",
      "addressLocality": "Your City",
      "addressRegion": "ST",
      "postalCode": "12345",
      "addressCountry": "US"
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