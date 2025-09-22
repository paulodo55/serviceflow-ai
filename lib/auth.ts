import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

// Mock user database - replace with your actual database
const users = [
  {
    id: "1",
    email: "demo@vervidflow.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2ukD5/rO4W", // "password123"
    name: "Demo User",
  },
  {
    id: "2",
    email: "paulodo55@example.com",
    username: "paulodo55",
    password: "$2a$12$VfgkTBFcCieYiLKduW045.bwwDipxdKuxNzVhikM/K9zTX0i7.PFS", // "verviddemo123"
    name: "Paul Odo",
  },
  {
    id: "3",
    email: "odopaul55@gmail.com",
    username: "odopaul55",
    password: "$2a$12$VfgkTBFcCieYiLKduW045.bwwDipxdKuxNzVhikM/K9zTX0i7.PFS", // "verviddemo123"
    name: "Paul Odo",
  },
];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "serviceflow-fallback-secret-key-for-development-32-chars-minimum",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email or Username", type: "text", placeholder: "email@example.com or username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth authorize called with:', { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        // Find user by email or username
        const user = users.find((user) => 
          user.email === credentials.email || 
          (user as any).username === credentials.email
        );
        
        console.log('👤 User found:', user ? { id: user.id, email: user.email, name: user.name } : 'Not found');
        
        if (!user) {
          console.log('❌ User not found');
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);
        console.log('🔑 Password valid:', isPasswordValid);
        
        if (!isPasswordValid) {
          console.log('❌ Invalid password');
          return null;
        }

        console.log('✅ Login successful for:', user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || "serviceflow-fallback-secret-key-for-development-32-chars-minimum",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to ServiceFlow app dashboard after login
      if (url.startsWith("/")) {
        return `${baseUrl}/app`;
      }
      return `${baseUrl}/app`;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log("User signed in:", { user, account, profile });
    },
  },
};
