import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Praxis Demir & Kollegen",
  description: "Online-Terminportal der Praxis Demir & Kollegen",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
