"use client";

import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";

export function AppRootProvider({ children }: { children: ReactNode }) {
  return <RootProvider theme={{ enabled: false }}>{children}</RootProvider>;
}