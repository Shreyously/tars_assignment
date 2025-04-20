import "@/app/globals.css"
import { Inter as FontSans } from "next/font/google"
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"
import { Toaster } from "sonner"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Modern Notes App</title>
        <meta name="description" content="A modern note-taking application" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased selection:bg-primary/20",
          fontSans.variable,
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#9333ea_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#9333ea_100%)]" />
            <div className="flex-1 flex">
              <main className="flex-1">
                <div className="container w-full ">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
              className: 'glass',
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
