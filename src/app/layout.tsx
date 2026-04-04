import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "trbo. — Global Financial Passport",
  description: "Cross-border credit infrastructure for lenders and migrants",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
