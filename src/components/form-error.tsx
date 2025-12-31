import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export const FormError = ({ message }: { message: string | undefined }) => {
  if (!message) return null;
  return (
    <div className='bg-destructive/15 text-destructive flex items-center gap-x-2 rounded-md p-3 text-sm'>
      <ExclamationTriangleIcon className='h-4 w-4' />
      <p>{message}</p>
    </div>
  );
};
