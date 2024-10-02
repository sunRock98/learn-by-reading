"use client";

import { AUTH_ROUTES } from "@/routes";
import { CardWrapper } from "./card-wrapper";
import { verifyEmail } from "@/actions/verify-email";
import { FormSuccess } from "../form-success";
import { TokenVerificationWrapper } from "./token-verification-wrapper";
import { useTranslations } from "next-intl";

export const EmailVerificationForm = () => {
  const t = useTranslations("EmailVerificationForm");
  return (
    <CardWrapper
      headerLabel={t("headerLabel")}
      backButtonLabel={t("backButtonLabel")}
      backButtonHref={AUTH_ROUTES.LOGIN}
    >
      <div className='flex w-full items-center justify-center'>
        <TokenVerificationWrapper callback={verifyEmail}>
          <FormSuccess message={t("success")} />
        </TokenVerificationWrapper>
      </div>
    </CardWrapper>
  );
};
