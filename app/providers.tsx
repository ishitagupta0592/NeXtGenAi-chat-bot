"use client";

// Simple provider wrapper (Supabase doesn't need a context provider like NextAuth)
export function Providers({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
