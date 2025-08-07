//app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import { emailTemplates } from '../../../lib/email-templates'

const client = new MongoClient(process.env.MONGODB_URI)
const clientPromise = client.connect()

export const authOptions = {
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
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        try {
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
  // Add JWT configuration for middleware compatibility
  jwt: {
    // Even with database sessions, we need JWT for middleware
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      
      // If this is the initial sign in, add user info to token
      if (user) {
        token.role = user.role || 'user'
        token.id = user.id
      }
      
      // For existing tokens, we might need to refresh user data
      if (trigger === 'update' || !token.role) {
        try {
          const db = (await clientPromise).db()
          const dbUser = await db.collection('users').findOne({ email: token.email })
          if (dbUser) {
            token.role = dbUser.role || 'user'
            token.id = dbUser._id?.toString()
          }
        } catch (error) {
          console.error('Error refreshing user data in JWT:', error)
        }
      }
      
      return token
    },
    async session({ session, user, token }) {
  
      if (session?.user) {
        // When using database sessions, user data comes from the database
        if (user) {
          session.user.id = user.id
          session.user.role = user.role || 'user'
        }
        // Fallback to token data if available
        else if (token) {
          session.user.id = token.id || token.sub
          session.user.role = token.role || 'user'
        }
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
        // Update the user object so it's available in JWT callback
        user.role = 'admin'
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
    },
    async session({ session, token }) {
    }
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }