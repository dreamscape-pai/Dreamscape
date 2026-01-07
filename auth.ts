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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // Normalize email to lowercase
        const normalizedEmail = (credentials.email as string).toLowerCase().trim()

        const user = await db.user.findUnique({
          where: {
            email: normalizedEmail
          }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: String(user.id), // NextAuth expects string ID, will be converted to number in JWT callback
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Parse ID to number - NextAuth may pass it as string
        const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id
        token.id = userId

        // Fetch role from database
        const dbUser = await db.user.findUnique({
          where: { id: userId },
          select: { role: true }
        })
        token.role = dbUser?.role
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Ensure ID is number
        session.user.id = typeof token.id === 'string' ? parseInt(token.id as string) : (token.id as number)
        session.user.role = token.role as UserRole
      }
      return session
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
