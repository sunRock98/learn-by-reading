import React, { Suspense } from "react";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { AUTH_ROUTES } from "@/routes";
import { TokenVerificationWrapper } from "@/components/auth/token-verification-wrapper";
import { verifyResetToken } from "@/actions/verify-reset-token";

const NewPasswordPage = () => {
  return (
    <CardWrapper
      headelLabel={"Enter your new password"}
      backButtonLabel={"Back to login"}
      backButtonHref={AUTH_ROUTES.LOGIN}
    >
      <div className='flex w-full items-center justify-center'>
        <Suspense fallback='Loading...'>
          <TokenVerificationWrapper callback={verifyResetToken}>
            <NewPasswordForm />
          </TokenVerificationWrapper>
        </Suspense>
      </div>
    </CardWrapper>
  );
};

export default NewPasswordPage;
