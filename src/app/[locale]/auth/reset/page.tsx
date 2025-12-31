import { Suspense } from "react";
import { ResetForm } from "@/components/auth/reset-form";

const ResetPage = () => {
  return (
    <div className='from-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-b p-6 md:p-10'>
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
};

export default ResetPage;
