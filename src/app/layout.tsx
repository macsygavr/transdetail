import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { SingletonQueryClientProvider } from "./providers";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Suspense } from "react";
import MobileNavbar from "../components/mobile-navbar";
import { Toaster } from "@/components/ui/sonner";
import { LanguagesContextProvider } from "@/providers/LanguageContext";
import { headers } from "next/headers";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-ubuntu",
});

export const metadata: Metadata = {
  title: "TRANSDETAIL",
  description: "TRANSDETAIL",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const languages = (
    typeof window !== "undefined"
      ? navigator.languages
      : (await headers())
          .get("accept-language")
          ?.split(",")
          .map((locale) => locale.split(";")[0].trim()) || []
  ) as string[];

  return (
    <html lang="ru">
      <body
        className={`${ubuntu.variable} antialiased min-h-screen flex flex-col`}
      >
        <div className="flex flex-col grow">
          <SingletonQueryClientProvider>
            <LanguagesContextProvider value={languages}>
              <Navbar />
              <main className="pt-[20px] pb-[80px] md:pb-[100px]">
                {children}
              </main>
              <Footer />
              <MobileNavbar />
              <Toaster position="top-center" richColors />
            </LanguagesContextProvider>
          </SingletonQueryClientProvider>
        </div>
      </body>
    </html>
  );
}
