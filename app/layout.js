//app/layout.js
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import { AuthProvider } from './lib/auth-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair'
})

export const metadata = {
  metadataBase: new URL('https://giltcounselling.com'),
  title: {
    default: 'Gilt Counselling - Professional Teen & Family Therapy',
    template: '%s | Gilt Counselling'
  },
  description: 'Expert counselling services for teenagers, youth, and families. Dr. Ugwu provides compassionate mental health support in a safe environment.',
  keywords: ['counselling', 'therapy', 'teen mental health', 'family therapy', 'adolescent counselling'],
  authors: [{ name: 'Dr. Ugwu', url: 'https://giltcounselling.com/about' }],
  creator: 'Gilt Counselling',
  publisher: 'Gilt Counselling',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://giltcounselling.com',
    siteName: 'Gilt Counselling',
    title: 'Gilt Counselling - Professional Teen & Family Therapy',
    description: 'Expert counselling services for teenagers, youth, and families.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gilt Counselling - Professional Teen & Family Therapy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gilt Counselling - Professional Teen & Family Therapy',
    description: 'Expert counselling services for teenagers, youth, and families.',
    images: ['/images/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-inter bg-cream text-deepBlue">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}