import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GymMentorAI - AI-Powered Workout Tracking",
  description: "Track your workouts with AI assistance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Get the stored theme from localStorage
                  const storedTheme = localStorage.getItem('gymmentor-theme');
                  
                  // Get the system preference
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  // Determine which theme to use
                  const shouldUseDarkTheme = 
                    storedTheme === 'dark' || 
                    (storedTheme === 'system' && systemPrefersDark) ||
                    (!storedTheme && systemPrefersDark);
                  
                  // Apply the theme
                  if (shouldUseDarkTheme) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.error('Error applying theme:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
