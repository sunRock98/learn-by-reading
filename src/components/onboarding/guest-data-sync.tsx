"use client";

import { useEffect, useRef } from "react";
import {
  getGuestInterests,
  getGuestLanguage,
  getGuestLevel,
  clearGuestData,
} from "@/lib/guest-storage";
import { syncGuestData } from "@/actions/sync-guest-data";

export function GuestDataSync() {
  const hasSynced = useRef(false);

  useEffect(() => {
    if (hasSynced.current) return;

    const interests = getGuestInterests();
    const language = getGuestLanguage();
    const level = getGuestLevel();

    const hasGuestData =
      interests.length > 0 || language !== null || level !== null;

    if (!hasGuestData) return;

    hasSynced.current = true;

    syncGuestData({ interests, language, level })
      .then((result) => {
        if (result.success) {
          clearGuestData();
        }
      })
      .catch((err) => {
        console.error("Failed to sync guest data:", err);
        hasSynced.current = false;
      });
  }, []);

  return null;
}
