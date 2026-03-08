import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import SetupBanner from "@/components/SetupBanner";

export const metadata: Metadata = {
  title: "Барахолка — объявления",
  description: "Купи и продай что угодно",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <Navbar />
        <SetupBanner />
        <main className="max-w-6xl mx-auto px-4 py-4 pb-20 sm:pb-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
