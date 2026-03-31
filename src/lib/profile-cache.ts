import type { UserProfile } from "@/types";

let _profile: UserProfile | null = null;
let _fetched = false;

export function getCachedProfile(): UserProfile | null {
  return _profile;
}

export function isCachedProfileFetched(): boolean {
  return _fetched;
}

export function setCachedProfile(profile: UserProfile | null): void {
  _profile = profile;
  _fetched = true;
}
