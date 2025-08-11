import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickCourt - Book Sports Courts Instantly",
  description:
    "Find and book sports courts in your area. Swimming, Tennis, Cricket, Football, Volleyball, Basketball, Pickleball, Badminton, Table Tennis and more.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main>{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
