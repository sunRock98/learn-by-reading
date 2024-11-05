"use client";

import { FaUser } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { BackpackIcon, ExitIcon, GearIcon } from "@radix-ui/react-icons";
import { LogoutButton } from "./logout-button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/routes";

export const UserButton = () => {
  const t = useTranslations("TopBar");
  const currentUser = useCurrentUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={currentUser?.image || ""} />
          <AvatarFallback className='bg-blue-800'>
            <FaUser className='text-white' />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Link href={ROUTES.LanguageSetting}>
          <DropdownMenuItem>
            <BackpackIcon className='mr-2 h-5 w-5' />
            {t("languageSettings")}
          </DropdownMenuItem>
        </Link>
        <Link href={ROUTES.Settings}>
          <DropdownMenuItem>
            <GearIcon className='mr-2 h-5 w-5' />
            {t("settings")}
          </DropdownMenuItem>
        </Link>
        <LogoutButton>
          <DropdownMenuItem>
            <ExitIcon className='mr-2 h-5 w-5' />
            {t("logout")}
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
