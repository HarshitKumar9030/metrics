import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import { AppRootProvider } from "@/components/providers/app-root-provider";
import "./globals.css";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Syne({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Harshit Metrics",
  description: "API-key based metrics platform with a TypeScript SDK and hosted docs.",
};

const GridBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-black" />
  </div>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const shell = (
    <>
      <header className="top-nav">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-display">M</div>
              Metrics
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400 md:flex ml-4">
              <Link href="/dashboard" prefetch={false} className="transition-colors hover:text-neutral-900 dark:hover:text-white">
                Dashboard
              </Link>
              <Link href="/docs" className="transition-colors hover:text-neutral-900 dark:hover:text-white">
                Docs
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {hasClerk ? (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="auth-btn-secondary text-sm px-4 py-2 font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md transition-colors">Sign in</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="auth-btn-primary text-sm px-4 py-2 font-medium bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-md transition-colors">Create account</button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </>
            ) : (
              <span className="text-xs text-[color:var(--text-faint)]">Set Clerk keys to enable auth</span>
            )}
          </div>
        </div>
      </header>
      {children}
    </>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased selection:bg-black/10 dark:selection:bg-white/30`}>
        <AppRootProvider>
          <GridBackground />
          {hasClerk ? <ClerkProvider>{shell}</ClerkProvider> : shell}
        </AppRootProvider>
      </body>
    </html>
  );
}
