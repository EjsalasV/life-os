import { Geist, Geist_Mono, Newsreader, Plus_Jakarta_Sans, Silkscreen, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/context/auth";
import ErrorBoundary from "@/app/components/ui/ErrorBoundary";
import WebVitalsReporter from "@/app/components/observability/WebVitalsReporter";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-ui"
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-ui"
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pixel"
});

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-pixel-soft"
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-editorial",
  weight: ["400", "500", "600"]
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-editorial-ui",
  weight: ["400", "500", "600", "700"]
});

export const metadata = {
  title: "Life OS",
  description: "Tu centro de mando personal",
  applicationName: "Life OS",
  appleWebApp: {
    capable: true,
    title: "Life OS",
    statusBarStyle: "default"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geist.variable} ${geistMono.variable} ${newsreader.variable} ${jakarta.variable} ${silkscreen.variable} ${pixelify.variable} ${geist.className}`}>
        <WebVitalsReporter />
        <ErrorBoundary>
          <AuthContextProvider>{children}</AuthContextProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
