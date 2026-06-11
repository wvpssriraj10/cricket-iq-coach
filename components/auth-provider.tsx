'use client';

import React, { createContext, useContext } from 'react';

type Profile = {
  role: 'coach' | 'player' | 'admin';
  player_id: string | null;
};

type AuthContextType = {
  user: any;
  profile: Profile;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, user, profile }: { children: React.ReactNode, user: any, profile: Profile }) {
  return (
    <AuthContext.Provider value={{ user, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
