import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GymMentorAI - Your AI Workout Companion",
  description: "Track your workouts, analyze your progress, and get personalized recommendations with GymMentorAI.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32 16x16', type: 'image/x-icon' },
      { url: '/dumbbell-favicon.svg', type: 'image/svg+xml' }
    ],
    apple: '/dumbbell-favicon.svg',
    shortcut: '/favicon.ico'
  }
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
                    storedTheme === '"dark"' || // next-themes stores values with quotes
                    (storedTheme === '"system"' && systemPrefersDark) ||
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
      <body className={`${inter.className} bg-theme-bg text-theme-fg border-theme-border`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
