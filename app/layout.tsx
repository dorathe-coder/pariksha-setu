import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/layout/ThemeProvider";

export const metadata: Metadata = {
  title: { default: "ParikshaSetu — Gujarat Exam Platform", template: "%s | ParikshaSetu" },
  description: "GPSC, Talati, GSSSB, Bin Sachivalay — Practice tests, mock tests, previous year papers for Gujarat competitive exams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="gu" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`
        }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
