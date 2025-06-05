import type { Metadata } from "next";
import { Geist, Geist_Mono, Play, Barlow } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"
import { siteConfig } from "@/config/site";

import "./globals.css";

// Importing fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const play = Play({
  variable: "--font-play",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  weight: ["400", "600", "700"], 
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
      default: siteConfig.name,
      template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
      icon: "/icon.ico",
    },
    openGraph: {
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.siteName,
      url: siteConfig.siteUrl,
      locale: siteConfig.locale,
    },
    metadataBase: new URL(siteConfig.siteUrl)
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${play.variable} ${barlow.variable} antialiased`} suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
      </body>
    </html>
  );
}
