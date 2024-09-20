"use client";

import { AUTH_ROUTES } from "@/routes";
import { useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  _asChild?: boolean;
};

export const LoginButton: React.FC<Props> = ({
  children,
  mode = "redirect",
  _asChild = false,
}) => {
  const router = useRouter();
  const handleClick = () => {
    router.push(AUTH_ROUTES.LOGIN);
  };

  if (mode === "modal") {
    return <span>TODO: Implement modal</span>;
  }

  return (
    <span className='cursor-pointer' onClick={handleClick}>
      {children}
    </span>
  );
};
