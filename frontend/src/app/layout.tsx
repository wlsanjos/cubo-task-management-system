import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Orchestrator - Task Management",
  description: "Modern task management system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}