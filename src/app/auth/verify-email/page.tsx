import React, { Suspense } from "react";
import { EmailVerificationForm } from "@/components/auth/email-verification-form";

const VerifyEmailPage = () => {
  return (
    <Suspense>
      <EmailVerificationForm />
    </Suspense>
  );
};

export default VerifyEmailPage;
