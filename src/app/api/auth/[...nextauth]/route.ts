import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { ExtendedSession } from '@/types';

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
      // Always allow sign-in first
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
  events: {
    // Set up trial period after the user is created
    async createUser({ user }) {
      try {
        if (user.id) {
          // Calculate trial end date directly
          const trialEndDate = new Date();
          const TRIAL_DAYS = parseInt(process.env.TRIAL_DAYS || '7', 10);
          trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);
          
          // Use raw query to update the user to avoid TypeScript errors
          await prisma.$executeRaw`
            UPDATE "User" 
            SET "trialEndsAt" = ${trialEndDate} 
            WHERE id = ${user.id}
          `;
          
          console.log(`Trial period set up for user ${user.id} until ${trialEndDate}`);
        }
      } catch (error) {
        console.error('Error setting up trial period:', error);
      }
    }
  },
  debug: false, // Set to false to disable debug messages
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 