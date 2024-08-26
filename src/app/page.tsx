import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Home() {
  return (
    <main className='flex h-full flex-col items-center justify-center bg-gradient-to-tr from-blue-400 via-violet-600 to-blue-800'>
      <div className='space-y-6 text-center'>
        <h1
          className={cn(
            "text-6xl font-semibold text-white drop-shadow-md",
            font.className
          )}
        >
          🔐 Auth Test branch
        </h1>
        <p className='text-lg text-white'>A simple authentication service</p>
        <div>
          <LoginButton>
            <Button variant='secondary' size='lg'>
              Sing in
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
