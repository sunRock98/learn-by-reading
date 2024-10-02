"use client";

import { Link } from "@/i18n/routing";
import { Button } from "../ui/button";

type Props = {
  label: string;
  href: string;
};

export const BackButton = ({ label, href }: Props) => {
  return (
    <Button variant={"link"} size={"sm"} className='w-full font-normal' asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
};
