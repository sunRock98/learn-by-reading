import { UserButton } from "@/components/auth/user-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export const Navbar = () => {
  return (
    <header className='glass-strong border-border/50 sticky top-0 z-50 w-full border-b'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-6'>
          <Link className='group flex items-center space-x-2.5' href='/'>
            <div className='gradient-bg flex h-9 w-9 items-center justify-center rounded-xl shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg'>
              <BookOpen className='h-5 w-5 text-white' />
            </div>
            <span className='text-xl font-bold tracking-tight transition-colors'>
              Read2Learn
            </span>
          </Link>
        </div>
        <div className='flex items-center gap-3'>
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
};
