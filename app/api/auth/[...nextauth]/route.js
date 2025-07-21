//app/api/auth/[...nextauth]/route.js
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
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      session.user.role = user.role || 'user'
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
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }