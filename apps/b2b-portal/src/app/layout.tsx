import type { Metadata } from "next";
import { OfficeAuthProvider } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealEstate AI — Office Portal",
  description: "Manage listings and AI-qualified leads.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OfficeAuthProvider>{children}</OfficeAuthProvider>
      </body>
    </html>
  );
}
