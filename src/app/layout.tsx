import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginModalProvider } from '@/contexts/LoginModalContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import GlobalLoginModal from '@/components/GlobalLoginModal';
import Background3D from '@/components/Background3D';
import AIAssistant3D from '@/components/AIAssistant3D';

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agentra — Autonomous AI Agents Platform",
  description: "Transform your business with AI agents and interactive Maya Voice Assistant",
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white relative`}
      >
        <AuthProvider>
          <SettingsProvider>
            <LoginModalProvider>
              <Background3D />
              <div className="relative z-10">
                {children}
              </div>
              <AIAssistant3D />
              <GlobalLoginModal />
            </LoginModalProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
