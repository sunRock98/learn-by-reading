"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Library, User, Plus, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className='bg-card/50 sticky top-0 z-50 border-b backdrop-blur-sm'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <Link href='/dashboard' className='flex items-center gap-2'>
            <BookOpen className='text-primary h-6 w-6' />
            <span className='text-xl font-bold'>Read2Learn</span>
          </Link>

          <nav className='flex items-center gap-2'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/dashboard'>
                <Library className='mr-2 h-4 w-4' />
                Courses
              </Link>
            </Button>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/generate'>
                <Plus className='mr-2 h-4 w-4' />
                Generate
              </Link>
            </Button>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/dictionary'>
                <BookOpen className='mr-2 h-4 w-4' />
                Dictionary
              </Link>
            </Button>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/profile'>
                <User className='mr-2 h-4 w-4' />
                Profile
              </Link>
            </Button>

            {mounted && (
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className='h-5 w-5' />
                ) : (
                  <Moon className='h-5 w-5' />
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <User className='h-5 w-5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
