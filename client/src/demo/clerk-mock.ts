/**
 * Mock of @clerk/clerk-react for demo mode.
 * Vite aliases this module in place of the real Clerk SDK when VITE_DEMO_MODE=true,
 * so no Clerk publishable key is needed and no network calls are made.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';

// ClerkProvider — just renders children, ignores all props
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}

// useAuth — always "loaded", never signed in (demo mode bypasses this check)
export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: false as const,
    userId: null,
    getToken: async () => null,
  };
}

// useUser — no Clerk user (demo mode uses its own display name)
export function useUser() {
  return { user: null, isLoaded: true };
}

// useClerk — stub with a no-op signOut
export function useClerk() {
  return { signOut: async () => {} };
}

// SignIn / SignUp pages — redirect straight to dashboard in demo mode
export function SignIn() {
  return React.createElement(Navigate, { to: '/dashboard', replace: true });
}

export function SignUp() {
  return React.createElement(Navigate, { to: '/dashboard', replace: true });
}

// heIL localization — not used in demo mode
export const heIL = {};
