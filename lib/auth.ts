import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        organizationName: { label: 'Organization Name', type: 'text' },
        plan: { label: 'Plan', type: 'text' },
        isSignup: { label: 'Is Signup', type: 'hidden' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const isSignup = credentials.isSignup === 'true'

        if (isSignup) {
          // Sign up flow
          if (!credentials.organizationName) {
            throw new Error('Organization name is required for signup')
          }

          // Check if user already exists
          const existingUser = await (prisma as any).user.findUnique({
            where: { email: credentials.email }
          })

          if (existingUser) {
            throw new Error('User already exists')
          }

          // Create organization first
          const selectedPlan = credentials.plan || 'trial'
          const organization = await (prisma as any).organization.create({
            data: {
              name: credentials.organizationName,
              plan: selectedPlan,
              trialEndsAt: selectedPlan === 'trial' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null, // 14 days trial for trial plan only
              status: selectedPlan === 'trial' ? 'trial' : 'active'
            }
          })

          // Create user with organization
          const hashedPassword = await bcrypt.hash(credentials.password, 12)
          const user = await (prisma as any).user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0], // Default name from email
              organizationId: organization.id,
              role: 'ADMIN', // First user is admin
            }
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            organizationId: organization.id,
            role: user.role,
          }
        } else {
          // Sign in flow
          const user = await (prisma as any).user.findUnique({
            where: { email: credentials.email },
            include: { organization: true }
          })

          if (!user) {
            return null
          }

          // For demo purposes, we'll skip password verification for existing demo user
          if (user.email === 'demo@vervidai.com') {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              organizationId: user.organizationId,
              role: user.role,
            }
          }

          // For production, you'd verify password here
          // const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          // if (!isPasswordValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            organizationId: user.organizationId,
            role: user.role,
          }
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // For new signups, user might not have organizationId yet
        token.organizationId = (user as any).organizationId || null
        token.role = (user as any).role || 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.organizationId = token.organizationId as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Handle Google OAuth signup
        const existingUser = await (prisma as any).user.findUnique({
          where: { email: user.email! }
        })

        if (!existingUser) {
          // Create organization for new Google user
          const organization = await (prisma as any).organization.create({
            data: {
              name: `${user.name}'s Business`,
              plan: 'trial',
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            }
          })

          // Update user with organization
          await (prisma as any).user.update({
            where: { email: user.email! },
            data: {
              organizationId: organization.id,
              role: 'ADMIN'
            }
          })
        }
      }
      return true
    }
  },
  pages: {
    signIn: '/login',
  },
}