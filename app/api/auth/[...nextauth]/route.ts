import prisma from "@/lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { redirect } from "next/dist/server/api-utils";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    async signIn(params) {
      if (
        !params.user.email ||
        !params.user.name ||
        !params.account?.provider
      ) {
        return false;
      }
      const user = await prisma.user.findUnique({
        where:{
            email:params.user.email
        }
      })

      if(user){
        return true
      }

      await prisma.user.create({
        data: {
          email: params.user.email,
          name: params.user.name,
          provider: params.account?.provider,
        },
      });
      return true
    },
  },
});

export { handler as GET, handler as POST };
