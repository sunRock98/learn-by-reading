import { ReactNode } from "react";
import { signOut } from "next-auth/react";

export const LogoutButton = ({ children }: { children: ReactNode }) => {
  return (
    <div className='cursor-pointer' onClick={() => signOut()}>
      {children}
    </div>
  );
};
