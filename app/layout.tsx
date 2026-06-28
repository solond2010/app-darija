import type { Metadata, Viewport } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AppInit } from "../components/AppInit";
import { NotificationSetup } from "../components/NotificationSetup";
import { CelebrationOverlay } from "../components/CelebrationOverlay";
import { Onboarding } from "../components/Onboarding";
import { TapFeedback } from "../components/TapFeedback";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Meshi - Aprende Darija",
  description: "Aprende Darija con Meshi el gato 🐱🇲🇦",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Meshi",
    startupImage: "/icon.png",
  },
  icons: {
    apple: "/icon.png",
    icon: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6B7A3F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${nunito.variable} ${fredoka.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col text-brand-dark overflow-x-hidden select-none">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('meshi-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`}
        </Script>
        <div className="aurora-bg" aria-hidden="true" />
        <AppInit />
        {children}
        <CelebrationOverlay />
        <Onboarding />
        <TapFeedback />
        <NotificationSetup />
      </body>
    </html>
  );
}
