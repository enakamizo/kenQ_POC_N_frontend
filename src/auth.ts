import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import axios from "axios";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      company_user_name?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    company_user_name?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    company_user_name?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        company_user_name: { label: "ユーザー名", type: "text" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        try {
          // 現在はauth_testのバックエンドを使用
          // 新しいバックエンドができたら、このURLを置き換える
          console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            company_user_name: credentials?.company_user_name,
            password: credentials?.password,
          });

          const user = res.data;
          if (user) {
            return { 
              id: user.id, 
              name: user.name, 
              company_user_name: credentials?.company_user_name 
            };
          }
          return null;
        } catch (error) {
          console.error("認証エラー:", error);
          return null;
        }
      },
    }),
  ],

  session: {
  strategy: "jwt",
  maxAge: 60 * 60 * 12,
  },
  jwt: {
    maxAge: 60 * 60 * 12,
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.company_user_name = user.company_user_name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.company_user_name = token.company_user_name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};