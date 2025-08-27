import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Puros - Premium Cigar Hub",
  description: "Share cigar reviews and discover new premium cigars",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}>
        <MantineProvider
          defaultColorScheme="dark"
          theme={{
            colors: {
              brand: [
                '#fff8dc',
                '#ffedba',
                '#ffe39c',
                '#ffd97d',
                '#ffce5f',
                '#ffc444',
                '#ffb829',
                '#f59e0b',
                '#d97706',
                '#92400e'
              ],
            },
            primaryColor: 'brand',
            defaultRadius: 'md',
            fontFamily: inter.style.fontFamily,
          }}
        >
          <ModalsProvider>
            <AuthProvider>
              <Notifications position="top-right" />
              <Script src="/optimizer-1-dev.min.js" strategy="beforeInteractive" />
              {children}
            </AuthProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
