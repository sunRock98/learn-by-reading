import { UserButton } from "@/components/auth/user-button";

export const Navbar = () => {
  return (
    <header className='sticky top-0 z-50 w-full border-b border-indigo-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-indigo-950 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/60'>
      <div className='container flex h-16 items-center justify-between'>
        <div className='flex items-center gap-6'>
          <a className='flex items-center space-x-2' href='/'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500'>
              <span className='font-bold text-white'>R2L</span>
            </div>
            <span className='text-xl font-bold text-indigo-900 dark:text-indigo-100'>
              Read2Learn
            </span>
          </a>
        </div>
        <div className='flex items-center gap-4'>
          <UserButton />
        </div>
      </div>
    </header>
  );
};
