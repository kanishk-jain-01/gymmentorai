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
        console.log('Setting user ID in session from database user:', user.id);
      } else {
        console.warn('Unable to set user ID in session. User:', user, 'Session:', session);
      }
      return session as ExtendedSession;
    },
    async signIn({ user, account, profile }) {
      // Log the sign-in attempt
      console.log('Sign-in attempt:', { 
        userId: user?.id, 
        email: user?.email,
        provider: account?.provider
      });
      
      // Always allow sign-in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Log the redirect
      console.log('Redirect callback:', { url, baseUrl });
      
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
  events: {
    async signIn(message) {
      console.log('User signed in:', message);
    },
    async signOut(message) {
      console.log('User signed out:', message);
    }
  },
  debug: process.env.NODE_ENV !== 'production',
  logger: {
    error(code, metadata) {
      console.error('NextAuth error:', { code, metadata });
    },
    warn(code) {
      console.warn('NextAuth warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth debug:', { code, metadata });
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 