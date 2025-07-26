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
    default: 'Gilt Counselling – Youth & Family Therapy Services',
    template: '%s | Gilt Counselling'
  },
  description:
    'Gilt Counselling provides professional therapy and mental health services for teenagers, youths, and families. Discover compassionate, growth-centered counselling in a safe, supportive space.',
  keywords: [
    'youth counselling',
    'teen therapy',
    'mental health support',
    'family therapy',
    'adolescent development',
    'Gilt Counselling'
  ],
  authors: [{ name: 'Gilt Counselling', url: 'https://giltcounselling.com/about' }],
  creator: 'Gilt Counselling',
  publisher: 'Gilt Counselling',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://giltcounselling.com',
    siteName: 'Gilt Counselling',
    title: 'Gilt Counselling – Youth & Family Therapy Services',
    description:
      'Expert mental health support for teenagers, youths, and families, delivered in a supportive and professional setting.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gilt Counselling - Safe, Professional, Compassionate',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gilt Counselling – Therapy for Teens & Families',
    description:
      'Discover expert counselling for youth, teens, and families with Gilt Counselling.',
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