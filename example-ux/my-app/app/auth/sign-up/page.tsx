"use client";

import type React from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/onboarding`,
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;

      // Create profile entry
      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
        });
      }

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='from-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-b p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <div className='flex flex-col gap-6'>
          <div className='mb-4 flex items-center justify-center gap-2'>
            <BookOpen className='text-primary h-8 w-8' />
            <span className='text-2xl font-bold'>Read2Learn</span>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl'>Create Account</CardTitle>
              <CardDescription>
                Start your language learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className='flex flex-col gap-6'>
                  <div className='grid gap-2'>
                    <Label htmlFor='fullName'>Full Name</Label>
                    <Input
                      id='fullName'
                      type='text'
                      placeholder='John Doe'
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      placeholder='m@example.com'
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='password'>Password</Label>
                    <Input
                      id='password'
                      type='password'
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='repeat-password'>Repeat Password</Label>
                    <Input
                      id='repeat-password'
                      type='password'
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className='text-destructive text-sm'>{error}</p>}
                  <Button type='submit' className='w-full' disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign up"}
                  </Button>
                </div>
                <div className='mt-4 text-center text-sm'>
                  Already have an account?{" "}
                  <Link
                    href='/auth/login'
                    className='underline underline-offset-4'
                  >
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
