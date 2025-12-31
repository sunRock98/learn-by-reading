import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

const LoginPage = () => {
  return (
    <div className='from-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-b p-6 md:p-10'>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default LoginPage;
