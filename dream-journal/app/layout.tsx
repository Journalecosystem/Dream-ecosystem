import type { Metadata } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "./globals.css";
import { TextSizeControl } from "@/components/ui/TextSizeControl";

export const metadata: Metadata = {
  title: "Dream Journal",
  description:
    "A quiet place to record, examine, and process your dreams over time.",
};

// Applies the saved text size before the page paints, so people who need
// larger text never see a flash of small text. Kept tiny and wrapped in
// try/catch because storage can be unavailable.
const applyTextSize = `try{var s=localStorage.getItem("dj-text-size");if(s==="large"||s==="largest"){document.documentElement.setAttribute("data-text-size",s)}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the script above may add data-text-size to
    // <html> before React hydrates, which is intentional.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: applyTextSize }} />
      </head>
      <body className="antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <TextSizeControl />
        {children}
      </body>
    </html>
  );
}
