import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Navbar } from "./navbar";

const AuthProvider = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <div className='min-h-screen bg-indigo-50 transition-colors duration-300 dark:bg-gray-950'>
        <Navbar />
        <main className='container mx-auto py-12'>{children}</main>
      </div>
    </SessionProvider>
  );
};

export default AuthProvider;
