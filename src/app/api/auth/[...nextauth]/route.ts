import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import { Session } from "next-auth";
import { NextAuthOptions } from "next-auth";

// Extend the Session type to include user.id
interface ExtendedSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/signin", // Redirect to sign-in page with error
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async session({ session, user }) {
      // When using database sessions, we need to get the ID from the user parameter
      if (session.user && user) {
        (session.user as any).id = user.id;
      }
      return session as ExtendedSession;
    },
    async signIn({ user, account, profile }) {
      // Always allow sign-in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // If the URL starts with the base URL, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // If the URL is a relative URL, prepend the base URL
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Otherwise, return to the base URL
      return baseUrl;
    }
  },
  debug: false, // Set to false to disable debug messages
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 