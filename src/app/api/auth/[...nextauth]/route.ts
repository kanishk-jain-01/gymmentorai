import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import { Session } from "next-auth";

// Extend the Session type to include user.id
interface ExtendedSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
  };
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async jwt({ token, user }) {
      // If the user object is available (usually on sign-in), add the id to the token
      if (user) {
        token.sub = user.id;
        console.log('Setting user ID in JWT token:', user.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Add the user ID to the session
        (session.user as any).id = token.sub;
        console.log('Setting user ID in session:', token.sub);
      } else {
        console.warn('Unable to set user ID in session. Token:', token, 'Session:', session);
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV !== 'production',
});

export { handler as GET, handler as POST }; 