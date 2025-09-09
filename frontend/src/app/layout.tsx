import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DC2 - Privacy-Focused Discord",
  description: "A privacy-focused Discord alternative with end-to-end encryption",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
