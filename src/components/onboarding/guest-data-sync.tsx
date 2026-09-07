"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getGuestInterests,
  getGuestLanguage,
  getGuestLevel,
  getGuestTexts,
  clearGuestData,
} from "@/lib/guest-storage";
import { syncGuestData } from "@/actions/sync-guest-data";

export function GuestDataSync() {
  const hasSynced = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (hasSynced.current) return;

    const interests = getGuestInterests();
    const language = getGuestLanguage();
    const level = getGuestLevel();
    const texts = getGuestTexts();

    const hasGuestData =
      interests.length > 0 ||
      language !== null ||
      level !== null ||
      texts.length > 0;

    if (!hasGuestData) return;

    hasSynced.current = true;

    syncGuestData({ interests, language, level, texts })
      .then((result) => {
        if (result.success) {
          clearGuestData();
          router.refresh();
        }
      })
      .catch((err) => {
        console.error("Failed to sync guest data:", err);
        hasSynced.current = false;
      });
  }, [router]);

  return null;
}
