import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Instagram from "next-auth/providers/instagram"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    Instagram({
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Normalize email to lowercase
        const normalizedEmail = (credentials.email as string).toLowerCase().trim()

        const user = await db.user.findUnique({
          where: {
            email: normalizedEmail
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isCorrectPassword) {
          return null
        }

        return {
          id: user.id, // Return as number to match our User type definition
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        } as any
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // ID is already a number from our authorize function
        token.id = user.id
        token.role = user.role

        // No need to fetch role again - it's already included
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as number,
          role: token.role as UserRole,
        },
      }
    },
  },
  events: {
    async linkAccount({ user }) {
      // When a social account is linked, verify the email
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id
      await db.user.update({
        where: { id: userId as number },
        data: { emailVerified: new Date() }
      })
    },
  },
})
