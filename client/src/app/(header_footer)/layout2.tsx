import type { Metadata } from "next";
import { Geist, Geist_Mono, Play, Barlow } from "next/font/google";

import "./globals.css";
import Header from "@/components/labchat/header";
import Footer from "@/components/labchat/footer";


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />

        {children}

        <Footer />
      </body>
    </html>
  );
}
