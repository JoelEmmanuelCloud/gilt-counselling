import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import { emailTemplates } from '../../../lib/email-templates'

const client = new MongoClient(process.env.MONGODB_URI)
const clientPromise = client.connect()

const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    EmailProvider({
      server: {
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      },
      from: process.env.SENDGRID_FROM_EMAIL,
      // Use custom magic link template
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        try {
          // Extract user name if available from database
          const db = (await clientPromise).db()
          const user = await db.collection('users').findOne({ email })
          
          await emailTemplates.sendMagicLink({
            email,
            url,
            name: user?.name || 'User'
          })
        } catch (error) {
          console.error('Magic link email error:', error)
          throw new Error('Failed to send verification email')
        }
      }
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id
        session.user.role = user.role || 'user'
      }
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      if (user.email === process.env.ADMIN_EMAIL) {
        const db = (await clientPromise).db()
        await db.collection('users').updateOne(
          { email: user.email },
          { $set: { role: 'admin' } },
          { upsert: true }
        )
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
    error: '/auth/error', // Add custom error page
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', user.email)
    },
    async session({ session, token }) {
      // Session is active
      console.log('Session active for:', session.user?.email)
    }
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }