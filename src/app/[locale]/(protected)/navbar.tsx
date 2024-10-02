import { UserButton } from "@/components/auth/user-button";

export const Navbar = () => {
  return (
    <div className='flex w-full items-center justify-between rounded-xl bg-white p-4 shadow-md'>
      <div className='flex gap-x-2'></div>
      <div>
        <UserButton />
      </div>
    </div>
  );
};
