import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import { DemoProvider } from '@/lib/demo-context';
import { ThemeProvider } from '@/lib/theme-context';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VervidFlow by Vervid",
  description: "Streamline your CRM experience with intelligent scheduling and automation for service-based businesses - by Vervid",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1YVE8DH7T1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1YVE8DH7T1');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <DemoProvider>
          <ThemeProvider>
            <Providers>
              {children}
            </Providers>
          </ThemeProvider>
        </DemoProvider>
      </body>
    </html>
  );
}
