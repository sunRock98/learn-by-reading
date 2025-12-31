import { RegisterForm } from "@/components/auth/register-form";
import { Suspense } from "react";

const RegisterPage = () => {
  return (
    <div className='from-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-b p-6 md:p-10'>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
};

export default RegisterPage;
