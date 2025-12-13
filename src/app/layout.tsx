import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginModalProvider } from '@/contexts/LoginModalContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import GlobalLoginModal from '@/components/GlobalLoginModal';

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agentra — The Smart AI Agents Platform",
  description: "Transform your business with AI agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SettingsProvider>
            <LoginModalProvider>
              {children}
              <GlobalLoginModal />
            </LoginModalProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
