import type { Metadata } from "next";
import { Bricolage_Grotesque, Nunito, Oi, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import InitUser from "@/components/InitUser"
import Script from "next/script"

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const oi = Oi({
  variable: "--font-oi",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIFT — Intelligent Search Powered by AI",
  description: "Your AI-powered search agent that understands context, learns from your data, and delivers precise answers across all your connected sources — instantly.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${nunito.variable} ${oi.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <InitUser />
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
