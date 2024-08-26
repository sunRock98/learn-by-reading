const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex h-full items-center justify-center bg-gradient-to-tr from-blue-400 via-violet-600 to-blue-800'>
      {children}
    </div>
  );
};

export default AuthLayout;
