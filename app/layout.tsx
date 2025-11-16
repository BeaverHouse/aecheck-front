"use client";

import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Google Analytics
    const script1 = document.createElement('script');
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-J7KTFCS1GH';
    script1.async = true;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-J7KTFCS1GH');
    `;
    document.head.appendChild(script2);

    // SPA GitHub Pages script
    if (window.location.search[1] === '/') {
      const decoded = window.location.search
        .slice(1)
        .split('&')
        .map((s) => s.replace(/~and~/g, '&'))
        .join('?');
      window.history.replaceState(
        null,
        '',
        window.location.pathname.slice(0, -1) + decoded + window.location.hash
      );
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <title>AE Check - Another Eden Collection Tracker</title>
        <meta name="description" content="AE Check - Another Eden Collection Tracker" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=0, maximum-scale=1, minimum-scale=1"
        />
      </head>
      <body>
        <noscript>AE Check - Another Eden Collection Tracker</noscript>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
