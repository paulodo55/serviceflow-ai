import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      organizationId?: string | null
      role?: string
    }
  }

  interface User {
    id: string
    organizationId?: string | null
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    organizationId?: string | null
    role?: string
  }
}
