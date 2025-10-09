import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Login failed");
          }

          if (data.user && data.token) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              profileImage: data.user.profileImage,
              accessToken: data.token,
            };
          }

          return null;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Authentication failed";
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.profileImage = (user as { profileImage?: string }).profileImage;
      }
      // Handle session update
      if (trigger === "update" && session) {
        if ('name' in session) token.name = session.name;
        if ('profileImage' in session) token.profileImage = session.profileImage;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session as { accessToken?: string }).accessToken =
          token.accessToken as string;
        (session.user as { id?: string }).id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        (session.user as { profileImage?: string }).profileImage = token.profileImage as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
