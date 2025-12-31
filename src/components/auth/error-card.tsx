import React from "react";
import { CardWrapper } from "./card-wrapper";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { AUTH_ROUTES } from "@/routes";

export const ErrorCard = () => {
  return (
    <CardWrapper
      headerLabel={"Oops! Something went wrong!"}
      backButtonLabel={"Back to login"}
      backButtonHref={AUTH_ROUTES.LOGIN}
    >
      <div className='flex w-full items-center justify-center'>
        <ExclamationTriangleIcon className='text-destructive h-10 w-10 text-red-500' />
      </div>
    </CardWrapper>
  );
};
