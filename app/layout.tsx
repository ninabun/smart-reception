import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Labour Room Reception",
  description: "AI-ready smart reception for patient and visitor support."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
