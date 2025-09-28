import type { Metadata } from "next";
import { cookies } from 'next/headers'
import { Inter } from "next/font/google";
import "./globals.css";
import I18nClientProvider from "@/components/i18n/I18nClientProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { detectServerLocale } from "@/lib/locale";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Miracles - Share the World's Small Wonders",
  description: "Discover and share the small but meaningful miracles happening all around the world. Join our community of positivity and inspiration.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('locale')?.value
  const lang = detectServerLocale(cookieLocale)
  
  return (
    <html lang={lang}>
      <body className={inter.className}>
        <I18nClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </I18nClientProvider>
      </body>
    </html>
  );
}
