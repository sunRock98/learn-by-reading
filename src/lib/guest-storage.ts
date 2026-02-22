const STORAGE_KEYS = {
  INTERESTS: "guest_interests",
  LANGUAGE: "guest_language",
  LEVEL: "guest_level",
  TEXTS: "guest_texts",
  TEXT_COUNT: "guest_text_count",
  ONBOARDING_COMPLETE: "guest_onboarding_complete",
} as const;

export const MAX_GUEST_TEXTS = 2;

export interface GuestLanguage {
  id: number;
  name: string;
  code: string;
}

export interface GuestLevel {
  id: number;
  name: string;
}

export interface GuestText {
  id: string;
  title: string;
  content: string;
  translations: { word: string; translation: string }[];
  createdAt: string;
  topic?: string;
}

export interface GuestData {
  interests: string[];
  language: GuestLanguage | null;
  level: GuestLevel | null;
  texts: GuestText[];
  textCount: number;
  onboardingComplete: boolean;
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage might be full or unavailable
  }
}

// Interests
export function getGuestInterests(): string[] {
  return getItem<string[]>(STORAGE_KEYS.INTERESTS, []);
}

export function setGuestInterests(interests: string[]): void {
  setItem(STORAGE_KEYS.INTERESTS, interests);
}

// Language
export function getGuestLanguage(): GuestLanguage | null {
  return getItem<GuestLanguage | null>(STORAGE_KEYS.LANGUAGE, null);
}

export function setGuestLanguage(language: GuestLanguage): void {
  setItem(STORAGE_KEYS.LANGUAGE, language);
}

// Level
export function getGuestLevel(): GuestLevel | null {
  return getItem<GuestLevel | null>(STORAGE_KEYS.LEVEL, null);
}

export function setGuestLevel(level: GuestLevel): void {
  setItem(STORAGE_KEYS.LEVEL, level);
}

// Texts
export function getGuestTexts(): GuestText[] {
  return getItem<GuestText[]>(STORAGE_KEYS.TEXTS, []);
}

export function addGuestText(text: GuestText): void {
  const texts = getGuestTexts();
  texts.push(text);
  setItem(STORAGE_KEYS.TEXTS, texts);
  setItem(STORAGE_KEYS.TEXT_COUNT, texts.length);
}

export function getGuestTextCount(): number {
  return getItem<number>(STORAGE_KEYS.TEXT_COUNT, 0);
}

export function canGuestGenerateText(): boolean {
  return getGuestTextCount() < MAX_GUEST_TEXTS;
}

// Onboarding complete
export function isOnboardingComplete(): boolean {
  return getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE, false);
}

export function setOnboardingComplete(complete: boolean): void {
  setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, complete);
}

// Get all guest data at once
export function getGuestData(): GuestData {
  return {
    interests: getGuestInterests(),
    language: getGuestLanguage(),
    level: getGuestLevel(),
    texts: getGuestTexts(),
    textCount: getGuestTextCount(),
    onboardingComplete: isOnboardingComplete(),
  };
}

// Clear all guest data (e.g., after user creates an account)
export function clearGuestData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
