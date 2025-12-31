import React, { Suspense } from "react";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { AUTH_ROUTES } from "@/routes";
import { TokenVerificationWrapper } from "@/components/auth/token-verification-wrapper";
import { verifyResetToken } from "@/actions/verify-reset-token";
import { getTranslations } from "next-intl/server";

const NewPasswordPage = async () => {
  const t = await getTranslations("NewPasswordPage");
  return (
    <div className='from-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-b p-6 md:p-10'>
      <CardWrapper
        headerLabel={t("headerLabel")}
        backButtonLabel={t("backButtonLabel")}
        backButtonHref={AUTH_ROUTES.LOGIN}
      >
        <div className='flex w-full items-center justify-center'>
          <Suspense fallback={t("loading")}>
            <TokenVerificationWrapper callback={verifyResetToken}>
              <NewPasswordForm />
            </TokenVerificationWrapper>
          </Suspense>
        </div>
      </CardWrapper>
    </div>
  );
};

export default NewPasswordPage;
