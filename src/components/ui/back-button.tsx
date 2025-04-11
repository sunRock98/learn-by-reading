"use client";

import { Link } from "@/i18n/routing";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";

interface BackButtonProps {
  href: string;
  labelKey?: string;
  defaultLabel?: string;
  className?: string;
}

export function BackButton({
  href,
  labelKey,
  defaultLabel = "Back",
  className = "",
}: BackButtonProps) {
  const t = useTranslations("BackButton");

  // Use provided labelKey if it exists, otherwise use default key
  const label = labelKey
    ? t(labelKey, undefined) || defaultLabel
    : defaultLabel;

  return (
    <Link
      href={href}
      className={`inline-flex items-center text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 ${className}`}
    >
      <ChevronLeftIcon className='mr-1 h-4 w-4' />
      {label}
    </Link>
  );
}
