"use client";
import {
  useVerifyTokenFromParam,
  type Props as useVerifyTokenFromParamProps,
} from "@/hooks/use-verify-token-from-param";
import { BeatLoader } from "react-spinners";
import { FormError } from "../form-error";

type Props = {
  children: React.ReactNode;
  callback: useVerifyTokenFromParamProps["callback"];
};

export const TokenVerificationWrapper = ({ callback, children }: Props) => {
  const { errorMessage: error, successMessage: success } =
    useVerifyTokenFromParam({ callback });

  return (
    <>
      {!error && !success && <BeatLoader />}
      {success && children}
      {!success && <FormError message={error} />}
    </>
  );
};
