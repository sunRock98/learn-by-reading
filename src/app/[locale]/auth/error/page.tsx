import { ErrorCard } from "@/components/auth/error-card";
import React from "react";

const AuthErrorPage = () => {
  return (
    <div className='from-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-b p-6 md:p-10'>
      <ErrorCard />
    </div>
  );
};

export default AuthErrorPage;
