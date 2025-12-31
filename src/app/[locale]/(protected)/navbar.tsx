import { UserButton } from "@/components/auth/user-button";
import { ThemeToggle } from "@/components/theme-toggle";

export const Navbar = () => {
  return (
    <header className='border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-6'>
          <a className='flex items-center space-x-2' href='/'>
            <div className='bg-primary flex h-8 w-8 items-center justify-center rounded-lg'>
              <span className='text-primary-foreground font-bold'>R2L</span>
            </div>
            <span className='text-foreground text-xl font-bold'>
              Read2Learn
            </span>
          </a>
        </div>
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
};
