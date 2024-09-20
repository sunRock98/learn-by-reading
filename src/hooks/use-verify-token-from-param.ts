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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const searchParam = useSearchParams();
  const token = searchParam.get("token");

  const verifyToken = useCallback(() => {
    if (!token) {
      setError("Invalid token");
      return;
    }

    callback(token)
      .then((res) => {
        if (res.error) {
          setError("Invalid token");
        } else {
          setSuccess("Token has been verified");
        }
      })
      .catch(() => {
        setError("Something went wrong");
      });
  }, [token, callback]);

  useEffect(() => {
    if (error || success) {
      return;
    }

    verifyToken();
  }, [verifyToken, error, success]);

  return { errorMessage: error, successMessage: success };
};
