import React, { Suspense } from "react";
import { EmailVerificationForm } from "@/components/auth/email-verification-form";

const VerifyEmailPage = () => {
  return (
    <div className='from-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-b p-6 md:p-10'>
      <Suspense>
        <EmailVerificationForm />
      </Suspense>
    </div>
  );
};

export default VerifyEmailPage;
