import { Geist, Geist_Mono, Silkscreen, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/context/auth";

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

export const metadata = {
  title: "Life OS",
  description: "Tu centro de mando personal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geist.variable} ${geistMono.variable} ${silkscreen.variable} ${pixelify.variable} ${geist.className}`}>
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}
