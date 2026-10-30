import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { preload } from "react-dom";
import { Analytics } from "@vercel/analytics/next";
import { LANDSCAPE_MEDIA, PORTRAIT_MEDIA, frameUrl } from "../lib/frames";
import "lenis/dist/lenis.css";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Folio | Design-led digital studio",
  description:
    "Design-led digital studio for founders and product teams. UX design, product strategy, and interface engineering for teams building software worth using — from early concept to scaled platform.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // First hero frame, from the same set VideoBackground picks for the screen shape
  preload(frameUrl("landscape", 0, 0), { as: "image", fetchPriority: "high", media: LANDSCAPE_MEDIA });
  preload(frameUrl("portrait", 0, 0), { as: "image", fetchPriority: "high", media: PORTRAIT_MEDIA });

  return (
    <html lang="en" className={`${dmSans.variable} ${bebasNeue.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <Analytics />
        {process.env.NODE_ENV === "production" && (
          // Microsoft Clarity (session recordings and heatmaps). lazyOnload keeps it off the critical path.
          <Script id="ms-clarity-loader" strategy="lazyOnload">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","x3okp6pdld");`}
          </Script>
        )}
      </body>
    </html>
  );
}
