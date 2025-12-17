import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance Pro",
  description: "Smart Finance Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Tambahkan suppressHydrationWarning={true} disini
    <html lang="en" translate="no" suppressHydrationWarning={true}>
      <body 
        className={`${font.className} bg-slate-50 text-slate-900 antialiased`}
        suppressHydrationWarning={true} // Tambahkan disini juga
      >
        {children}
      </body>
    </html>
  );
}