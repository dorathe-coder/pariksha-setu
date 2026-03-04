import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ParikshaSetu — Gujarat Exam Platform", template: "%s | ParikshaSetu" },
  description: "GPSC, Talati, GSSSB, Bin Sachivalay — Practice tests, mock tests, previous year papers for Gujarat competitive exams",
  keywords: "GPSC, Talati, GSSSB, Gujarat exam, competitive exam, mock test, previous year",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="gu">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
