import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Navbar } from "./navbar";

const AuthProvider = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <div className='flex h-full w-full flex-col items-center justify-center gap-y-10 bg-gradient-to-tr from-blue-400 via-violet-600 to-blue-800'>
        <Navbar />
        {children}
      </div>
    </SessionProvider>
  );
};

export default AuthProvider;
