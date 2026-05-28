import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata = {
  title: "Life OS",
  description: "Tu centro de mando personal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geist.variable} ${geistMono.variable} ${geist.className}`}>
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}
