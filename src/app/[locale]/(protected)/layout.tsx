import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { GuestDataSync } from "@/components/onboarding/guest-data-sync";

const AuthProvider = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <GuestDataSync />
      <div className='bg-background min-h-screen transition-colors duration-300'>
        <Navbar />
        <main className='container mx-auto py-4 sm:py-8 lg:py-12'>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
};

export default AuthProvider;
