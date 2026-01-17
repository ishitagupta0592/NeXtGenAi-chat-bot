import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";

export const authOptions: NextAuthOptions = {
    providers: [
        // Google Provider (DISABLED - needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
        // GoogleProvider({
        //     clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        // }),
        // Passwordless Email Sign In (Magic Links)
        // In Dev: Prints link to console. In Prod: Needs SMTP keys.
        EmailProvider({}),

        // GithubProvider({
        //     clientId: process.env.GITHUB_ID ?? "",
        //     clientSecret: process.env.GITHUB_SECRET ?? "",
        // }),
    ],
    adapter: SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    }),
    callbacks: {
        async session({ session, user }) {
            // Include user ID in session
            if (session.user) {
                (session.user as any).id = user.id;
            }
            return session;
        }
    },
};
