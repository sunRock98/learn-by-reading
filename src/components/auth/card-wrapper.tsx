"use client";

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { BackButton } from "./back-button";
import { AuthHeader } from "./header";
import { Socials } from "./social-wrapper";

type Props = {
  children: React.ReactNode;
  headelLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
};
export const CardWrapper = ({
  children,
  headelLabel,
  backButtonHref,
  backButtonLabel,
  showSocial,
}: Props) => {
  return (
    <Card className='w-[400px] shadow-md'>
      <CardHeader>
        <AuthHeader label={headelLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Socials />
        </CardFooter>
      )}
      <CardFooter>
        <BackButton href={backButtonHref} label={backButtonLabel} />
      </CardFooter>
    </Card>
  );
};
