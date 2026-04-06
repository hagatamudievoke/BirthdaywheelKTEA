import type { Metadata } from "next";
import { Archivo, Public_Sans } from "next/font/google";
import "./globals.css";

const heading = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const body = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Birthday Wheel Admin",
  description: "System Catalog themed Birthday Wheel application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
