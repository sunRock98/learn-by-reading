"use client";

import { AUTH_ROUTES } from "@/routes";
import { CardWrapper } from "./card-wrapper";
import { verifyEmail } from "@/actions/verify-email";
import { FormSuccess } from "../form-success";
import { TokenVerificationWrapper } from "./token-verification-wrapper";

export const EmailVerificationForm = () => {
  return (
    <CardWrapper
      headelLabel={"Confirming your verification"}
      backButtonLabel={"Back to login"}
      backButtonHref={AUTH_ROUTES.LOGIN}
    >
      <div className='flex w-full items-center justify-center'>
        <TokenVerificationWrapper callback={verifyEmail}>
          <FormSuccess message='Your email has been verified!' />
        </TokenVerificationWrapper>
      </div>
    </CardWrapper>
  );
};
