import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // We check against the env variables we just created
        if (
          credentials?.username === process.env.ADMIN_USER &&
          credentials?.password === process.env.ADMIN_PASS
        ) {
          return { id: "1", name: "Recruiter Admin", email: "admin@cuemath.com" }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login', // Redirects here if not logged in
  },
  session: {
    strategy: "jwt",
  }
})

export { handler as GET, handler as POST }