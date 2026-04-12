// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CookieConsent } from "@/components/layout/CookieConsent";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DeepSlide - AI Destekli Sunum",
  description: "Konuşun, sunumunuz sizi takip etsin. AI destekli sesle kontrol edilen sunum uygulaması.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`dark ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {/* Editor Fontları — en popüler 30 Google Font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Open+Sans:wght@300;400;600;700;800&family=Montserrat:wght@300;400;500;600;700;800;900&family=Lato:wght@300;400;700;900&family=Poppins:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Merriweather:wght@300;400;700;900&family=Oswald:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700;800;900&family=Nunito:wght@300;400;600;700;800;900&family=Source+Sans+3:wght@300;400;600;700;900&family=Ubuntu:wght@300;400;500;700&family=Work+Sans:wght@300;400;500;600;700;800;900&family=Quicksand:wght@300;400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700;800;900&family=Rubik:wght@300;400;500;600;700;800;900&family=Libre+Baskerville:wght@400;700&family=Bebas+Neue&family=Dancing+Script:wght@400;500;600;700&family=Pacifico&family=Lobster&family=Anton&family=Caveat:wght@400;500;600;700&family=Comfortaa:wght@300;400;500;600;700&family=Abril+Fatface&family=Righteous&family=Permanent+Marker&family=Shadows+Into+Light&family=Indie+Flower&family=Satisfy&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
