import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type Props = {
  callback: (_token: string) => Promise<
    | {
        error: string;
        success?: undefined;
      }
    | {
        success: string;
        error?: undefined;
      }
  >;
};

export const useVerifyTokenFromParam = ({ callback }: Props) => {
  const t = useTranslations("tokenVerification");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const searchParam = useSearchParams();
  const token = searchParam.get("token");

  const verifyToken = useCallback(() => {
    if (!token) {
      setError(t("errors.missingToken"));
      return;
    }

    callback(token)
      .then((res) => {
        if (res.error) {
          setError(t("errors.invalidToken"));
        } else {
          setSuccess(t("success.tokenVerified"));
        }
      })
      .catch(() => {
        setError(t("errors.sthWentWrong"));
      });
  }, [token, callback, t]);

  useEffect(() => {
    if (error || success) {
      return;
    }

    verifyToken();
  }, [verifyToken, error, success]);

  return { errorMessage: error, successMessage: success };
};
