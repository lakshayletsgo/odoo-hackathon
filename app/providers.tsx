"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="dark" 
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          expand={false}
          visibleToasts={4}
        />
      </ThemeProvider>
    </SessionProvider>
  )
}
