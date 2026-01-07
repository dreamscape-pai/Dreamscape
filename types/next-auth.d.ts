import { UserRole } from '@prisma/client'
import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: number
      role?: UserRole
    } & DefaultSession['user']
  }

  interface User {
    id: number
    role?: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number
    role?: UserRole
  }
}
