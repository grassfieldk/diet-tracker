"use client";

import { createContext, useContext, useState } from "react";
import type { UserProfile } from "@/types";

interface ProfileContextValue {
  profile: UserProfile | null;
  profileFetched: boolean;
  setProfile: (profile: UserProfile | null) => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  profileFetched: false,
  setProfile: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [profileFetched, setProfileFetched] = useState(false);

  const setProfile = (p: UserProfile | null) => {
    setProfileState(p);
    setProfileFetched(true);
  };

  return (
    <ProfileContext.Provider value={{ profile, profileFetched, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
