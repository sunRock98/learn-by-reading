"use client";

import { FaUser } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  ExitIcon,
  GearIcon,
  DashboardIcon,
  BookmarkIcon,
} from "@radix-ui/react-icons";
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
      <DropdownMenuContent align='end'>
        <Link href={ROUTES.Dashboard}>
          <DropdownMenuItem>
            <DashboardIcon className='mr-2 h-5 w-5' />
            {t("dashboard")}
          </DropdownMenuItem>
        </Link>
        <Link href={ROUTES.Dictionary}>
          <DropdownMenuItem>
            <BookmarkIcon className='mr-2 h-5 w-5' />
            {t("dictionary")}
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
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
